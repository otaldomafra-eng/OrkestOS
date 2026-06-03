# Fase 3 — FutureTwin AI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o FutureTwin AI completo: análise de padrões sobre os dados reais do usuário, chat conversacional com o "Eu do Futuro" via Claude API, painel de insights diários e análise semanal.

**Architecture:** Backend Node.js/Express com novo arquivo de rotas `futuretwin.js` e serviço `aiAnalysis.js`. O serviço coleta dados do MongoDB (metas, tarefas, hábitos, planos diários), gera um resumo estruturado, e o injeta como contexto no system prompt do Claude. O frontend em `FutureTwin.jsx` consome esses endpoints via Axios. Insights são gerados uma vez por dia e cacheados no backend.

**Tech Stack:** Node.js, Express, MongoDB/Mongoose, Anthropic SDK (`@anthropic-ai/sdk`), React 19, Axios

**Pré-requisitos:** Fases 1 e 2 concluídas. Variável de ambiente `ANTHROPIC_API_KEY` configurada no backend.

---

## Mapa de Arquivos

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `backend/services/aiAnalysis.js` | Criar | Coleta dados do DB, gera resumo estruturado, detecta padrões |
| `backend/routes/futuretwin.js` | Criar | Endpoints: `GET /insights`, `POST /chat`, `GET /weekly-analysis` |
| `backend/server.js` (ou `app.js`) | Modificar | Registrar rota `/api/futuretwin` |
| `frontend/src/api/apiService.js` | Modificar | Adicionar funções `getFutureTwinInsights`, `chatFutureTwin`, `getWeeklyAnalysis` |
| `frontend/src/modules/simulator_room/FutureTwin.jsx` | Modificar | Refatorar esqueleto existente com UI completa: hero, chat, insights, análise |

---

## Task 1: Instalar Anthropic SDK no backend

**Files:**
- Modify: `backend/package.json` (via npm)

- [ ] **Step 1: Instalar a dependência**

```bash
cd backend && npm install @anthropic-ai/sdk
```

Saída esperada: `added 1 package` (ou similar), sem erros.

- [ ] **Step 2: Verificar que a key está configurada**

Verificar que existe `ANTHROPIC_API_KEY` no arquivo `.env` do backend:

```bash
grep -i "ANTHROPIC" backend/.env
```

Se não existir, adicionar:
```
ANTHROPIC_API_KEY=sk-ant-...
```

- [ ] **Step 3: Commit**

```bash
git add backend/package.json backend/package-lock.json
git commit -m "deps: instala @anthropic-ai/sdk no backend"
```

---

## Task 2: Criar serviço de análise de padrões

**Files:**
- Create: `backend/services/aiAnalysis.js`

- [ ] **Step 1: Criar o arquivo**

