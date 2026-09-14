# -*- coding: utf-8 -*-
import json, os
M = json.load(open('margins.json')) if os.path.exists('margins.json') else {}
def m(key, default):
    v = M.get(key, default)
    return f'margin-top:{v:.2f}pt'

TUNE = [
 ("t_runpad",      37.5, ".runhead{{padding-top:{v}pt}}"),
 ("t_paypad",       6.2, "table.pay td{{padding-top:{v}pt}}"),
 ("t_paypadb",      6.4, "table.pay td{{padding-bottom:{v}pt}}"),
 ("t_paylab",       6.9, "table.pay td.l{{padding-top:{v}pt}}"),
 ("t_paytop",       6.0, "table.pay{{margin-top:{v}pt}}"),
 ("t_thpad",       10.0, "table.sales th{{padding-top:{v}pt}}"),
 ("t_ghost",       41.9, ".phead .ghost{{top:{v}pt}}"),
 ("t_ptt",          8.4, ".phead .tt{{top:{v}pt}}"),
 ("t_psub",         9.9, ".phead .sub{{margin-top:{v}pt}}"),
 ("t_badge",       39.0, ".badge{{top:{v}pt}}"),
 ("t_desc",        10.5, ".desc{{margin-top:{v}pt}}"),
 ("t_specv",       11.6, ".specs .v{{margin-top:{v}pt}}"),
 ("t_prices",       9.0, ".prices{{margin-top:{v}pt}}"),
 ("t_pricecol",    16.9, ".prices .col{{padding-top:{v}pt}}"),
 ("t_pricev",      16.2, ".prices .v{{margin-top:{v}pt}}"),
 ("t_pricen",       9.75, ".prices .n{{margin-top:{v}pt}}"),
 ("t_inst",         8.25, "table.inst{{margin-top:{v}pt}}"),
 ("t_tonhead",     20.6, ".tonhead{{margin-top:{v}pt}}"),
 ("t_tones",        3.75, ".tones{{margin-top:{v}pt}}"),
 ("t_tonelbl",      5.6, ".tones .t{{margin-top:{v}pt}}"),
 ("t_steps",       14.25, ".steps{{margin-top:{v}pt}}"),
 ("t_steptop",      9.75, ".step{{padding-top:{v}pt}}"),
 ("t_stepbot",     10.5, ".step{{padding-bottom:{v}pt}}"),
 ("t_stepp",        6.3, ".step p{{margin-top:{v}pt}}"),
 ("t_cols",        14.5, ".cols{{margin-top:{v}pt}}"),
 ("t_colsh",        6.6, ".cols .h{{padding-bottom:{v}pt}}"),
 ("t_person",      11.6, ".person{{padding-top:{v}pt}}"),
 ("t_faq",         11.6, ".faq{{padding-top:{v}pt}}"),
 ("t_title1",      -0.035, "h1.title{{letter-spacing:{v}em}}"),
]
def tunecss():
    out=[]
    for k,d,tpl in TUNE:
        out.append(tpl.format(v=round(M.get(k,d),3)))
    return "<style>"+ "".join(out) + "</style>"

FOOT = """<div class="foot">
  <div class="foot-co">Western Pools Indústria e Comércio de Artefatos de Cimentos LTDA<br>71.530.059/0001-30</div>
  <div class="foot-mid"><img class="w" src="assets/western.png" alt="Western"><div class="div"></div><img class="a" src="assets/arboreal-logotipo.png" alt="ArboREAL"><div class="div"></div><img class="h" src="assets/hio.png" alt="HIO"></div>
  <div class="foot-pg">{n}&nbsp;&nbsp;/&nbsp;&nbsp;07</div>
</div>"""

def runhead(mid):
    return ('<div class="runhead"><span class="a">WOODSTONE&nbsp;&nbsp;·&nbsp;&nbsp;</span>'
            f'<span class="b">{mid}</span><span class="r">WESTERN × HIO</span></div>'
            '<div class="runrule"></div>')

TONES = ["Moledo","Arenito","Granito","Quartzo","Carbono"]
TONE_SLUG = ["moledo","arenito","granito","quartzo","carbono"]

