import { Link } from "react-router-dom";
import logo from "@/assets/logo-horizontal-bege.png";
import iconePedra from "@/assets/icone-pedra-bege.png";

export default function Footer() {
  return (
    <footer className="surface-forest border-t border-western-gold/15 mt-0 pt-20 pb-12">
      <div className="container-western">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <img src={logo} alt="Western" className="h-9 w-auto mb-6" />
            <p className="text-western-cream-muted max-w-md leading-relaxed">
              Curadoria de pedras autorais para profissionais exigentes.
              Composto mineral fabricado peça a peça em São Paulo.
            </p>
          </div>

          <div>
            <h4 className="text-eyebrow mb-5">Catálogo</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/linhas" className="link-underline text-western-cream">Linhas</Link></li>
              <li><Link to="/colecoes" className="link-underline text-western-cream">Coleções</Link></li>
              <li><Link to="/guia-de-compra" className="link-underline text-western-cream">Guia de compra</Link></li>
              <li><Link to="/sobre" className="link-underline text-western-cream">Sobre</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-eyebrow mb-5">Parceiro</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/parceiro/cadastro" className="link-underline text-western-cream">Cadastro B2B</Link></li>
              <li><Link to="/parceiro/login" className="link-underline text-western-cream">Acessar conta</Link></li>
              <li>
                <a href="https://wa.me/5511993403485" target="_blank" rel="noopener noreferrer" className="link-underline text-western-cream">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href="https://instagram.com/westernpools" target="_blank" rel="noopener noreferrer" className="link-underline text-western-cream">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6 pt-10 border-t border-western-gold/10">
          <div className="flex items-center gap-6">
            <img src={iconePedra} alt="" className="h-7 w-auto opacity-70" />
            <div className="text-spec text-western-cream-muted">Garantia 1 ano</div>
            <div className="text-spec text-western-cream-muted">Fabricação nacional</div>
            <div className="text-spec text-western-cream-muted">Produção 15 dias</div>
          </div>
          <p className="text-spec text-western-cream-muted">
            © {new Date().getFullYear()} Western · São Paulo · Brasil
          </p>
        </div>
      </div>
    </footer>
  );
}
