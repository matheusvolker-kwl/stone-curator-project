# Produtos aplicados — imagens por SKU

Cada produto do catálogo tem até **duas fotos** aplicadas, resolvidas
automaticamente pelo SKU pelo componente `ProductInUse` (PDP).

## Convenção de nomes

Formato: `{SKU}_{tipo}.webp`

- `{SKU}_close.webp` → foto de **detalhe** (close-up da peça em uso)
- `{SKU}_ambiente.webp` → foto **no ambiente** (contexto, paisagem)

Sufixos extras após `ambiente` são permitidos (útil para descrever cenário):

- `{SKU}_ambiente_praia.webp`
- `{SKU}_ambiente_jardim.webp`
- `{SKU}_ambiente_piscina.webp`

O matching é **case-insensitive** e considera apenas o **SKU base**
(parte antes do primeiro hífen). Ex.: um produto com variante `FC-NAT`
casa com arquivos que começam por `FC_`.

## Exemplos

```
FC_close.webp
FC_ambiente.webp
FMS_close.webp
FMS_ambiente.webp
FSR_close.webp
FSR_ambiente.webp
EUC_close.webp
LAJEDO_BOREAL_ambiente_praia.webp
```

## Formato recomendado

- **Extensão:** `.webp` (JPG/PNG também funcionam, mas WebP é o padrão)
- **Proporção:** 4:3 (recorte cuidando para a peça respirar)
- **Largura mínima:** 1600 px no lado maior
- **Peso alvo:** < 300 KB por imagem (qualidade 80)

## Comportamento

- Sem nenhuma das duas imagens: a seção **não aparece** na PDP.
- Com apenas uma: mostra só ela, ocupando a coluna disponível.
- Com as duas: exibe as duas lado a lado (empilha no mobile).