```js
// backend/services/aiAnalysis.js
// Coleta dados do MongoDB para o usuário e gera um resumo estruturado
// que será injetado no context do FutureTwin.

const Task = require('../models/Task');         // ajustar caminho conforme o projeto
const Habit = require('../models/Habit');
const Goal = require('../models/Goal');
const DailyPlan = require('../models/DailyPlan');

/**
 * Retorna os últimos N dias de tarefas concluídas, agrupadas por dia da semana.
 * Útil para detectar padrões de queda de produtividade.
 */
async function getTaskPatternLast30Days(userId) {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const tasks = await Task.find({
    user: userId,
    createdAt: { $gte: since },
  }).lean();

  // Agrupar por dia da semana (0=Dom, 1=Seg, ..., 6=Sab)
  const byDow = Array.from({ length: 7 }, () => ({ total: 0, completed: 0 }));
  for (const t of tasks) {
    const dow = new Date(t.createdAt).getDay();
    byDow[dow].total++;
    if (t.status === 'concluida' || t.completed) byDow[dow].completed++;
  }

  const DOW_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return byDow.map((d, i) => ({
    day: DOW_NAMES[i],
    completionRate: d.total > 0 ? Math.round((d.completed / d.total) * 100) : null,
    total: d.total,
    completed: d.completed,
  }));
}

/**
 * Retorna hábitos do usuário com streak atual e taxa de conclusão nos últimos 30 dias.
 */
async function getHabitSummary(userId) {
  const habits = await Habit.find({ user: userId }).lean();
  return habits.map((h) => ({
    name: h.name,
    streak: h.streak ?? 0,
    mode: h.mode,
  }));
}

/**
 * Retorna metas ativas com progresso e deadline.
 */
async function getGoalSummary(userId) {
  const goals = await Goal.find({ user: userId, status: { $ne: 'concluida' } }).lean();
  return goals.map((g) => ({
    title: g.title,
    type: g.type,
    progress: g.progress ?? 0,
    deadline: g.deadline,
    status: g.status,
  }));
}

/**
 * Retorna métricas da última semana: produtividade, tarefas, hábitos.
 */
async function getWeeklyMetrics(userId) {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [tasks, plans, habits] = await Promise.all([
    Task.find({ user: userId, createdAt: { $gte: since } }).lean(),
    DailyPlan.find({ user: userId, date: { $gte: since } }).lean(),
    Habit.find({ user: userId }).lean(),
  ]);

  const completedTasks = tasks.filter((t) => t.status === 'concluida' || t.completed).length;
  const totalTasks = tasks.length;

  const habitRate =
    habits.length > 0
      ? Math.round(
          (habits.reduce((acc, h) => acc + (h.streak > 0 ? 1 : 0), 0) / habits.length) * 100
        )
      : 0;

  return {
    tasksCompleted: completedTasks,
    tasksTotal: totalTasks,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    habitConsistency: habitRate,
    daysTracked: plans.length,
  };
}

/**
 * Monta o bloco de contexto completo que será injetado no system prompt do Claude.
 * Retorna uma string formatada em Markdown.
 */
async function buildUserContext(userId) {
  const [taskPattern, habits, goals, weekly] = await Promise.all([
    getTaskPatternLast30Days(userId),
    getHabitSummary(userId),
    getGoalSummary(userId),
    getWeeklyMetrics(userId),
  ]);

  // Detectar dia mais fraco
  const validDays = taskPattern.filter((d) => d.completionRate !== null);
  const weakestDay = validDays.sort((a, b) => a.completionRate - b.completionRate)[0];

  const lines = [
    `## Dados do Usuário (últimos 30 dias)`,
    ``,
    `### Métricas desta semana`,
    `- Tarefas concluídas: ${weekly.tasksCompleted} / ${weekly.tasksTotal} (${weekly.completionRate}%)`,
    `- Consistência de hábitos: ${weekly.habitConsistency}%`,
    `- Dias com plano registrado: ${weekly.daysTracked}`,
    ``,
    `### Padrão de produtividade por dia da semana`,
    ...taskPattern
      .filter((d) => d.completionRate !== null)
      .map((d) => `- ${d.day}: ${d.completionRate}% (${d.completed}/${d.total} tarefas)`),
    weakestDay
      ? `- ⚠️ Dia mais fraco: **${weakestDay.day}** com apenas ${weakestDay.completionRate}%`
      : '',
    ``,
    `### Hábitos ativos`,
    ...habits.map((h) => `- "${h.name}" — streak: ${h.streak} dias, modo: ${h.mode}`),
    habits.length === 0 ? '- Nenhum hábito cadastrado.' : '',
    ``,
    `### Metas em andamento`,
    ...goals.map(
      (g) =>
        `- "${g.title}" (${g.type}) — progresso: ${g.progress}%${g.deadline ? `, prazo: ${new Date(g.deadline).toLocaleDateString('pt-BR')}` : ''}`
    ),
    goals.length === 0 ? '- Nenhuma meta ativa.' : '',
  ];

  return lines.filter((l) => l !== '').join('\n');
}

