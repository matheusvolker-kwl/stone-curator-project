import LegalPage from "@/components/legal/LegalPage";
import { BUSINESS } from "@/config/business";

export default function PoliticaPrivacidade() {
  return (
    <LegalPage eyebrow="Privacidade" titulo="Como tratamos os seus dados." atualizadoEm="maio de 2026">
      <p>
        A Western Pools respeita a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018) e
        coleta apenas os dados necessários para credenciar parceiros B2B, processar pedidos e
        manter contato comercial.
      </p>

      <h2>Dados que coletamos</h2>
      <ul>
        <li>Identificação profissional: nome, e-mail, telefone, CNPJ e razão social.</li>
        <li>Dados de projeto informados voluntariamente em formulários (orçamento, amostras, visita).</li>
        <li>Dados de navegação básicos (cookies analíticos) para melhorar o site.</li>
      </ul>

      <h2>Como usamos</h2>
      <ul>
        <li>Aprovar credenciamento e habilitar tabela B2B.</li>
        <li>Processar pedidos, emitir nota fiscal e organizar logística.</li>
        <li>Enviar comunicações relacionadas ao seu cadastro e, opcionalmente, novidades de catálogo.</li>
      </ul>

      <h2>Com quem compartilhamos</h2>
      <p>
        Apenas com parceiros operacionais estritamente necessários: contabilidade, transportadora
        contratada pelo parceiro, plataforma de e-mail e infraestrutura de hospedagem. Nunca
        vendemos ou cedemos dados a terceiros para fins de marketing.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode solicitar acesso, correção, exclusão ou portabilidade dos seus dados a qualquer
        momento por e-mail para <a href={`mailto:${BUSINESS.emailComercial}`}>{BUSINESS.emailComercial}</a>.
      </p>

      <h2>Cookies</h2>
      <p>
        Usamos cookies essenciais para autenticação e cookies analíticos para entender o uso do
        site. Você pode desativar cookies não-essenciais nas configurações do seu navegador.
      </p>

      <h2>Encarregado de dados</h2>
      <p>
        Encarregado: equipe Western Pools · Contato: <a href={`mailto:${BUSINESS.emailComercial}`}>{BUSINESS.emailComercial}</a>.
      </p>
    </LegalPage>
  );
}