PRODUCTS = [
 dict(n="01", name="Gaia", sub="Mesa lateral", loja=True, slug="gaia",
   desc="Presença escultórica em pequena escala. A base mineral sobe pelo tampo e o encontro entre pedra e madeira vira parte da composição.",
   onde="Ao lado de sofás e poltronas, em dormitórios ou como apoio pontual.",
   med="tampo 40 × 50 cm · altura 50 cm", peso="36,5 kg",
   tab="R$ 5.439,00", mini="R$ 5.167,05",
   p=["R$ 2.719,50","R$ 1.813,00","R$ 1.371,79","R$ 1.107,35","R$ 931,25"]),
 dict(n="02", name="Núcleo", sub="Mesa de centro", loja=False, slug="nucleo",
   desc="Baixa e orgânica. O tampo acompanha a área de conversa enquanto a base mineral mantém a peça rente ao piso.",
   onde="Salas amplas e composições com sofás de linhas contínuas.",
   med="100 × 65 × 30 cm", peso="84 kg",
   tab="R$ 9.956,85", mini="R$ 9.459,01",
   p=["R$ 4.978,43","R$ 3.318,95","R$ 2.511,25","R$ 2.027,17","R$ 1.704,79"]),
 dict(n="03", name="Elo", sub="Duo de mesas laterais", loja=False, slug="elo",
   desc="Duas alturas que conversam entre si. Juntas criam ritmo ao redor do estar; separadas, resolvem dois pontos do mesmo ambiente.",
   onde="Vendido como duo. Permite sobreposição visual entre tampos e apoios.",
   med="alturas 70 e 45 cm · diâmetro aprox. 55 cm", peso="87,2 e 42,2 kg",
   tab="R$ 10.560,00", mini="R$ 10.032,00",
   p=["R$ 5.280,00","R$ 3.520,00","R$ 2.663,37","R$ 2.149,97","R$ 1.808,06"]),
 dict(n="04", name="Origem", sub="Banco", loja=True, slug="origem",
   desc="Um plano longo de Pequiá apoiado em duas bases minerais distintas. É a peça que organiza a circulação e marca a chegada.",
   onde="Entradas, paredes longas, varandas cobertas e espaços de contemplação.",
   med="205 × 63 × 45 cm", peso="148,6 kg",
   tab="R$ 15.594,00", mini="R$ 14.814,30",
   p=["R$ 7.797,00","R$ 5.198,00","R$ 3.933,02","R$ 3.174,86","R$ 2.669,97"]),
 dict(n="05", name="Ágora", sub="Mesa de jantar", loja=False, slug="agora",
   desc="Grande escala. O tampo reúne as pessoas em torno de uma base facetada e inclinada, onde a força escultórica da coleção se concentra.",
   onde="Salas de jantar e hospitalidade com área e acesso compatíveis.",
   med="255 × 120 × 75 cm", peso="465,4 kg",
   tab="R$ 55.749,00", mini="R$ 52.961,55",
   p=["R$ 27.874,50","R$ 18.583,00","R$ 14.060,65","R$ 11.350,23","R$ 9.545,23"]),
]

ROWS = [("01","Gaia","Mesa lateral",True,"R$ 5.439,00","R$ 5.167,05","R$ 1.813,00","R$ 931,25"),
        ("02","Núcleo","Mesa de centro",False,"R$ 9.956,85","R$ 9.459,01","R$ 3.318,95","R$ 1.704,79"),
        ("03","Elo","Duo de mesas laterais",False,"R$ 10.560,00","R$ 10.032,00","R$ 3.520,00","R$ 1.808,06"),
        ("04","Origem","Banco",True,"R$ 15.594,00","R$ 14.814,30","R$ 5.198,00","R$ 2.669,97"),
        ("05","Ágora","Mesa de jantar",False,"R$ 55.749,00","R$ 52.961,55","R$ 18.583,00","R$ 9.545,23")]

