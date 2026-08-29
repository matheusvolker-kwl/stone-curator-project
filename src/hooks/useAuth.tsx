import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { clearCatalogCache } from "@/lib/woocommerce/queries";


type PartnerStatus = "pending" | "approved" | "rejected" | null;

interface AuthCtx {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isPartner: boolean;       // logged in (any role with profile)
  isApproved: boolean;      // partner_profiles.status = approved
  isAdmin: boolean;
  partnerStatus: PartnerStatus;
  empresa: string | null;
  /** Senha atual foi definida pelo admin: o parceiro precisa trocar antes de usar a conta. */
  senhaProvisoria: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState<PartnerStatus>(null);
  const [empresa, setEmpresa] = useState<string | null>(null);
  const [senhaProvisoria, setSenhaProvisoria] = useState(false);

  const loadProfile = async (uid: string | null) => {
    if (!uid) {
      setIsAdmin(false);
      setPartnerStatus(null);
      setEmpresa(null);
      setSenhaProvisoria(false);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    const [{ data: roles }, { data: profile }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("partner_profiles").select("status, empresa").eq("user_id", uid).maybeSingle(),
    ]);
    setIsAdmin(!!roles?.some((r) => r.role === "admin"));
    setPartnerStatus((profile?.status as PartnerStatus) ?? null);
    setEmpresa(profile?.empresa ?? null);

    /* Consulta SEPARADA de proposito, e nao mais uma coluna na de cima.
     * Se esta coluna faltar (cache de schema velho logo apos a migracao, ou
     * ambiente sem ela), juntar as duas derrubaria a consulta INTEIRA — e com
     * ela `status`, que decide quem e parceiro aprovado. Os 28 parceiros
     * perderiam o acesso ao preco de atacado de uma vez.
     * Aqui a falha custa no maximo nao exibir a tela de troca obrigatoria. */
    try {
      const { data: marca } = await supabase
        .from("partner_profiles")
        .select("senha_provisoria_em")
        .eq("user_id", uid)
        .maybeSingle();
      setSenhaProvisoria(Boolean(marca?.senha_provisoria_em));
    } catch {
      setSenhaProvisoria(false);
    }
    setProfileLoading(false);
  };

  useEffect(() => {
    // Listener FIRST (sync), then getSession
    const { data: sub } = supabase.auth.onAuthStateChange((evt, s) => {
      setSession(s);
      if (evt === "SIGNED_IN" || evt === "SIGNED_OUT") clearCatalogCache();
      if (s?.user?.id) setProfileLoading(true);
      // defer profile fetch to avoid deadlock
      setTimeout(() => loadProfile(s?.user?.id ?? null), 0);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadProfile(data.session?.user?.id ?? null).finally(() => setLoading(false));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const refresh = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    await loadProfile(data.session?.user?.id ?? null);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
    setPartnerStatus(null);
    setEmpresa(null);
    setProfileLoading(false);
  };

  // ── Preço não pode ter delay pós-login/aprovação ───────────────────────────
  // O react-query cacheia o catálogo por 5 min (staleTime). Se o cliente viu os
  // produtos como visitante (sem preço) e depois logou/foi aprovado, o cache
  // continuava servindo os dados SEM preço. Aqui, sempre que a identidade OU a
  // aprovação muda, derrubamos o catálogo interno E invalidamos o react-query —
  // ele rebusca com o novo JWT e o preço aparece na hora. (Só em transição, via
  // ref: não refaz fetch a cada render nem no 1º load.)
  const queryClient = useQueryClient();
  const prevAuthKey = useRef<string>("");
  useEffect(() => {
    const approved = partnerStatus === "approved" || isAdmin;
    const key = `${session?.user?.id ?? "anon"}:${approved}`;
    if (prevAuthKey.current && prevAuthKey.current !== key) {
      clearCatalogCache();
      void queryClient.invalidateQueries();
    }
    prevAuthKey.current = key;
  }, [session?.user?.id, partnerStatus, isAdmin, queryClient]);

  const value: AuthCtx = {
    session,
    user: session?.user ?? null,
    loading: loading || (!!session && profileLoading),
    isPartner: !!session,
    isApproved: partnerStatus === "approved" || isAdmin,
    isAdmin,
    partnerStatus,
    empresa,
    senhaProvisoria,
    refresh,
    signOut,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