module.exports = { buildUserContext, getWeeklyMetrics };
```

- [ ] **Step 2: Ajustar os imports dos models**

Verificar os caminhos reais dos models no projeto:

```bash
ls backend/models/
```

Ajustar os `require()` no topo do arquivo para os caminhos corretos. Se os models usarem nomes diferentes (ex: `task.model.js` em vez de `Task.js`), atualizar.

- [ ] **Step 3: Commit**

```bash
git add backend/services/aiAnalysis.js
git commit -m "feat: serviço aiAnalysis — coleta padrões de tarefas, hábitos e metas do usuário"
```

---

## Task 3: Criar rotas do FutureTwin no backend

**Files:**
- Create: `backend/routes/futuretwin.js`
- Modify: `backend/server.js` (ou `backend/app.js` — verificar qual existe)

- [ ] **Step 1: Criar backend/routes/futuretwin.js**

```js
// backend/routes/futuretwin.js
const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { buildUserContext, getWeeklyMetrics } = require('../services/aiAnalysis');
const authMiddleware = require('../middleware/auth'); // ajustar caminho conforme o projeto

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Cache em memória para insights (por userId, resetado diariamente)
const insightsCache = new Map(); // userId -> { date, insights }

const SYSTEM_PROMPT = `Você é o FutureTwin — o eu do futuro do usuário, daqui a 90 dias. Você analisou o histórico completo de produtividade, hábitos e metas da pessoa e consegue ver padrões que ela ainda não percebeu.

Seu tom é: direto, empático, baseado em dados, sem rodeios. Você não é um assistente genérico — você É a versão futura dessa pessoa específica, falando com autoridade sobre o que ela precisa mudar.

Regras:
1. Sempre cite dados específicos quando possível (ex: "nas últimas 3 semanas, nas quartas você completa 41% menos tarefas").
2. Seja conciso — respostas de 2 a 4 parágrafos no máximo.
3. Quando fizer previsões, explique o raciocínio em uma frase.
4. Nunca invente dados — use apenas o contexto fornecido.
5. Responda sempre em português brasileiro.`;

