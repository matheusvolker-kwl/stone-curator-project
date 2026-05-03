import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PartnerLogin() {
  return (
    <div className="surface-cream">
      <div className="container-western py-20 md:py-28 max-w-md">
        <p className="text-eyebrow mb-5">Acesso de parceiro</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="font-display text-4xl md:text-5xl text-western-green-deep leading-[1.05] mb-12">
          Entrar.
        </h1>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <Label htmlFor="email" className="text-eyebrow mb-3 block">E-mail</Label>
            <Input
              id="email"
              type="email"
              className="h-12 bg-transparent border-western-stone-warm/30 rounded-none text-western-green-deep focus-visible:border-western-gold"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-eyebrow mb-3 block">Senha</Label>
            <Input
              id="password"
              type="password"
              className="h-12 bg-transparent border-western-stone-warm/30 rounded-none text-western-green-deep focus-visible:border-western-gold"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-xs uppercase tracking-[0.25em] rounded-none"
          >
            Entrar
          </Button>
        </form>

        <p className="text-spec text-western-stone-warm mt-8 text-center">
          Ainda não é parceiro?{" "}
          <Link to="/parceiro/cadastro" className="link-underline text-western-gold">
            Solicite cadastro
          </Link>
        </p>
      </div>
    </div>
  );
}
