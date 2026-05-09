import LegalPage from "@/components/legal/LegalPage";

export default function TrocasAvarias() {
  return (
    <LegalPage eyebrow="Trocas e avarias" titulo="O que cobre, e como acionar." atualizadoEm="maio de 2026">
      <p>
        Cada peça Western é fabricada artesanalmente, com variação cromática esperada entre
        peças do mesmo acabamento — essa variação é parte do produto, não um defeito. Para
        avarias de transporte, defeitos de fabricação ou divergências de pedido, seguimos o
        processo abaixo.
      </p>

      <h2>Garantia de fabricação</h2>
      <p>
        5 anos contra defeitos de fabricação a partir da data de emissão da nota fiscal. Cobre
        falhas estruturais e de pintura não atribuíveis a uso indevido, exposição química
        anormal ou intempérie atípica.
      </p>

      <h2>Avarias de transporte</h2>
      <ul>
        <li>
          Devem ser registradas no canhoto da nota fiscal no ato do recebimento, com fotos
          enviadas em até 24h.
        </li>
        <li>
          A Western produz peça de reposição equivalente, sem custo adicional para o parceiro,
          dentro do prazo padrão de produção.
        </li>
        <li>
          Avarias não registradas no recebimento não podem ser pleiteadas — a transportadora é
          responsável pelo trecho de entrega.
        </li>
      </ul>

      <h2>Defeitos de fabricação</h2>
      <ul>
        <li>
          Notificação por escrito ao comercial Western, com fotos e número da nota fiscal.
        </li>
        <li>
          Análise técnica em até 5 dias úteis. Se confirmado o defeito, a Western produz a peça
          de reposição ou restitui o valor proporcional.
        </li>
      </ul>

      <h2>O que não é coberto</h2>
      <ul>
        <li>Variação cromática natural entre peças artesanais.</li>
        <li>Manchas decorrentes de exposição química incompatível (ácidos fora de norma, solventes industriais).</li>
        <li>Danos causados por instalação inadequada, fora das instruções do manual.</li>
        <li>Marcas naturais de envelhecimento — musgo, pátina, oxidação ambiental — que são, na verdade, valorização estética.</li>
      </ul>

      <h2>Trocas por desistência</h2>
      <p>
        Por se tratar de produção sob encomenda, peças entregues conforme especificado na ordem
        de compra não estão sujeitas a troca por arrependimento.
      </p>
    </LegalPage>
  );
}
