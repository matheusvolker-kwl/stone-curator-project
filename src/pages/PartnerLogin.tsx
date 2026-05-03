import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PartnerLogin() {
  return (
    <div className="container-western py-20 md:py-28 max-w-md">
      <p className="text-eyebrow mb-5">Acesso de parceiro</p>
      <h1 className="font-display text-4xl md:text-5xl text-western-cream leading-[1.05] mb-12">
        Entrar.
      </h1>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div>
          <Label htmlFor="email" className="text-eyebrow !text-western-gold-soft mb-3 block">
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            className="h-12 bg-transparent border-western-gold/25 rounded-none text-western-cream focus-visible:border-western-gold"
          />
        </div>
        <div>
          <Label htmlFor="password" className="text-eyebrow !text-western-gold-soft mb-3 block">
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            className="h-12 bg-transparent border-western-gold/25 rounded-none text-western-cream focus-visible:border-western-gold"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-western-gold text-western-green-deep hover:bg-western-gold-soft font-mono text-xs uppercase tracking-[0.25em] rounded-none"
        >
          Entrar
        </Button>
      </form>

      <p className="text-spec text-western-cream-muted mt-8 text-center">
        Ainda não é parceiro?{" "}
        <Link to="/parceiro/cadastro" className="link-underline text-western-gold-soft">
          Solicite cadastro
        </Link>
      </p>

      {/* TODO: integrar com Shopify Customer Account API */}
    </div>
  );
}
