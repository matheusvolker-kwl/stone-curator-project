import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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

  const loadProfile = async (uid: string | null) => {
    if (!uid) {
      setIsAdmin(false);
      setPartnerStatus(null);
      setEmpresa(null);
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
    setProfileLoading(false);
  };

  useEffect(() => {
    // Listener FIRST (sync), then getSession
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
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

  const value: AuthCtx = {
    session,
    user: session?.user ?? null,
    loading: loading || (!!session && profileLoading),
    isPartner: !!session,
    isApproved: partnerStatus === "approved" || isAdmin,
    isAdmin,
    partnerStatus,
    empresa,
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
