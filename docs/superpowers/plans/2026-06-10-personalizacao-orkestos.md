# Plano de Personalização — OrkestOS → Sistema Operacional de Vida do Mafra

> **Data:** 2026-06-10
> **Status:** PROPOSTA — nenhuma alteração de código foi feita. Este documento é o plano a ser validado e refinado antes da execução.
> **Contexto do usuário:** Engenheiro civil, projetista em construtora (CLT) + projetos externos para clientes parceiros (freelance) + criador de sistemas/sites/apps com IA (hobby/segundo negócio). Quer um sistema que gerencie trabalho, projetos, finanças, sonhos, tempo e vida pessoal.

---

## 1. Diagnóstico do Estado Atual

### O que o sistema é hoje
Fork do **OrkestOS** open-source (ex-WiseMindOS), uma plataforma genérica de produtividade multiusuário no padrão SaaS:

- **Stack:** React 18 + Vite + Tailwind 4 (frontend) · Node/Express 5 + Mongoose/MongoDB 8 (backend) · VPS Oracle + Nginx + PM2 + Cloudflare (`app.orkest.pro` / `api.orkest.pro`)
- **Hierarquia de dados:** Goals → Projects → Tasks → Daily Plan → Habits → Stats semanais
- **Módulos existentes:** Dashboard, Trackers (metas, projetos, tarefas, hábitos, plano diário), Focus Room (pomodoro), Biblioteca (notebooks/páginas), Achievements/Gamificação (parcial), Reports, Integrations, Telegram (branch `codex/telegram-kronos-adaptation` — webhook + comandos + briefing diário)
- **Planos já escritos (não executados):** Fase 1 Design System, Fase 2 Gamificação, Fase 3 FutureTwin AI (chat com Claude API sobre os dados do usuário)

### Vestígios de produto genérico/SaaS a remover ou repensar
| Item | Onde | Por quê |
|---|---|---|
| Landing page pública | `frontend/src/pages/Landing.jsx` | Sistema pessoal não precisa vender nada |
| Pricing | `frontend/src/pages/Pricing.jsx` | Sem planos pagos para uso próprio |
| Signup público | `frontend/src/pages/Signup.jsx` + rota `/auth/register` | Risco de terceiros criarem conta no seu servidor |
| Roadmap público | `frontend/src/pages/Roadmap.jsx` | Substituir por roadmap pessoal interno |
| Templates open-source | `.github/`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` | Projeto deixa de ser comunitário |
| Onboarding genérico | `frontend/src/pages/Onboarding.jsx` | Substituir por seed de dados pessoais |

### Limitações estruturais para o seu caso de uso
1. **Modelos de dados rasos:** `goalModel` tem só título/tipo/descrição/prazo. Não existe conceito de área de vida, cliente, valor financeiro, disciplina de engenharia, horizonte de tempo.
2. **Sem dimensão financeira:** Finance Tracker está apenas "Planned" no README. Nada de transações, recebíveis, orçamento.
3. **Sem distinção de contextos:** tarefas do trabalho CLT, de cliente externo, de hobby e pessoais ficam todas na mesma lista plana.
4. **Sem gestão de clientes/propostas:** o fluxo de freelance (proposta → contrato → parcelas → entrega → revisões) não existe.
5. **Sem time tracking real:** o Focus Room cronometra sessões, mas nada registra *em que* o tempo foi gasto por área/cliente.

---

## 2. Visão Alvo

Um **"Life OS" single-user** organizado em **Áreas de Vida**, onde tudo (metas, projetos, tarefas, hábitos, dinheiro, tempo) pertence a uma área e os dashboards respondem perguntas reais:

```
ÁREAS DE VIDA (novo conceito raiz)
├── 🏗️ Trabalho (CLT — construtora)
│     └── projetos internos, disciplinas, prazos de entrega, revisões
├── 📐 Projetos Externos (freelance)
│     └── clientes parceiros, propostas, contratos, parcelas, entregas
├── 🤖 Lab IA & Dev (hobby/segundo negócio)
│     └── sistemas, sites, apps, experimentos, ideias
├── 💰 Finanças
│     └── contas, transações, orçamento, recebíveis ← integra com freelance
├── 🌟 Sonhos & Vida
│     └── metas de longo prazo com custo estimado ← integra com finanças
└── ❤️ Saúde & Hábitos
      └── hábitos, rotina, energia