def page1():
    rows=""
    for num,name,sub,loja,tab,mini,p3,p6 in ROWS:
        tag = '<span class="tag">NA LOJA</span>' if loja else ''
        rows += (f'<tr><td class="num">{num}</td>'
                 f'<td class="name"><b>{name}</b><span class="sep"> </span>· {sub}{tag}</td>'
                 f'<td><span class="v1">{tab}</span></td><td><span class="v2">{mini}</span></td>'
                 f'<td><span class="v3">{p3}</span></td><td class="c6"><span class="v3">{p6}</span></td></tr>')
    return f"""<section class="page">
  <div class="p1head">
    <img class="w" src="assets/western.png" alt="Western"><div class="div"></div><img class="h" src="assets/hio.png" alt="HIO">
    <div class="right">COLEÇÃO WOODSTONE<br>GUIA DE VENDAS</div>
  </div>
  <div class="rule-dark"></div>
  <h1 class="title" style="{m('p1_title',15.4)}">Woodstone</h1>
  <div class="kicker" style="{m('p1_kicker',12.9)}">CONSULTA RÁPIDA · EQUIPE DE VENDAS HIO</div>
  <p class="lede" style="{m('p1_lede',12.6)}">Cinco peças de formas orgânicas que reúnem a pedra Western e o Pequiá maciço da<br>ArboREAL. <strong>Gaia e Origem estão em exposição na loja</strong> — o cliente vê e toca antes de decidir.</p>
  <div class="materia" style="{m('p1_materia',15.0)}">
    <div class="lbl">A MATÉRIA
      <span class="marks"><img src="assets/western.png" alt="Western"><i>×</i><img class="ar" src="assets/arboreal-logotipo.png" alt="ArboREAL"></span>
    </div>
    <div class="txt">Pedra artesanal, construída a partir de molde extraído de uma rocha natural. O ambiente
    permanece preservado e a natureza é recriada à mão, peça por peça. <strong>100% sustentável.</strong></div>
  </div>
  <div class="rule-lt" style="{m('p1_chiprule',11.7)}"></div>
  <div class="chips">
    <div><div class="chip-l">PIX À VISTA</div><div class="chip-v">até <span class="big">5%</span> de margem para você negociar</div></div>
    <div><div class="chip-l">CARTÃO SEM JUROS</div><div class="chip-v">até <span class="big">3×</span> · 4× a 6× com acréscimo</div></div>
    <div><div class="chip-l">PRODUÇÃO</div><div class="chip-v"><span class="big">30</span> dias corridos por peça</div></div>
    <div><div class="chip-l">FRETE E INSTALAÇÃO</div><div class="chip-v">Western até <span class="big">100 km</span><br>com taxa extra</div></div>
  </div>
  <div class="rule-lt"></div>
  <div class="seclabel" style="{m('p1_tabela',12.9)}">TABELA DE VENDA</div>
  <div class="rule-dark" style="margin-top:4.45pt"></div>
  <table class="sales">
    <thead><tr><th class="num">&nbsp;</th><th class="name">PEÇA</th><th class="c3">TABELA</th>
        <th class="c4" style="color:var(--gold)">MÍNIMO NO PIX<span class="sub">COM OS 5%</span></th>
        <th class="c5">3× SEM JUROS<span class="sub">PARCELA</span></th>
        <th class="c6">6× COM JUROS<span class="sub">PARCELA</span></th></tr></thead>
    <tbody>{rows}</tbody>
  </table>
  <p class="note" style="{m('p1_note1',6.4)}">Valores por unidade comercial. <strong>Elo é vendido como duo.</strong> A coluna “mínimo no Pix” é o menor valor que você pode fechar. Cada peça tem sua página, com o parcelamento completo de 2× a 6×.</p>
  <div class="seclabel" style="{m('p1_formas',15.4)}">FORMAS DE PAGAMENTO</div>
  <div class="rule-dark" style="margin-top:4.45pt"></div>
  <table class="pay">
    <tr><td class="l">PIX À VISTA</td><td class="t">Desconto de até <strong>5%</strong>, a seu critério. <strong>É a única modalidade com margem</strong> — use como argumento de fechamento, não como ponto de partida.</td></tr>
    <tr><td class="l">CARTÃO</td><td class="t"><strong>Até 3× sem juros</strong>, no preço de tabela. De 4× a 6× com acréscimo já embutido nos valores deste guia.</td></tr>
    <tr><td class="l">BOLETO</td><td class="t"><strong>50% no pedido e 50% antes da entrega.</strong> Sem desconto e sem margem. Sujeito a consulta e aprovação de crédito.</td></tr>
    <tr><td class="l">FRETE E INSTALAÇÃO</td><td class="t">Em um raio de até <strong>100 km da capital</strong>, a Western assume o frete e a instalação, <strong>mediante pagamento de taxa extra de entrega e instalação</strong>. Distâncias maiores deverão ser cotadas com a equipe da Western.</td></tr>
  </table>
  <p class="note" style="{m('p1_note2',6.4)}">Pagamentos processados pela <strong>Asaas</strong>, instituição autorizada pelo Banco Central. Bandeiras: Visa, Mastercard, Elo, American Express, Diners, Hipercard e Discover.<br><strong>Preços sujeitos a alteração sem aviso prévio.</strong></p>
  {FOOT.format(n="01")}
</section>"""

