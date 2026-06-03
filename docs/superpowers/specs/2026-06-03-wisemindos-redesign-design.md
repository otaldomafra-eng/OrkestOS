# WiseMindOS — Redesign v2.0: Design Spec

**Data:** 2026-06-03  
**Status:** Aprovado  
**Autor:** Otaldo Mafra + Claude

---

## Contexto

O WiseMindOS já tem uma base sólida: dark mode, stack React/Vite/Tailwind, módulos de rastreamento (metas, projetos, tarefas, hábitos, foco, biblioteca) e integração Telegram. O sistema de design atual usa laranja como acento primário com identidade visual funcional mas sem personalidade forte.

O objetivo deste redesign é transformar o WiseMindOS em uma plataforma de produtividade de alto impacto visual — inspirada em Habitica, SuperBetter, Mindbloom e Fitocracy — com três pilares:

1. **Redesign visual** — fundo preto, neon branco como acento primário, minimalismo com profundidade
2. **Gamificação** — sistema de XP, níveis e conquistas integrado ao fluxo de produtividade
3. **Novos módulos prioritários** — FutureTwin AI completo + Finance/Diet no roadmap

---

## Abordagem: Fases Incrementais

Implementação em 3 fases independentes, cada uma entregável e testável:

- **Fase 1** — Design System + Nova Navegação (Hub)
- **Fase 2** — Motor de Gamificação (XP, Níveis, Conquistas)
- **Fase 3** — FutureTwin AI completo + módulos futuros

---

## Fase 1 — Design System + Navegação Hub

### Paleta de Cores

| Token | Valor | Uso |
|-------|-------|-----|
| `--canvas` | `#000000` | Background base |
| `--surface` | `#0a0a0c` | Cards, containers |
| `--surface2` | `#101014` | Elementos elevados |
| `--border` | `rgba(255,255,255,0.07)` | Bordas padrão |
| `--border-md` | `rgba(255,255,255,0.13)` | Bordas com ênfase |
| `--ink` | `#ffffff` | Texto principal |
| `--ink-dim` | `rgba(255,255,255,0.45)` | Texto secundário |
| `--ink-mute` | `rgba(255,255,255,0.22)` | Labels, placeholders |
| **`--primary`** | `#ffffff` | **Acento primário (substitui laranja)** |
| `--green` | `#11ff99` | XP, sucesso, conclusão |
| `--red` | `#ff2047` | Erros, atraso |
| `--yellow` | `#ffc53d` | Avisos |
| `--blue` | `#3b9eff` | Info, stats |

O laranja (`#ff801f`) é removido completamente como acento primário.

### Efeitos Visuais

- **Glow neon:** `box-shadow: 0 0 12px rgba(255,255,255,0.5), 0 0 24px rgba(255,255,255,0.15)` nos elementos primários
- **Linha de brilho:** `::before` com `background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)` no topo de cards
- **Blobs de luz ambiente:** `position: fixed`, `filter: blur(100px)`, z-index 0 — branco, verde e azul em cantos opostos
- **Glassmorphism leve:** `backdrop-filter: blur(20px)` em sidebar e bottom nav

### Botões

| Variante | Estilo |
|----------|--------|
| Primary | `background: #fff; color: #000; box-shadow: 0 0 20px rgba(255,255,255,0.2)` |
| Outline | `border: 1px solid rgba(255,255,255,0.13); color: rgba(255,255,255,0.45)` |
| Ghost | `transparent`, sem borda, texto dimm |

### Navegação — Hub Central

**Desktop:** Sidebar fixa à esquerda (220px) com:
- Logo + subtítulo
- Grupos de nav com labels de seção (Principal / Ferramentas / Em breve)
- Indicador de página ativa: barra vertical branca com glow à esquerda do item
- Footer com avatar, nome, nível do usuário

**Mobile:** BottomNav com 3 ícones fixos: Início · Foco · Perfil