```

**Princípios:**
- **Single-user:** uma conta (a sua), registro desabilitado, dados privados no seu VPS.
- **Captura rápida via Telegram:** lançar despesa, criar tarefa, registrar ideia — sem abrir o app (a base kronos já existe).
- **IA como copiloto (FutureTwin):** insights diários sobre *seus* dados — equilíbrio CLT × freelance × vida, alertas de prazo, saúde financeira.
- **Aproveitar o que existe:** a hierarquia Goals→Projects→Tasks, o Daily Planner, hábitos, Focus Room e Biblioteca permanecem — ganham a dimensão "área" e campos específicos.

---

## 3. Fases do Plano

### Fase 0 — Estabilização (pré-requisito, já mapeada em STATUS-PROJETO-2026-06-07.md)
*Nada novo aqui — apenas concluir o que está pendente antes de mexer em arquitetura.*
- [ ] Deploy do hotfix do site em branco (`.env.production`)
- [ ] Configurar webhook do Telegram no BotFather
- [ ] Chaves reais do ImageKit (ou decidir remover ImageKit se upload de imagem não for prioridade)
- [ ] Backup diário do MongoDB (cron + `mongodump`) — **vira crítico quando finanças entrarem no sistema**
- **Esforço:** ~2h · **Risco:** baixo

### Fase 1 — De SaaS genérico para sistema pessoal
- [ ] Desabilitar registro público (rota `/auth/register` atrás de flag `ALLOW_REGISTRATION=false`)
- [ ] Remover/arquivar páginas Landing, Pricing, Signup, Roadmap (login direto como entrada)
- [ ] Remover templates GSSoC/open-source (`.github/ISSUE_TEMPLATE`, CONTRIBUTING, CODE_OF_CONDUCT)
- [ ] Reescrever README como documentação pessoal do sistema
- [ ] Expandir `userModel` com perfil pessoal (profissão, contexto para a IA, preferências)
- **Esforço:** ~3h · **Risco:** baixo · **Reversível:** sim (git)

### Fase 2 — Áreas de Vida (mudança estrutural central)
- [ ] Novo model `areaModel` (nome, ícone, cor, ordem, tipo: trabalho/freelance/hobby/pessoal/finanças/saúde)
- [ ] Adicionar `areaId` em `goalModel`, `projectModel`, `taskModel`, `habitModel`, `notebookModel`
- [ ] Migração de dados existentes (script atribuindo área default "Pessoal")
- [ ] Seed das suas 6 áreas iniciais
- [ ] UI: filtro/segmentação por área em todos os trackers + Dashboard com visão por área (cards de saúde de cada área)
- [ ] Cores/ícones por área propagados em cards, calendário e relatórios
- **Esforço:** ~6-8h · **Risco:** médio (migração de schema) · **É a fundação de tudo que vem depois**

### Fase 3 — Projetos Profissionais & Criativos (Engenharia + Sistemas/Apps) & Clientes
*Decisões validadas (2026-06-10): gestão completa serve às DUAS áreas de engenharia (CLT e Externos) E aos projetos de sistemas/apps do Lab IA. A camada comercial (cliente/proposta/contrato/parcelas) só se aplica a projetos com cliente externo.*

**Arquitetura: projeto com "template de workflow" por tipo.** Em vez de um model só para engenharia, o `projectModel` estendido ganha um campo `workflowType` que define as fases e os artefatos rastreados:

| workflowType | Fases do pipeline | Artefatos rastreados |
|---|---|---|
| `engenharia` | estudo preliminar → anteprojeto → projeto executivo → compatibilização → entregue → revisões | disciplinas, pranchas (status: em elaboração / emitida / revisada), revisões R00/R01 por prancha, ART/RRT |
| `software` | ideia → validação → MVP → beta → produção → manutenção | stack, link do repositório, URL de deploy, changelog/versões |
| `generico` | a definir pelo usuário (fases customizáveis) | checklist livre |

**Núcleo comum a todos os tipos:**
- [ ] Estender `projectModel`: `workflowType`, fase atual, pipeline de fases com datas
- [ ] Tela de detalhe do projeto com linha do tempo de fases (renderização adapta ao tipo)
- [ ] Tracking de revisões/versões por projeto

**Específico de engenharia:**
- [ ] Gestão de disciplinas e pranchas por projeto, revisões por prancha (R00, R01... com data e motivo)
- [ ] (Opcional) registro de ART/RRT por projeto

**Específico de software/apps:**
- [ ] Campos: stack, repositório, URL de produção, status de deploy
- [ ] Flag "publicar no portfólio" (alimenta a Fase 9 automaticamente)

**Camada comercial (projetos com cliente externo, qualquer tipo):**
- [ ] Model `clientModel`: nome, contato, empresa, observações, histórico
- [ ] Model `proposalModel` simples: valor, escopo, status (enviada/aceita/recusada), conversão em projeto
- [ ] Valor de contrato e parcelas por projeto
- [ ] Tela "Clientes"
- **Esforço:** ~14-18h (escopo ampliado com templates de workflow) · **Risco:** baixo (módulo novo, não toca no existente)

### Fase 4 — Finanças Pessoais
- [ ] Models: `accountModel` (contas/carteiras), `transactionModel` (receita/despesa, categoria, conta, data, recorrência), `budgetModel` (orçamento mensal por categoria)
- [ ] **Integração com Fase 3:** parcela de contrato marcada como paga → gera transação de receita automaticamente
- [ ] Dashboard financeiro: fluxo de caixa mensal, despesas por categoria, CLT × freelance no total de receitas
- [ ] Recorrências (salário, assinaturas, contas fixas)
- [ ] Lançamento rápido via Telegram: `/gasto 45 mercado`, `/recebi 2500 cliente-x`
- [ ] **Importação de extratos (OFX/CSV):** upload pelo app E envio do arquivo pelo Telegram (bot recebe o documento, faz parse, mostra prévia e pede confirmação antes de gravar)
- [ ] Deduplicação na importação (mesma transação vinda de extrato + lançamento manual)
- [ ] Metas de poupança vinculadas a sonhos (ponte para Fase 5)
- **Esforço:** ~14-18h (importação incluída) · **Risco:** médio (domínio sensível — exige backup da Fase 0 funcionando e testes de consistência)

### Fase 4b — Open Finance (automação de lançamentos)
*Decisão validada (2026-06-10): avaliar Open Finance para automatizar lançamentos.*
- [ ] **Spike de pesquisa:** acesso direto às APIs do Open Finance Brasil exige instituição autorizada pelo BACEN — inviável para pessoa física. O caminho real é um **agregador** (Pluggy, Belvo, Klavi...) que oferece API de contas/transações via Open Finance.
- [ ] **Prioridade: opções gratuitas.** Avaliar nesta ordem: (1) free/dev tier dos agregadores (Pluggy tem tier de desenvolvedor; verificar limites de contas/requisições vigentes), (2) alternativas gratuitas fora do Open Finance — parse automático de notificações/e-mails de transação, (3) só considerar plano pago se nada gratuito atender. Critérios: bancos suportados (os seus), limites do tier gratuito, política de dados
- [ ] Se viável: serviço de sincronização periódica → transações entram como "pendentes de categorização" e o FutureTwin/regras sugerem categoria
- [ ] Fallback definido: se custo/burocracia não compensar, a importação OFX/CSV da Fase 4 já cobre o fluxo
- **Esforço:** spike ~3h + integração ~8-12h se aprovada · **Risco:** alto (dependência externa, custos, homologação) — por isso separada da Fase 4

### Fase 5 — Sonhos & Horizontes de Vida
- [ ] Estender `goalModel`: horizonte (vida / 5 anos / 1 ano / trimestre), custo estimado, `savingGoalId` (vínculo com poupança), imagem de capa
- [ ] Tela "Sonhos": board visual de metas de vida com progresso financeiro e de execução
- [ ] Cadeia completa visível: Sonho → Meta anual → Projeto → Tarefas → Plano diário ("o que eu faço hoje contribui com o quê?")
- [ ] Revisão trimestral guiada (checklist/ritual no app)
- **Esforço:** ~6-8h · **Risco:** baixo

### Fase 6 — Tempo & Agenda
- [ ] Time blocking no Daily Planner com cor por área
- [ ] Sessões do Focus Room passam a registrar área/projeto → relatório "para onde foi meu tempo" (CLT × freelance × hobby × vida)
- [ ] Integração Google Calendar (leitura primeiro; escrita depois) — OAuth Google já existe no login
- [ ] Briefing diário via Telegram (base já existe no kronos): agenda do dia, tarefas críticas, parcelas a vencer
- **Esforço:** ~8-10h · **Risco:** médio (OAuth/Calendar API)

### Fase 7 — FutureTwin AI personalizado
*Reaproveita o plano existente (`2026-06-03-fase3-futuretwin-ai.md`) com persona e contexto redefinidos:*
- [ ] System prompt com seu perfil: engenheiro civil projetista, freelancer, criador de sistemas, suas áreas e metas
- [ ] Contexto ampliado: além de tarefas/hábitos, incluir finanças, projetos de clientes e distribuição de tempo
- [ ] Insights diários: sobrecarga, prazos de projetos em risco, gastos fora do orçamento, desequilíbrio entre áreas
- [ ] Chat via app e via Telegram (mesmo serviço, duas interfaces)
- [ ] Análise semanal: retrospectiva automática por área
- **Esforço:** ~8-10h · **Risco:** baixo (plano já detalhado, só muda o contexto)

### Fase 8 — Gamificação & Design System (opcionais, já planejadas)
- Executar os planos existentes de Design System (Fase 1 antiga) e Gamificação (Fase 2 antiga) quando/se fizer sentido — são ortogonais a este plano e podem rodar em paralelo ou depois.

### Fase 9 — Portfólio no domínio raiz (`orkest.pro`)
*Decisão validada (2026-06-10): o domínio raiz vira sua vitrine profissional.*
- [ ] Site estático/SSG (Astro ou similar) servido pelo Nginx no mesmo VPS — sem custo extra
- [ ] Seções: apresentação profissional (engenheiro civil projetista), serviços de projetos de engenharia para clientes parceiros, portfólio de sistemas/apps/IA, contato
- [ ] **Integração com a Fase 3:** projetos de software com flag "publicar no portfólio" aparecem automaticamente (endpoint público read-only ou build estático periódico)
- [ ] SEO básico + link discreto de login para o app (`app.orkest.pro`)
- [ ] Configurar Nginx + DNS Cloudflare para o domínio raiz
- **Esforço:** ~6-10h (design incluído) · **Risco:** baixo · **Independente:** pode ser feita a qualquer momento após a Fase 0

---

## 4. Ordem Recomendada e Dependências

```
Fase 0 (estabilizar) ──► Fase 1 (pessoal) ──► Fase 2 (áreas) ──┬──► Fase 3 (projetos) ──► Fase 4 (finanças) ──► Fase 4b (open finance)
                     │                                         │                                            └──► Fase 5 (sonhos)
                     │                                         ├──► Fase 6 (tempo)
                     │                                         └──► Fase 7 (IA) — melhor depois da 4 (mais dados p/ contexto)
                     └──► Fase 9 (portfólio) — independente, a qualquer momento
