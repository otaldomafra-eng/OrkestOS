# ORKEST OS - arquivos finais da marca

Arquivos principais:

- `brand/orkest-os/logo-lockup.svg` - logo horizontal completo.
- `brand/orkest-os/logo-mark.svg` - simbolo principal.
- `brand/orkest-os/symbol-only.svg` - somente o simbolo, com fundo transparente.
- `brand/orkest-os/symbol-ui.svg` - somente o simbolo, recortado e otimizado para sidebar/navbar.
- `brand/orkest-os/app-icon.svg` - icone quadrado para app/PWA.
- `brand/orkest-os/favicon.svg` - favicon simplificado.
- `brand/orkest-os/logo-monochrome.svg` - versao monocromatica.

Prompt para Claude:

```text
Atualize a identidade visual do site/app ORKEST OS usando os novos assets salvos em `brand/orkest-os/`.

Use:
- `brand/orkest-os/logo-lockup.svg` quando houver espaco horizontal, como landing/header.
- `brand/orkest-os/symbol-ui.svg` na sidebar/navbar quando o espaco for pequeno.
- `brand/orkest-os/symbol-only.svg` em telas internas, loading e componentes compactos quando precisar de fundo transparente.
- `brand/orkest-os/app-icon.svg` para PWA/app icon.
- `brand/orkest-os/favicon.svg` como favicon.
- `brand/orkest-os/logo-monochrome.svg` apenas quando a versao colorida nao funcionar.

Substitua gradualmente o asset antigo `frontend/src/assets/logo.jpeg`, sem quebrar imports existentes. Se for melhor para a estrutura atual do React/Vite, copie os SVGs para `frontend/src/assets/brand/` e ajuste os imports nos componentes que usam a marca, principalmente `Landing.jsx`, `CustomToast.jsx`, `Sidebar.jsx`, `index.html` e qualquer favicon em `frontend/public`.

Preserve a paleta escura do app e nao adicione textos explicativos na interface. O objetivo e deixar a marca mais premium, profunda e coerente com o visual roxo/azul/neon atual.
```
