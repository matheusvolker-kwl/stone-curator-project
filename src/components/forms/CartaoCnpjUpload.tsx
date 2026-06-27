import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, FileCheck2 } from "lucide-react";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

interface Props {
  userId: string;
  onUploaded: (path: string) => void;
  disabled?: boolean;
}

export default function CartaoCnpjUpload({ userId, onUploaded, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (file.size > MAX_BYTES) {
      setError("Arquivo acima de 5 MB.");
      return;
    }
    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Envie JPG, PNG, WEBP ou PDF.");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("cartoes-cnpj")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      setFilename(file.name);
      onUploaded(path);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        className="w-full h-12 border border-western-stone-warm/30 hover:border-western-gold transition-colors flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-western-green-deep disabled:opacity-50"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : filename ? <FileCheck2 className="h-4 w-4 text-western-gold" /> : <Upload className="h-4 w-4" />}
        {uploading ? "Enviando..." : filename ?? "Enviar Cartão CNPJ"}
      </button>
      {error && (
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{error}</p>
      )}
      <p className="mt-2 text-[11px] text-western-stone-warm">
        JPG, PNG, WEBP ou PDF até 5 MB. Documento usado apenas para conferência interna.
      </p>
    </div>
  );
}