```

**Esforço total estimado:** ~70-90h de implementação (paralelizável com agentes em várias fases).
**Entrega de valor incremental:** cada fase é utilizável sozinha; nada exige big-bang.

---

## 5. Decisões

### Validadas em 2026-06-10
1. **Multiusuário:** manter a infra, desabilitar registro público. ✅
2. **Finanças:** importação OFX/CSV pelo app E pelo Telegram desde a Fase 4; Open Finance via agregador avaliado na Fase 4b. ✅
3. **Trabalho CLT:** gestão completa (disciplinas, pranchas, revisões) — Fase 3 serve às duas áreas. ✅
4. **Dados sensíveis:** backup + acesso restrito bastam; sem criptografia em repouso. ✅

5. **Telegram como canal de captura rápida:** assumido (base já pronta no código), sem objeção do usuário. ✅
6. **Domínio raiz `orkest.pro`:** vira portfólio pessoal/profissional (engenharia + sistemas) — ver Fase 9. ✅
7. **Fase 3 generalizada:** projetos de sistemas/apps também são gerenciados, via templates de workflow por tipo. ✅
8. **Fase 4b:** priorizar opções gratuitas (free tiers de agregadores antes de qualquer plano pago). ✅

*Todas as decisões de escopo estão fechadas. Plano pronto para execução a partir da Fase 0.*

---

## 6. O Que NÃO Muda

- Stack MERN, deploy no VPS Oracle, Cloudflare — mantidos
- Hierarquia Goals → Projects → Tasks → Daily Plan — mantida (ganha `areaId`)
- Focus Room, Biblioteca, Hábitos, Gamificação — mantidos e integrados às áreas
- Os 30 testes existentes — continuam passando; cada fase adiciona os seus