def product(pr, idx):
    badge = '<div class="badge">EM EXPOSIÇÃO NA LOJA</div>' if pr["loja"] else ''
    tones = "".join(f'<div><img src="assets/tone-{s}.jpg" alt=""><div class="t">{t}</div></div>'
                    for s,t in zip(TONE_SLUG,TONES))
    a,b,c,d,e = pr["p"]
    return f"""<section class="page">
  {runhead(f'PEÇA {pr["n"]} DE 05')}
  <div class="phead" style="{m('pp_head',11.3)}">
    <div class="ghost">{pr["n"]}</div>
    <div class="tt"><h2>{pr["name"]}</h2><div class="sub">{pr["sub"]}</div></div>
    {badge}
  </div>
  <img class="hero" src="assets/{pr["slug"]}-hero.jpg" alt="" style="object-position:{pr.get("fhero","50% 50%")}">
  <div class="duo">
    <div class="panel"><img src="assets/{pr["slug"]}-b.jpg" alt=""></div>
    <img class="shot" src="assets/{pr["slug"]}-c.jpg" alt="" style="object-position:{pr.get("fshot","50% 50%")}">
  </div>
  <p class="desc">{pr["desc"]}</p>
  <div class="onde"><span class="oi">ONDE INDICAR</span><span class="oit">{pr["onde"]}</span></div>
  <div class="specs" style="{m('pp_specs',8.6)}">
    <div><div class="l">MEDIDAS</div><div class="v">{pr["med"]}</div></div>
    <div><div class="l">PESO</div><div class="v">{pr["peso"]}</div></div>
    <div><div class="l">MADEIRA</div><div class="v">Pequiá maciço</div></div>
  </div>
  <div class="prices">
    <div class="col"><div class="l">PREÇO DE TABELA</div><div class="v">{pr["tab"]}</div><div class="n">à vista ou até 3× sem juros</div></div>
    <div class="col gold"><div class="l">MÍNIMO QUE VOCÊ PODE FECHAR</div><div class="v">{pr["mini"]}</div><div class="n">Pix, com os 5% de margem</div></div>
  </div>
  <table class="inst">
    <tr class="r1"><td class="hl">2×</td><td class="hl">3×</td><td>4×</td><td>5×</td><td>6×</td></tr>
    <tr class="r2"><td class="hl">SEM JUROS</td><td class="hl">SEM JUROS</td><td>+0,89%</td><td>+1,80%</td><td>+2,73%</td></tr>
    <tr class="r3"><td class="hl">{a}</td><td class="hl">{b}</td><td>{c}</td><td>{d}</td><td>{e}</td></tr>
    <tr class="r4"><td class="hl"></td><td class="hl"></td><td></td><td></td><td></td></tr>
  </table>
  <p class="note" style="{m('pp_note1',6.4)}">Valor da parcela no cartão. <strong>2× e 3× sem juros, no preço de tabela.</strong> De 4× a 6× o acréscimo já está embutido.</p>
  <div class="tonhead"><span class="seclabel">TONALIDADES DA PEDRA</span><span class="r">a madeira é sempre Pequiá maciço da <img class="arbo" src="assets/arboreal-logotipo.png" alt="ArboREAL"></span></div>
  <div class="rule-dark" style="margin-top:4.45pt"></div>
  <div class="tones">{tones}</div>
  <p class="note" style="{m('pp_note2',5.6)}">Ambiente e estúdio simulados em Moledo; o detalhe é foto real da textura da pedra. <strong>Prazo de produção, frete e uso em área externa: páginas 01 e 07.</strong></p>
  {FOOT.format(n="0"+str(idx))}
</section>"""

