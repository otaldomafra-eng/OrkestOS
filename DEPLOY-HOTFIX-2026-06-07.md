# 🚨 Hotfix Deploy — 2026-06-07

## Problema Identificado
- **Site:** `app.orkest.pro` retorna tela em branco
- **Causa:** Frontend tentava conectar em `http://localhost:4000` (máquina local) ao invés de `https://api.orkest.pro`
- **Arquivo afetado:** `frontend/.env` com variável `VITE_BACKEND_URL` incorreta

---

## O Que Foi Feito Nesta Hotfix

### 1. Criados arquivos de configuração
- ✅ `frontend/.env` — para desenvolvimento (localhost:4000)
- ✅ `frontend/.env.production` — para produção (https://api.orkest.pro)
- ✅ Build do frontend executado com `NODE_ENV=production`

### 2. Novo build gerado
```bash
npm run build  # Frontend compilado com VITE_BACKEND_URL=https://api.orkest.pro
```

**Resultado:**
- ✅ `dist/` gerado com 1,092.90 kB de JavaScript
- ✅ Arquivo CSS: 76.97 kB
- ✅ HTML: 0.54 kB

---

## Deploy para Produção (VPS Oracle)

### Pré-requisitos
- Acesso SSH à VPS: `ssh -i "VPS-ORACLE/ssh-key-2026-03-17 - privada.key" ubuntu@147.15.101.153`
- Git status limpo localmente

### Passos

#### 1. Commit do hotfix (local)
```bash
git add frontend/.env frontend/.env.production frontend/dist/
git commit -m "hotfix: corrige VITE_BACKEND_URL para produção (https://api.orkest.pro)"
git push origin codex/telegram-kronos-adaptation
```

#### 2. Conectar à VPS
```bash
ssh -i "VPS-ORACLE/ssh-key-2026-03-17 - privada.key" ubuntu@147.15.101.153
```

#### 3. Atualizar código no servidor
```bash
cd /opt/orkestos
git pull origin codex/telegram-kronos-adaptation
```

#### 4. Deploy do frontend (copiar build para servidor web)
```bash
cd /opt/orkestos/frontend
sudo cp -r dist/* /var/www/orkestos/
sudo chown -R www-data:www-data /var/www/orkestos/
```

#### 5. Limpar cache do Cloudflare (opcional)
```bash
# No Cloudflare dashboard, vá para:
# Caching → Purge Cache → Purge Everything
# Ou use API (se tiver token):
curl -X POST "https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer {API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://app.orkest.pro/"]}'
```

#### 6. Verificar status
```bash
# Na VPS:
sudo systemctl status nginx
pm2 status

# Localmente, no navegador:
# 1. Abrir app.orkest.pro
# 2. F12 → Console → Verificar se há erros
# 3. Recarregar (Ctrl+Shift+R para hard refresh)
# 4. Deve aparecer a aplicação (dashboard ou login)
```

---

## Variáveis de Ambiente da VPS

**Arquivo:** `/opt/orkestos/backend/.env` (na VPS, não commitado)

Garantir que estão presentes:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/orkestos
JWT_SECRET=orkestos-jwt-secret-2026
GOOGLE_CLIENT_ID=<seu_client_id>
GOOGLE_CLIENT_SECRET=<seu_secret>
GEMINI_API_KEY=<sua_key>
IMAGEKIT_PUBLIC_KEY=placeholder_ate_ter_conta_real
IMAGEKIT_PRIVATE_KEY=placeholder_ate_ter_conta_real
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/orkestos/
TELEGRAM_BOT_TOKEN=8614842675:AAHWzJ-XQ6lYg0GJp-99NBlI28QAQLs9JBg
```

---

## Teste Pós-Deploy

### Checklist
- [ ] 1. Acessar `https://app.orkest.pro` — deve carregar (não branco)
- [ ] 2. Console F12 — sem erros 404 ou CORS
- [ ] 3. Clicar em "Login" ou "Sign up"
- [ ] 4. Verificar que o formulário aparece
- [ ] 5. (Opcional) Fazer login com credencial de teste
- [ ] 6. Acessar `https://api.orkest.pro/health` — deve retornar status
- [ ] 7. Hard refresh (Ctrl+Shift+R) — aplicação ainda deve funcionar

---

## Rollback (se necessário)

Se algo der errado após o deploy:

```bash
# Na VPS:
cd /opt/orkestos

# Reverter para commit anterior
git reset --hard HEAD~1
git pull origin codex/telegram-kronos-adaptation

# Rebuild e redeploy
cd frontend && npm run build
sudo cp -r dist/* /var/www/orkestos/

# Restart (se backend foi afetado)
cd ../backend && pm2 restart orkestos-backend
```

---

## Próximas Ações Após Hotfix

1. **Verificar se site funciona** (este é o bloqueador crítico)
2. **Configurar Telegram webhook** (quando site estiver ok)
3. **DNS raiz orkest.pro** (redirecionar para app.orkest.pro)
4. **Começar Fase 1 (Design System)** após confirmar produção estável

---

*Documento gerado em 2026-06-07*
*Não publicar credenciais no GitHub*