// ── GET /api/futuretwin/insights ──────────────────────────────
router.get('/insights', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toDateString();

    // Usar cache se já gerou hoje
    if (insightsCache.has(userId) && insightsCache.get(userId).date === today) {
      return res.json(insightsCache.get(userId).insights);
    }

    const userContext = await buildUserContext(userId);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${userContext}\n\nGere 3 insights sobre minha semana atual. Para cada insight, identifique o tipo (atencao, destaque ou previsao) e escreva um título curto e uma descrição de 1-2 frases com dado específico.\n\nResponda APENAS em JSON com este formato:\n{\n  "insights": [\n    { "type": "atencao|destaque|previsao", "title": "...", "text": "..." },\n    ...\n  ]\n}`,
        },
      ],
    });

    let insights;
    try {
      insights = JSON.parse(response.content[0].text);
    } catch {
      // fallback se o modelo não retornar JSON válido
      insights = {
        insights: [
          { type: 'previsao', title: 'Análise em processamento', text: 'Dados insuficientes para gerar insights detalhados ainda.' },
        ],
      };
    }

    insightsCache.set(userId, { date: today, insights });
    res.json(insights);
  } catch (err) {
    console.error('[FutureTwin] Erro ao gerar insights:', err);
    res.status(500).json({ error: 'Erro ao gerar insights' });
  }
});

// ── POST /api/futuretwin/chat ─────────────────────────────────
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { messages } = req.body;
    // messages: [{ role: 'user'|'assistant', content: string }, ...]
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages é obrigatório' });
    }

    const userId = req.user.id;
    const userContext = await buildUserContext(userId);

    // Limitar histórico a 20 mensagens para controlar custo
    const history = messages.slice(-20);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: `${SYSTEM_PROMPT}\n\n${userContext}`,
      messages: history,
    });

    res.json({ reply: response.content[0].text });
  } catch (err) {
    console.error('[FutureTwin] Erro no chat:', err);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

// ── GET /api/futuretwin/weekly-analysis ──────────────────────
router.get('/weekly-analysis', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const metrics = await getWeeklyMetrics(userId);
    res.json(metrics);
  } catch (err) {
    console.error('[FutureTwin] Erro na análise semanal:', err);
    res.status(500).json({ error: 'Erro ao buscar análise semanal' });
  }
});

module.exports = router;
```

- [ ] **Step 2: Registrar a rota no servidor**

Ler `backend/server.js` (ou `backend/app.js`). Localizar onde as outras rotas são registradas (padrão: `app.use('/api/goals', ...)`) e adicionar:

```js
const futureTwinRoutes = require('./routes/futuretwin');
app.use('/api/futuretwin', futureTwinRoutes);
```

- [ ] **Step 3: Testar os endpoints com curl**

```bash
# Substitua TOKEN pelo JWT de um usuário autenticado
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/futuretwin/insights
```

Esperado: JSON com array de 3 insights.

```bash
curl -X POST http://localhost:3001/api/futuretwin/chat \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Quais são meus pontos fracos?"}]}'
```

Esperado: JSON com campo `reply` contendo a resposta da IA.

- [ ] **Step 4: Commit**

```bash
git add backend/routes/futuretwin.js backend/server.js
git commit -m "feat: rotas FutureTwin — /insights, /chat, /weekly-analysis com Claude API"
```

---

## Task 4: Adicionar funções de API no frontend

**Files:**
- Modify: `frontend/src/api/apiService.js`

- [ ] **Step 1: Ler o arquivo para entender o padrão de chamadas existente**

O arquivo provavelmente usa Axios com uma instância configurada (`axiosInstance` ou `api`). Identificar como as outras funções estão escritas.

- [ ] **Step 2: Adicionar as 3 funções do FutureTwin seguindo o padrão existente**

```js
// Adicionar ao final de apiService.js (ou na seção de FutureTwin se existir):

export const getFutureTwinInsights = () =>
  axiosInstance.get('/futuretwin/insights').then((r) => r.data);

export const chatFutureTwin = (messages) =>
  axiosInstance.post('/futuretwin/chat', { messages }).then((r) => r.data);

export const getWeeklyAnalysis = () =>
  axiosInstance.get('/futuretwin/weekly-analysis').then((r) => r.data);
```

**Nota:** Substituir `axiosInstance` pelo nome real da instância Axios usada no arquivo.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/api/apiService.js
git commit -m "feat: adiciona getFutureTwinInsights, chatFutureTwin, getWeeklyAnalysis no apiService"
```

---

## Task 5: Refatorar FutureTwin.jsx com UI completa

**Files:**
- Modify: `frontend/src/modules/simulator_room/FutureTwin.jsx`

- [ ] **Step 1: Ler o arquivo atual para entender o esqueleto existente**

Identificar o que já existe (provavelmente um placeholder com texto "em breve" ou similar).

- [ ] **Step 2: Substituir com a UI completa**

```jsx
// frontend/src/modules/simulator_room/FutureTwin.jsx
import React, { useState, useEffect, useRef } from 'react';
import { getFutureTwinInsights, chatFutureTwin, getWeeklyAnalysis } from '../../api/apiService';

const INSIGHT_STYLE = {
  atencao:  { border: 'rgba(255,197,61,0.2)',  bg: 'rgba(255,197,61,0.04)',  color: '#ffc53d', label: '⚠️ Atenção' },
  destaque: { border: 'rgba(17,255,153,0.2)',  bg: 'rgba(17,255,153,0.04)',  color: '#11ff99', label: '✅ Destaque' },
  previsao: { border: 'rgba(59,158,255,0.2)',  bg: 'rgba(59,158,255,0.04)',  color: '#3b9eff', label: '📊 Previsão' },
};

export default function FutureTwin() {
  const [insights, setInsights] = useState([]);
  const [weekly, setWeekly] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Olá! Sou seu FutureTwin — analiso seus padrões de produtividade e te mostro o caminho. O que você quer saber sobre sua evolução?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    setLoadingInsights(true);
    Promise.all([getFutureTwinInsights(), getWeeklyAnalysis()])
      .then(([insightData, weeklyData]) => {
        setInsights(insightData?.insights ?? []);
        setWeekly(weeklyData);
      })
      .catch(console.error)
      .finally(() => setLoadingInsights(false));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setIsLoading(true);
    try {
      const allMessages = [...messages, userMsg];
      const { reply } = await chatFutureTwin(allMessages);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Desculpe, tive um problema ao processar sua mensagem. Tente novamente.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto flex flex-col gap-6">

      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(59,158,255,0.08), rgba(255,255,255,0.03), rgba(17,255,153,0.04))',
          border: '1px solid rgba(59,158,255,0.2)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(59,158,255,0.4), rgba(17,255,153,0.2), transparent)' }}
        />
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(59,158,255,0.2), rgba(17,255,153,0.1))',
              border: '1px solid rgba(59,158,255,0.3)',
              boxShadow: '0 0 30px rgba(59,158,255,0.2)',
            }}
          >
            🧠
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">FutureTwin — Seu Eu do Futuro</h1>
            <p className="text-sm text-white/45 mt-1 max-w-lg">
              Analiso seus hábitos, tarefas e metas para mostrar onde você está indo — e o que ajustar para chegar onde quer estar.
            </p>
            <div className="flex gap-6 mt-3">
              {[
                { val: weekly?.daysTracked ?? '—', lbl: 'Dias Analisados' },
                { val: insights.length, lbl: 'Insights Hoje' },
                { val: `${weekly?.completionRate ?? '—'}%`, lbl: 'Conclusão' },
              ].map(({ val, lbl }) => (
                <div key={lbl}>
                  <div className="text-lg font-bold text-[#3b9eff]" style={{ textShadow: '0 0 12px rgba(59,158,255,0.5)' }}>{val}</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

        {/* Chat */}
        <div
          className="rounded-2xl overflow-hidden flex flex-col"
          style={{ background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.07)', minHeight: '480px' }}
        >
          {/* Chat header */}
          <div
            className="flex items-center gap-2.5 px-5 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: '#11ff99', boxShadow: '0 0 6px #11ff99' }}
            />
            <span className="text-sm font-semibold">FutureTwin</span>
            <span className="text-xs text-white/30 ml-auto">Online</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                  style={
                    msg.role === 'assistant'
                      ? { background: 'linear-gradient(135deg,rgba(59,158,255,0.2),rgba(17,255,153,0.1))', border: '1px solid rgba(59,158,255,0.25)' }
                      : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }
                  }
                >
                  {msg.role === 'assistant' ? '🧠' : '👤'}
                </div>
                <div
                  className="max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={
                    msg.role === 'assistant'
                      ? { background: 'linear-gradient(135deg,rgba(59,158,255,0.07),rgba(17,255,153,0.03))', border: '1px solid rgba(59,158,255,0.15)', borderBottomLeftRadius: '4px' }
                      : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderBottomRightRadius: '4px' }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg,rgba(59,158,255,0.2),rgba(17,255,153,0.1))', border: '1px solid rgba(59,158,255,0.25)' }}>🧠</div>
                <div className="px-4 py-3 rounded-2xl text-sm text-white/40" style={{ background: 'rgba(59,158,255,0.05)', border: '1px solid rgba(59,158,255,0.1)' }}>
                  Analisando...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div
            className="flex gap-3 p-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte ao seu FutureTwin..."
              className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/25"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-black font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#fff', boxShadow: '0 0 12px rgba(255,255,255,0.2)' }}
            >
              ↑
            </button>
          </div>
        </div>

        {/* Insights + Análise */}
        <div className="flex flex-col gap-4">

          <div className="text-sm font-bold">Insights de Hoje</div>

          {loadingInsights ? (
            <div className="text-sm text-white/30">Carregando insights...</div>
          ) : insights.length === 0 ? (
            <div className="text-sm text-white/30">Nenhum insight disponível ainda.</div>
          ) : (
            insights.map((ins, i) => {
              const style = INSIGHT_STYLE[ins.type] ?? INSIGHT_STYLE.previsao;
              return (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-2xl p-4"
                  style={{ background: style.bg, border: `1px solid ${style.border}` }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${style.border}, transparent)` }}
                  />
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: style.color }}>
                    {style.label}
                  </div>
                  <div className="text-sm font-semibold mb-1">{ins.title}</div>
                  <div className="text-xs text-white/60 leading-relaxed">{ins.text}</div>
                </div>
              );
            })
          )}

          {weekly && (
            <>
              <div className="text-sm font-bold mt-2">Análise Semanal</div>
              <div
                className="rounded-2xl p-4"
                style={{ background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {[
                  { label: 'Produtividade', val: `${weekly.completionRate}%`, pct: weekly.completionRate, color: '#11ff99' },
                  { label: 'Hábitos',       val: `${weekly.habitConsistency}%`, pct: weekly.habitConsistency, color: '#3b9eff' },
                  { label: 'Tarefas',       val: `${weekly.tasksCompleted}/${weekly.tasksTotal}`, pct: weekly.tasksTotal > 0 ? (weekly.tasksCompleted / weekly.tasksTotal) * 100 : 0, color: '#fff' },
                ].map(({ label, val, pct, color }) => (
                  <div key={label} className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
                    <div className="text-xs text-white/45 w-24 flex-shrink-0">{label}</div>
                    <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(100, pct)}%`, background: color, boxShadow: `0 0 6px ${color}80` }}
                      />
                    </div>
                    <div className="text-xs font-semibold text-right w-12 flex-shrink-0" style={{ color }}>{val}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verificar que o componente compila sem erros**

```bash
cd frontend && npx eslint src/modules/simulator_room/FutureTwin.jsx --max-warnings 0
```

- [ ] **Step 4: Testar em modo demo (sem backend)**

No modo demo, as chamadas de API vão falhar. Verificar que os estados de loading/erro são tratados graciosamente (sem crash).

- [ ] **Step 5: Testar com backend rodando**

Com backend e frontend rodando simultaneamente:
1. Navegar para FutureTwin → hero deve aparecer com stats
2. Insights devem carregar em ~2s
3. Enviar mensagem no chat → resposta deve aparecer em <5s
4. Análise semanal deve mostrar barras com dados reais

- [ ] **Step 6: Commit**

```bash
git add frontend/src/modules/simulator_room/FutureTwin.jsx
git commit -m "feat: FutureTwin UI completa — chat, insights, análise semanal com Claude API"
```

---

## Verificação End-to-End da Fase 3

- [ ] `GET /api/futuretwin/insights` retorna 3 insights em JSON válido
- [ ] `POST /api/futuretwin/chat` retorna resposta da IA com dados do usuário
- [ ] `GET /api/futuretwin/weekly-analysis` retorna métricas da semana
- [ ] FutureTwin carrega insights reais (não mock) em <3s
- [ ] Chat funciona: mensagem enviada → resposta da IA em <5s
- [ ] Análise semanal exibe barras com valores corretos
- [ ] Modo demo: tela não crasha, mostra mensagem de carregamento/erro adequada
- [ ] Recarregar a página duas vezes seguidas: segunda vez usa cache de insights (sem nova chamada à API)
