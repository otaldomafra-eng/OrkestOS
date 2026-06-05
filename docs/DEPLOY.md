# Deploy — OrkestOS

## Infraestrutura

```
app.orkest.pro  ──┐
                  ├── Cloudflare (DNS + proxy + SSL edge)
api.orkest.pro  ──┘
                        │
                Oracle VPS (Ubuntu 24.04 arm64 — free tier)
                ├── Nginx 1.24 (reverse proxy + SSL Let's Encrypt)
                ├── /var/www/orkestos  (React build estático)
                ├── PM2 → Node.js backend (porta 3001)
                └── MongoDB 8.0 (localhost:27017/orkestos)
```

- **Acesso SSH:** ver `VPS-ORACLE/README.md` (arquivo local, nunca publicado)
- **IP do servidor:** ver `VPS-ORACLE/README.md`
- **Chave SSH:** `VPS-ORACLE/ssh-key-2026-03-17 - privada.key` (local, nunca publicada)

---

## Caminhos no servidor

| O quê | Caminho |
|-------|---------|
| Código-fonte | `/opt/orkestos` |
| Frontend servido | `/var/www/orkestos` |
| Config Nginx | `/etc/nginx/sites-available/orkestos` |
| Backend `.env` | `/opt/orkestos/backend/.env` |
| Frontend `.env` | `/opt/orkestos/frontend/.env` |

---

## Processo de deploy

### 1. Enviar código para o GitHub

```bash
# Na máquina local — commitar alterações pendentes
git add <arquivos>
git commit -m "feat: descrição"

# Enviar branch atual
git push origin codex/telegram-kronos-adaptation

# Ou enviar direto para main
git push origin main
```

### 2. Conectar ao VPS

```bash
ssh -i "VPS-ORACLE/ssh-key-2026-03-17 - privada.key" ubuntu@<IP_DO_VPS>
```

> O IP está em `VPS-ORACLE/README.md` (arquivo local).

### 3. Atualizar código no servidor

```bash
cd /opt/orkestos
git pull origin main
```

### 4. Build do frontend

```bash
cd /opt/orkestos/frontend
npm install          # só se houver novos pacotes
npm run build
sudo cp -r dist/* /var/www/orkestos/
```

### 5. Reiniciar backend (se necessário)

```bash
cd /opt/orkestos/backend
npm install          # só se houver novos pacotes
pm2 restart orkestos-backend
pm2 status           # confirmar que está online
```

### 6. Verificar

- Frontend: https://app.orkest.pro
- API: https://api.orkest.pro/health (ou qualquer endpoint)

---

## Comandos úteis no servidor

```bash
# Status dos serviços
pm2 status
sudo systemctl status nginx

# Logs do backend
pm2 logs orkestos-backend

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Reiniciar Nginx
sudo systemctl restart nginx

# Renovar SSL (automático via cron, mas pode forçar)
sudo certbot renew --dry-run
```

---

## Variáveis de ambiente

As variáveis ficam nos `.env` diretamente no servidor — **nunca commitar `.env`**.

| Arquivo | Variáveis principais |
|---------|---------------------|
| `backend/.env` | `PORT`, `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID/SECRET` |
| `frontend/.env` | `VITE_BACKEND_URL=https://api.orkest.pro`, `VITE_GOOGLE_CLIENT_ID` |

Para atualizar uma variável: editar o `.env` no servidor e reiniciar com `pm2 restart`.

---

## SSL

- Certificados Let's Encrypt via Certbot
- Expiram em **2026-09-01** (renovação automática configurada)
- Verificar: `sudo certbot certificates`

---

## Notas

- O frontend é um **SPA estático** — qualquer alteração de rota requer `cp dist/* /var/www/orkestos/`
- O Nginx tem rewrite `try_files $uri /index.html` para suportar rotas do React Router
- O MongoDB roda localmente no VPS (sem cloud) — backups manuais se necessário
