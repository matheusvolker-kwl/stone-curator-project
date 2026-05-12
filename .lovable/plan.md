## Replicar avisos informativos na página de cadastro

Hoje a `/parceiro/cadastro` (`src/pages/PartnerSignup.tsx`) tem uma intro curta e vai direto para o formulário. Como muitos links levam direto pra cá, o usuário pode chegar sem entender que (a) o site é restrito a empresas aprovadas e (b) existe alternativa via WhatsApp para cliente final.

Vou trazer **as mesmas duas informações da página de login** (`PartnerLogin.tsx`), adaptadas ao layout estreito (max-w-2xl, coluna única) do cadastro — sem quebrar a hierarquia atual do form.

### Mudanças em `src/pages/PartnerSignup.tsx`

**1. Reforçar o aviso de exclusividade no intro (linhas 204–207)**

Substituir o parágrafo curto atual por uma versão mais clara, alinhada ao texto da página de login:

> "Este site da Western atende exclusivamente arquitetos, paisagistas, construtoras e garden centers com CNPJ ativo. O acesso à tabela comercial, modelos 3D e composições só é liberado após análise do cadastro — leva até 2 dias úteis."

**2. Adicionar callout "É cliente final?" abaixo do header, antes do stepper (após linha 207)**

Bloco discreto, em uma linha (sem virar card pesado), reaproveitando o componente visual do card de cliente final do Login mas em formato horizontal compacto:

- Borda sutil `border border-western-stone-warm/25`, fundo `bg-western-paper/60`, padding moderado.
- Ícone `MessageCircle` em dourado + eyebrow "Sou cliente final" + frase "Quero fazer um projeto residencial" + CTA "Falar no WhatsApp →".
- Link `<a>` para `https://wa.me/${BUSINESS.whatsappFabrica}?text=...` com mesma mensagem usada no Login (importar `BUSINESS` de `@/config/business`).
- Espaçamento `mb-10` para separar do stepper.

**3. (Opcional, mas recomendado) Repetir o callout no rodapé do form (linhas próximas a 188)**

No estado de sucesso ("Cadastro enviado com sucesso") já existe um link "Voltar ao catálogo". Não mexe nele.

### Layout

Coluna única continua. O callout de cliente final fica **acima** do stepper, dando uma "saída" clara antes do usuário começar a preencher campos que não se aplicam a ele. Isso reduz cadastros de pessoa física que depois precisam ser rejeitados.

```
[Eyebrow: Cadastro B2B]
[Título: Solicite acesso de parceiro.]
[Parágrafo reforçado de exclusividade]
[Callout horizontal: É cliente final? → WhatsApp]
[Stepper 1 / 2]
[Form...]
```

### Imports a adicionar

- `MessageCircle` de `lucide-react`
- `BUSINESS` de `@/config/business`

### Arquivos afetados

- `src/pages/PartnerSignup.tsx` (apenas seção intro, sem tocar no form/stepper/lógica de submit)

Nenhuma mudança em rotas, schema, validação ou backend.