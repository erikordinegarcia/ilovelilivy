# I Love Lilivy Semijoias

Site da **I Love Lilivy Semijoias**: semijoias e acessórios premium (brincos, pulseiras, bolsas e colares).

## Páginas

| Página | O que tem |
| --- | --- |
| `index.html` | Página inicial: apresentação, **Destaques** (até 8 produtos marcados com ★), diferenciais, sobre nós e orçamento via WhatsApp |
| `produtos.html` | Catálogo completo: filtro por categoria, busca, ordenação e "Ver mais" |
| `admin/` | Painel das donas (login) para cadastrar, editar, destacar e excluir produtos |

## Como funciona

- Site estático (HTML, CSS e JavaScript puro), sem build.
- Produtos, fotos e login ficam no **Supabase** (tabela `products` + bucket `product-images`).
- A conexão está em `assets/js/supabase-client.js`. A chave lá é a **anon** (pública por natureza); a segurança vem das regras RLS de `supabase/schema.sql`. **Nunca** coloque a chave `service_role` no site.

## Rodar localmente

```bash
python -m http.server 5500
```

Depois abra http://127.0.0.1:5500

## Configurar um Supabase novo

1. Crie um projeto no Supabase.
2. Rode `supabase/schema.sql` em **SQL Editor**.
3. Preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY` em `assets/js/supabase-client.js` (Project Settings > API Keys).
4. Crie o login das donas em **Authentication > Users > Add user** e desative cadastros públicos.