STEPS = [
 ("1","Apresente a peça","Gaia e Origem estão na loja para o cliente ver e tocar. Para as outras três, use as páginas deste guia."),
 ("2","Escolha a tonalidade da pedra","Cinco opções: Moledo, Arenito, Granito, Quartzo e Carbono. A madeira é sempre Pequiá maciço."),
 ("3","Feche o valor","Preço de tabela à vista ou até 3× sem juros. No Pix, você tem até 5% de margem."),
 ("4","Registre na plataforma HIO","Informe o vendedor, complete o cadastro do cliente e selecione peças, quantidades, tonalidades e valores negociados. Confira o total e emita o ticket. <strong>Enviaremos posteriormente o link da Plataforma Western HIO e faremos o cadastro de cada vendedor.</strong>"),
 ("5","A Western assume daqui","Recebemos a solicitação, entramos em contato com o cliente e finalizamos a compra, o frete e a montagem. <strong>Em um raio de 100 km, a Western assume o frete e a instalação, mediante pagamento de taxa extra de entrega e instalação</strong> — distâncias maiores deverão ser cotadas com a equipe da Western."),
]

FAQ = [
 ("“Que pedra é essa?”"," Pedra artesanal, construída a partir de molde extraído de uma rocha natural. O ambiente permanece preservado e a natureza é recriada à mão. 100% sustentável — e cada peça sai única."),
 ("“E a madeira?”"," Pequiá maciço da ArboREAL, em todas as peças. As cinco tonalidades da coleção são da pedra."),
 ("“Posso usar na varanda?”"," Sim, com validação. Exposição, cobertura e manutenção devem ser conferidas com a Western."),
 ("“Quanto tempo demora?”"," 30 dias corridos por peça, contados da confirmação do pagamento. Acima de 5 peças, consultar."),
 ("“Quem entrega e instala?”"," A Western, em um raio de até 100 km da capital, mediante pagamento de taxa extra de entrega e instalação. Distâncias maiores deverão ser cotadas com a equipe da Western."),
 ("“Como acesso a plataforma?”"," Enviaremos o link da Plataforma Western HIO em seguida e faremos o cadastro de cada vendedor."),
]

def page7():
    steps = "".join(f'<div class="step"><div class="n">{n}</div><div><h3>{t}</h3><p>{b}</p></div></div>'
                    for n,t,b in STEPS)
    faq = "".join(f'<p><strong>{q}</strong>{a}</p>' for q,a in FAQ)
    return f"""<section class="page">
  {runhead('COMO FECHAR O PEDIDO')}
  <h2 class="big" style="{m('p7_title',16.9)}">Como fechar<br>o pedido</h2>
  <div class="kicker" style="{m('p7_kicker',11.3)}">CINCO PASSOS</div>
  <div class="steps">{steps}</div>
  <div class="cols">
    <div>
      <div class="h"><span class="seclabel">ATENDIMENTO WESTERN</span></div>
      <div class="person"><div class="nm">Matheus Völker</div><div class="ro">Comercial e marketing</div><div class="ph">+55 11 9 9340 3487</div><div class="de">Pedidos, negociação e finalização.</div></div>
      <div class="person"><div class="nm">Davi Grecco</div><div class="ro">Arquiteto e designer</div><div class="ph">+55 11 9 7530 8972</div><div class="de">Aplicações, composições, cores e blocos 3D.</div></div>
      <div class="closing">A Western conta com projetistas, arquitetos e engenheiros para suporte em projetos. Chame a qualquer momento da conversa com o cliente.</div>
    </div>
    <div>
      <div class="h"><span class="seclabel">PERGUNTAS QUE APARECEM</span></div>
      <div class="faq">{faq}</div>
    </div>
  </div>
  {FOOT.format(n="07")}
</section>"""

pages = [page1()] + [product(p, i+2) for i,p in enumerate(PRODUCTS)] + [page7()]
html = ('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">'
        '<title>Woodstone — guia de vendas HIO</title>'
        '<link rel="stylesheet" href="style.css">' + tunecss() + '</head><body>'
        + "\n".join(pages) + '</body></html>')
open('guia.html','w',encoding='utf-8').write(html)
print('guia.html written', len(html), 'bytes')