**Dashboard como Hub:** O Dashboard deixa de ser só analytics e passa a ser o ponto de entrada central com:
- Header: saudação + data + contagem de tarefas do dia
- XP Banner: nível atual, barra de progresso com ponto de luz neon, XP faltante
- Stats row: 4 pills com Produtividade %, Metas ativas, Tarefas hoje, Streak
- Grid de módulos 2×N: cards clicáveis para cada área do app
- Módulos "Em breve" (Finance, Diet) visíveis mas desabilitados com `opacity: 0.45; border-style: dashed`

### Arquivos a Modificar

- `frontend/src/App.css` — substituir tokens de cor, remover laranja, adicionar variáveis novas
- `frontend/src/components/BottomNav.jsx` — reduzir para 3 itens no mobile, adicionar sidebar para desktop
- `frontend/src/layouts/AppLayout.jsx` — adicionar sidebar desktop, ajustar grid layout
- `frontend/src/pages/Dashboard.jsx` — refatorar para hub central com grid de módulos
- `frontend/src/components/GradientButton.jsx` — atualizar variantes (primary/outline/ghost)
- `frontend/src/components/Card.jsx` — adicionar linha de brilho `::before`, glassmorphism
- Todos os componentes: substituir referências a `accent-orange` por `primary` (branco)

---

## Fase 2 — Motor de Gamificação

### Estrutura de Dados

```js
// Perfil de XP do usuário (localStorage + backend)
{
  xp: number,          // XP total acumulado
  level: number,       // Nível atual (1–100)
  levelTitle: string,  // "Executor", "Estrategista", etc.
  achievements: [      // Conquistas desbloqueadas
    { id, unlockedAt }
  ],
  streakDays: number,  // Streak atual em dias
}
```

### Tabela de Níveis

| Nível | Nome | XP Mínimo |
|-------|------|-----------|
| 1–3 | 🌱 Aprendiz | 0 |
| 4–6 | ⚡ Constante | 500 |
| 7–9 | ⚔️ Executor | 2.500 |
| 10–14 | 🧠 Estrategista | 5.000 |
| 15–19 | 🔥 Disciplinado | 10.000 |
| 20–29 | 🏆 Mestre | 20.000 |
| 30+ | 👑 Lenda | 50.000 |

### Fontes de XP

| Ação | XP |
|------|----|
| Tarefa comum concluída | +10 |
| Tarefa importante concluída | +25 |
| Hábito diário completado | +20 |
| Pomodoro completo (25 min) | +15 |
| Plano diário 100% concluído | +75 |
| Meta mid-term concluída | +150 |
| Meta long-term concluída | +300 |
| Meta final concluída | +500 |
| Streak bônus (a cada 7 dias) | +50 |
| Projeto concluído | +200 |

### Conquistas (lançamento — 20 total)

| ID | Nome | Critério |
|----|------|----------|
| `first-task` | 🎯 Primeira Tarefa | Completar 1 tarefa |
| `streak-7` | 🔥 Semana Perfeita | 7 dias de streak |
| `streak-14` | 🔥 Streak 14 | 14 dias consecutivos |
| `streak-30` | 💎 Imparável | 30 dias consecutivos |
| `pomodoro-10` | ⚡ Foco Total | 10 Pomodoros completos |
| `pomodoro-50` | 🎖 Atleta do Foco | 50 Pomodoros |
| `first-goal` | 🏅 Meta Batida | 1ª meta concluída |
| `goals-5` | 🎯 Caçador de Metas | 5 metas concluídas |
| `habits-21` | 🌱 21 Dias | Hábito por 21 dias |
| `level-10` | 🧠 Estrategista | Alcançar Nível 10 |
| `level-20` | 👑 Mestre | Alcançar Nível 20 |
| `daily-plan-7` | 📋 Planejador | Plano diário 7 dias seguidos |
| `tasks-50` | ✅ Produtivo | 50 tarefas concluídas |
| `tasks-100` | ⚡ Centurião | 100 tarefas concluídas |
| `first-project` | 🏗 Construtor | 1º projeto concluído |
| `projects-5` | 🚀 Executor | 5 projetos concluídos |
| `library-10` | 📚 Estudioso | 10 notas na biblioteca |
| `morning-person` | 🌅 Madrugador | Tarefa concluída antes das 8h |
| `night-owl` | 🦉 Coruja | Tarefa concluída após 22h |
| `xp-1000` | ⭐ Mil Pontos | Acumular 1.000 XP |

