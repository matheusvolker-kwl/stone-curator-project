# Por que a coleta não rodou aqui

O scraper está pronto e testado, mas **não foi executado contra os alvos reais**:
o ambiente onde esta sessão roda bloqueia saída HTTPS para todos os 19 domínios.

## O que acontece

Toda tentativa de sair para um dos alvos volta assim:

```
$ curl -I https://www.luminariaswj.com.br/
curl: (56) CONNECT tunnel failed, response 403
```

A saída HTTPS desta sessão passa por um proxy que aplica a política de egresso da
organização. Ele não é um firewall genérico — é uma **lista de permissão**, e o
que não está nela recebe 403 no CONNECT, antes de qualquer request HTTP existir.

Testado, um a um:

| destino | resultado |
|---|---|
| os 19 domínios da lista | ❌ 403 no CONNECT |
| `instagram.com`, `youtube.com`, `pinterest.com` | ❌ 403 no CONNECT |
| `google.com`, `wikipedia.org`, `archive.org` | ❌ 403 no CONNECT |
| `pypi.org`, `registry.npmjs.org` | ✅ liberado (registries de pacote) |
| `github.com` | ✅ liberado |

A ferramenta interna de fetch bate no mesmo muro, com a mensagem explícita:

```json
{"error_type":"EGRESS_BLOCKED","domain":"www.luminariaswj.com.br",
 "message":"Access to www.luminariaswj.com.br is blocked by the network egress proxy."}
```

Só sobrou busca na web, que é fonte secundária — foi com ela que o
[`PESQUISA-2025-2026.md`](./PESQUISA-2025-2026.md) foi montado.

O manual do proxy é explícito sobre não contornar isso:

> 403 / 407 from the proxy — The destination host is not allowed by your
> organization's egress policy for this session. **Do not retry or route around
> it** — report the blocked host.

Então nada de proxy reverso, leitor de terceiros ou espelho: o bloqueio é
reportado, não driblado.

## Como destravar

Escolha um dos dois:

### 1. Rodar na sua máquina (mais simples)

O scraper não depende de nada além do Node 22+. Em rede aberta:

```bash
git clone <este-repo> && cd stone-curator-project
node scripts/scrape/run.mjs
```

Sem `npm install` — a coleta de sites, YouTube e Pinterest é dependency-free.
Só o modo `--render` e o caminho de navegador do Instagram usam Playwright:

```bash
npm install && npx playwright install chromium
node scripts/scrape/run.mjs --render
```

### 2. Liberar os domínios no ambiente remoto

A política de egresso é escolhida na criação do ambiente. Para uma sessão como
esta alcançar os alvos, o ambiente precisa de uma política que os inclua — ou de
saída irrestrita. Está documentado em
<https://code.claude.com/docs/en/claude-code-on-the-web>.

Domínios a liberar:

```
luminariaswj.com.br      armentano.arq.br         tidelli.com
estudiobola.com          dpot.com.br              jaderalmeida.com
jaderalmeida.shop        blog.jaderalmeida.com    felipecaboclo.com.br
figueiredofischer.com.br laurarocha.com           mulapreta.com
olegariodesa.com.br      jacobsenarquitetura.com  mk27.com
guilhermetorres.com      mpgarquitetura.com.br    casaatica.com
hanazaki.com.br          oala.com.br              hiodecor.com.br
instagram.com            youtube.com              pinterest.com
```

## O que muda quando destravar

Nada no código. Os mesmos comandos passam a devolver dados de verdade:

```bash
node scripts/scrape/run.mjs                    # os 19 alvos, 2025+
cat data/scrape/RELATORIO.md                   # o que entrou e o que falhou
open data/scrape/consolidado.csv               # tudo numa planilha
```

Instagram e Pinterest continuam pedindo sessão própria mesmo com a rede aberta —
isso é limite da plataforma, não do ambiente. Está explicado no
[README do scraper](../../scripts/scrape/README.md).