### Novos Arquivos

- `frontend/src/context/GamificationContext.jsx` — estado de XP, nível, conquistas
- `frontend/src/hooks/useXP.js` — hook para disparar ganho de XP
- `frontend/src/components/XPToast.jsx` — notificação flutuante "+25 XP" ao completar ações
- `frontend/src/components/LevelUpModal.jsx` — modal de subida de nível com animação
- `frontend/src/pages/Achievements.jsx` — página de conquistas completa

### Integração com Módulos Existentes

Nos seguintes pontos do código, inserir chamada `addXP(amount, reason)`:
- `HabitCard.jsx` — toggle de conclusão
- `TaskItem.jsx` — checkbox de conclusão  
- `DailyTaskTracker.jsx` — conclusão de tarefa planejada
- `FocusRoom.jsx` — `handleTimerComplete` (já existente)
- `GoalTracker.jsx` — mudança de status para "concluída"
- `ProjectTracker.jsx` — mudança de status para "concluído"

---

## Fase 3 — FutureTwin AI

### Funcionalidades

**Análise de padrões:**
- Detecta dias da semana com baixa produtividade
- Identifica hábitos em risco de quebra
- Calcula projeção de conclusão de metas no ritmo atual
- Compara semana atual vs média histórica

**Chat conversacional:**
- Interface de chat com o "Eu do Futuro"
- Contexto persistente da conversa (últimas 20 mensagens)
- Sugestões rápidas de perguntas frequentes
- Respostas baseadas em dados reais do usuário

**Painel de Insights:**
- 3 tipos: ⚠️ Atenção (amarelo), ✅ Destaque (verde), 📊 Previsão (azul)
- Gerados uma vez por dia, atualizados manualmente
- Cards com explicação concisa + dado específico

**Análise Semanal:**
- Barras de progresso para Produtividade %, Hábitos %, Horas de Foco, Tarefas concluídas
- Comparação com semana anterior

### Arquivos a Modificar/Criar

- `frontend/src/modules/simulator_room/FutureTwin.jsx` — refatorar o esqueleto existente com UI completa
- `backend/routes/futuretwin.js` — endpoints de análise e chat (novo)
- `backend/services/aiAnalysis.js` — lógica de análise de padrões + integração Claude API (novo)

### Integração com Claude API

O FutureTwin usa `claude-sonnet-4-6` com:
- System prompt fixo com persona ("Você é o eu futuro de [nome]...")
- Context injetado: resumo semanal de metas, hábitos, tarefas e XP
- Prompt caching no system prompt para reduzir custo
- Histórico de conversa limitado a 20 mensagens

---

## Módulos Futuros (pós Fase 3)

- **Finance Tracker** — receitas, despesas, metas financeiras integradas ao sistema de metas
- **Diet Tracker** — registro de refeições, metas calóricas, integrado ao Habit Tracker

Já visíveis como cards "Em breve" no Hub desde a Fase 1.

---

## Verificação (como testar cada fase)

### Fase 1
1. `npm run dev` no frontend — verificar que laranja foi removido de todos os componentes
2. Abrir Dashboard — hub com grid de módulos deve aparecer
3. Testar em viewport desktop (>1024px): sidebar deve aparecer
4. Testar em viewport mobile (<768px): BottomNav com 3 itens deve aparecer
5. Verificar glow nos botões primários e barra XP

### Fase 2
1. Completar uma tarefa — toast "+X XP" deve aparecer
2. Verificar que XP foi somado no perfil (localStorage ou backend)
3. Completar tarefas suficientes para subir de nível — modal de level up deve aparecer
4. Acessar `/achievements` — grid de conquistas com desbloqueadas destacadas

### Fase 3
1. Acessar FutureTwin — hero com stats, chat e insights devem aparecer
2. Enviar mensagem no chat — resposta da IA deve chegar em <3s
3. Verificar que insights são gerados com base nos dados reais do usuário (não mock)
4. Testar análise semanal com dados de pelo menos 7 dias
