# Fase 2 — Motor de Gamificação (XP, Níveis, Conquistas) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar um motor de XP/Níveis/Conquistas integrado ao fluxo existente de tarefas, hábitos, metas e foco — sem alterar APIs nem lógica de negócio atual.

**Architecture:** Novo `GamificationContext` centraliza o estado de XP. Um hook `useXP()` expõe `addXP(amount, reason)`. Os componentes existentes chamam `addXP` nos pontos de conclusão. Um `XPToast` visual flutua na tela e um `LevelUpModal` aparece ao subir de nível. Tudo persiste no localStorage (sem backend nessa fase).

**Tech Stack:** React 19, Context API, localStorage, Framer Motion (animações), Lucide React

**Pré-requisito:** Fase 1 concluída (design tokens e componentes atualizados).

---

## Mapa de Arquivos

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `frontend/src/context/GamificationContext.jsx` | Criar | Estado de XP, nível, conquistas — leitura/escrita no localStorage |
| `frontend/src/hooks/useXP.js` | Criar | Hook `useXP()` que expõe `addXP`, `xp`, `level`, `levelTitle`, `achievements` |
| `frontend/src/data/gamification.js` | Criar | Tabela de níveis, títulos, tabela de conquistas e critérios |
| `frontend/src/components/XPToast.jsx` | Criar | Notificação flutuante "+X XP" com animação de entrada/saída |
| `frontend/src/components/LevelUpModal.jsx` | Criar | Modal de parabéns ao subir de nível |
| `frontend/src/pages/Achievements.jsx` | Criar | Página de conquistas com grid e progresso |
| `frontend/src/components/HabitCard.jsx` | Modificar | Chamar `addXP(20, 'habit')` ao completar hábito |
| `frontend/src/components/TaskItem.jsx` | Modificar | Chamar `addXP` ao marcar tarefa como concluída |
| `frontend/src/modules/trackers/daily_task_tracker/DailyTaskTracker.jsx` | Modificar | Chamar `addXP` ao completar tarefa planejada; detectar 100% do plano |
| `frontend/src/modules/focus_room/FocusRoom.jsx` | Modificar | Chamar `addXP(15, 'pomodoro')` em `handleTimerComplete` |
| `frontend/src/modules/trackers/goal_tracker/GoalTracker.jsx` | Modificar | Chamar `addXP` ao mudar status de meta para concluída |
| `frontend/src/modules/trackers/project_tracker/ProjectTracker.jsx` | Modificar | Chamar `addXP(200, 'project')` ao concluir projeto |
| `frontend/src/context/GamificationProvider.jsx` | Criar | Provider wrapper para o GamificationContext |
| `frontend/src/main.jsx` | Modificar | Envolver app com `GamificationProvider` |
| `frontend/src/App.jsx` | Modificar | Adicionar rota `/achievements` |

---

## Task 1: Criar dados de gamificação (tabela de níveis e conquistas)

**Files:**
- Create: `frontend/src/data/gamification.js`

- [ ] **Step 1: Criar o arquivo com a tabela de níveis**

```js
// frontend/src/data/gamification.js

export const LEVELS = [
  { level: 1,  title: '🌱 Aprendiz',      minXP: 0 },
  { level: 2,  title: '🌱 Aprendiz',      minXP: 150 },
  { level: 3,  title: '🌱 Aprendiz',      minXP: 350 },
  { level: 4,  title: '⚡ Constante',     minXP: 600 },
  { level: 5,  title: '⚡ Constante',     minXP: 900 },
  { level: 6,  title: '⚡ Constante',     minXP: 1300 },
  { level: 7,  title: '⚔️ Executor',      minXP: 1800 },
  { level: 8,  title: '⚔️ Executor',      minXP: 2500 },
  { level: 9,  title: '⚔️ Executor',      minXP: 3500 },
  { level: 10, title: '🧠 Estrategista',  minXP: 5000 },
  { level: 12, title: '🧠 Estrategista',  minXP: 7000 },
  { level: 15, title: '🔥 Disciplinado',  minXP: 10000 },
  { level: 18, title: '🔥 Disciplinado',  minXP: 14000 },
  { level: 20, title: '🏆 Mestre',        minXP: 20000 },
  { level: 25, title: '🏆 Mestre',        minXP: 28000 },
  { level: 30, title: '👑 Lenda',         minXP: 50000 },
];

/** Retorna o objeto de nível para um dado XP total */
export function getLevelForXP(xp) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXP) current = lvl;
  }
  return current;
}

/** Retorna o próximo nível (ou null se já estiver no máximo) */
export function getNextLevel(currentLevel) {
  const idx = LEVELS.findIndex((l) => l.level === currentLevel);
  return idx >= 0 && idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

/** Calcula o percentual de progresso dentro do nível atual (0–100) */
export function getLevelProgress(xp) {
  const current = getLevelForXP(xp);
  const next = getNextLevel(current.level);
  if (!next) return 100;
  const range = next.minXP - current.minXP;
  const earned = xp - current.minXP;
  return Math.round((earned / range) * 100);
}

export const XP_VALUES = {
  task_normal:    10,
  task_important: 25,
  habit:          20,
  pomodoro:       15,
  daily_plan_100: 75,
  goal_midterm:   150,
  goal_longterm:  300,
  goal_final:     500,
  project:        200,
  streak_bonus:   50,   // a cada 7 dias de streak
};

export const ACHIEVEMENTS = [
  { id: 'first-task',    name: '🎯 Primeira Tarefa',   desc: 'Complete sua primeira tarefa',            check: (s) => s.tasksCompleted >= 1 },
  { id: 'tasks-50',      name: '✅ Produtivo',          desc: '50 tarefas concluídas',                   check: (s) => s.tasksCompleted >= 50 },
  { id: 'tasks-100',     name: '⚡ Centurião',          desc: '100 tarefas concluídas',                  check: (s) => s.tasksCompleted >= 100 },
  { id: 'streak-7',      name: '🔥 Semana Perfeita',    desc: '7 dias de streak consecutivos',           check: (s) => s.maxStreak >= 7 },
  { id: 'streak-14',     name: '🔥 Streak 14',          desc: '14 dias consecutivos',                    check: (s) => s.maxStreak >= 14 },
  { id: 'streak-30',     name: '💎 Imparável',          desc: '30 dias consecutivos',                    check: (s) => s.maxStreak >= 30 },
  { id: 'pomodoro-10',   name: '⚡ Foco Total',         desc: '10 Pomodoros completos',                  check: (s) => s.pomodorosCompleted >= 10 },
  { id: 'pomodoro-50',   name: '🎖 Atleta do Foco',     desc: '50 Pomodoros completos',                  check: (s) => s.pomodorosCompleted >= 50 },
  { id: 'first-goal',    name: '🏅 Meta Batida',        desc: 'Primeira meta concluída',                 check: (s) => s.goalsCompleted >= 1 },
  { id: 'goals-5',       name: '🎯 Caçador de Metas',   desc: '5 metas concluídas',                      check: (s) => s.goalsCompleted >= 5 },
  { id: 'first-project', name: '🏗 Construtor',         desc: 'Primeiro projeto concluído',              check: (s) => s.projectsCompleted >= 1 },
  { id: 'projects-5',    name: '🚀 Executor',           desc: '5 projetos concluídos',                   check: (s) => s.projectsCompleted >= 5 },
  { id: 'daily-plan-7',  name: '📋 Planejador',         desc: 'Plano diário 100% por 7 dias seguidos',   check: (s) => s.dailyPlan100Streak >= 7 },
  { id: 'library-10',    name: '📚 Estudioso',          desc: '10 notas na biblioteca',                  check: (s) => s.notesCreated >= 10 },
  { id: 'xp-1000',       name: '⭐ Mil Pontos',         desc: 'Acumular 1.000 XP',                       check: (s) => s.totalXP >= 1000 },
  { id: 'level-10',      name: '🧠 Estrategista',       desc: 'Alcançar Nível 10',                       check: (s) => s.level >= 10 },
  { id: 'level-20',      name: '👑 Mestre',             desc: 'Alcançar Nível 20',                       check: (s) => s.level >= 20 },
  { id: 'habits-21',     name: '🌱 21 Dias',            desc: 'Um hábito mantido por 21 dias',           check: (s) => s.maxHabitStreak >= 21 },
  { id: 'morning-person',name: '🌅 Madrugador',         desc: 'Tarefa concluída antes das 8h',           check: (s) => s.morningTasks >= 1 },
  { id: 'night-owl',     name: '🦉 Coruja',             desc: 'Tarefa concluída após as 22h',            check: (s) => s.nightTasks >= 1 },
];
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/data/gamification.js
git commit -m "feat: adiciona tabela de níveis, XP values e conquistas (dados)"
```

---

## Task 2: Criar GamificationContext e Provider

**Files:**
- Create: `frontend/src/context/GamificationContext.jsx`
- Create: `frontend/src/context/GamificationProvider.jsx`

- [ ] **Step 1: Criar GamificationContext.jsx**

```jsx
// frontend/src/context/GamificationContext.jsx
import { createContext } from 'react';

export const GamificationContext = createContext(null);
```

- [ ] **Step 2: Criar GamificationProvider.jsx**

```jsx
// frontend/src/context/GamificationProvider.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GamificationContext } from './GamificationContext';
import {
  getLevelForXP,
  getNextLevel,
  getLevelProgress,
  ACHIEVEMENTS,
} from '../data/gamification';

const STORAGE_KEY = 'orkest_gamification';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted — reset
  }
  return {
    totalXP: 0,
    unlockedAchievements: [],
    stats: {
      tasksCompleted: 0,
      goalsCompleted: 0,
      projectsCompleted: 0,
      pomodorosCompleted: 0,
      maxStreak: 0,
      dailyPlan100Streak: 0,
      notesCreated: 0,
      maxHabitStreak: 0,
      morningTasks: 0,
      nightTasks: 0,
    },
  };
}

export default function GamificationProvider({ children }) {
  const [state, setState] = useState(loadState);
  // Fila de toasts: [{ id, amount, reason }]
  const [xpToasts, setXPToasts] = useState([]);
  // Fila de level-up modals: [{ level, title }]
  const [levelUpQueue, setLevelUpQueue] = useState([]);
  const toastIdRef = useRef(0);

  // Persistir no localStorage sempre que o estado muda
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addXP = useCallback((amount, reason = '', statUpdates = {}) => {
    setState((prev) => {
      const newXP = prev.totalXP + amount;
      const oldLevel = getLevelForXP(prev.totalXP).level;
      const newLevel = getLevelForXP(newXP).level;

      // Detectar subida de nível
      if (newLevel > oldLevel) {
        const lvlData = getLevelForXP(newXP);
        setLevelUpQueue((q) => [...q, { level: newLevel, title: lvlData.title }]);
      }

      // Atualizar stats
      const newStats = { ...prev.stats, ...statUpdates };

      // Detectar novas conquistas
      const allStats = { ...newStats, totalXP: newXP, level: newLevel };
      const newUnlocked = ACHIEVEMENTS.filter(
        (a) =>
          !prev.unlockedAchievements.includes(a.id) &&
          a.check(allStats)
      ).map((a) => a.id);

      return {
        totalXP: newXP,
        unlockedAchievements: [...prev.unlockedAchievements, ...newUnlocked],
        stats: newStats,
      };
    });

    // Adicionar toast XP
    const id = ++toastIdRef.current;
    setXPToasts((t) => [...t, { id, amount, reason }]);
    setTimeout(() => setXPToasts((t) => t.filter((x) => x.id !== id)), 2500);
  }, []);

  const dismissLevelUp = useCallback(() => {
    setLevelUpQueue((q) => q.slice(1));
  }, []);

  const levelData = getLevelForXP(state.totalXP);
  const nextLevel = getNextLevel(levelData.level);
  const progress = getLevelProgress(state.totalXP);

  const value = {
    totalXP: state.totalXP,
    level: levelData.level,
    levelTitle: levelData.title,
    nextLevelXP: nextLevel?.minXP ?? null,
    levelProgress: progress,
    unlockedAchievements: state.unlockedAchievements,
    stats: state.stats,
    addXP,
    xpToasts,
    levelUpQueue,
    dismissLevelUp,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/context/GamificationContext.jsx frontend/src/context/GamificationProvider.jsx
git commit -m "feat: cria GamificationContext e Provider (XP, níveis, conquistas, persistência)"
```

---

## Task 3: Criar hook useXP e registrar o Provider

**Files:**
- Create: `frontend/src/hooks/useXP.js`
- Modify: `frontend/src/main.jsx`

- [ ] **Step 1: Criar useXP.js**

```js
// frontend/src/hooks/useXP.js
import { useContext } from 'react';
import { GamificationContext } from '../context/GamificationContext';

export function useXP() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useXP deve ser usado dentro de GamificationProvider');
  return ctx;
}
```

- [ ] **Step 2: Registrar GamificationProvider no main.jsx**

Ler `frontend/src/main.jsx`. Localizar onde os providers são empilhados (ex: `AuthProvider`, `DataProvider`). Adicionar `GamificationProvider` envolvendo a árvore:

```jsx
// Antes (exemplo do padrão existente):
<AuthProvider>
  <DataProvider>
    <App />
  </DataProvider>
</AuthProvider>

// Depois — GamificationProvider dentro dos existentes:
<AuthProvider>
  <DataProvider>
    <GamificationProvider>
      <App />
    </GamificationProvider>
  </DataProvider>
</AuthProvider>
```

Adicionar o import no topo:
```jsx
import GamificationProvider from './context/GamificationProvider';
```

- [ ] **Step 3: Verificar que o app inicia sem erros**

```bash
cd frontend && npm run dev
```

Abrir o console do navegador. Não deve haver erros de contexto ou imports.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/hooks/useXP.js frontend/src/main.jsx
git commit -m "feat: hook useXP e registro do GamificationProvider no main"
```

---

## Task 4: Criar XPToast (notificação flutuante)

**Files:**
- Create: `frontend/src/components/XPToast.jsx`
- Modify: `frontend/src/layouts/AppLayout.jsx`

- [ ] **Step 1: Criar XPToast.jsx**

```jsx
// frontend/src/components/XPToast.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useXP } from '../hooks/useXP';

export default function XPToastLayer() {
  const { xpToasts } = useXP();

  return (
    <div className="fixed bottom-24 right-5 z-[200] flex flex-col-reverse gap-2 pointer-events-none">
      <AnimatePresence>
        {xpToasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{   opacity: 0, y: -16, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold"
            style={{
              background: 'rgba(17,255,153,0.12)',
              border: '1px solid rgba(17,255,153,0.3)',
              color: '#11ff99',
              boxShadow: '0 0 16px rgba(17,255,153,0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span>+{toast.amount} XP</span>
            {toast.reason && (
              <span className="text-xs font-normal text-white/40">{toast.reason}</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Adicionar XPToastLayer ao AppLayout**

Abrir `frontend/src/layouts/AppLayout.jsx`. Importar e adicionar dentro do `<div className="flex min-h-screen">`:

```jsx
import XPToastLayer from '../components/XPToast';

// Dentro do JSX, antes do fechamento da div principal:
<XPToastLayer />
```

- [ ] **Step 3: Testar manualmente via console**

Abrir o console do navegador e executar para simular um ganho de XP:

```js
// No console, disparar um addXP manual para testar o toast
// (isso só funciona se o contexto estiver acessível pelo devtools)
```

Alternativa: pular para Task 6 e testar junto com a integração real.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/XPToast.jsx frontend/src/layouts/AppLayout.jsx
git commit -m "feat: XPToast — notificação flutuante verde ao ganhar XP"
```

---

## Task 5: Criar LevelUpModal

**Files:**
- Create: `frontend/src/components/LevelUpModal.jsx`
- Modify: `frontend/src/layouts/AppLayout.jsx`

- [ ] **Step 1: Criar LevelUpModal.jsx**

```jsx
// frontend/src/components/LevelUpModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useXP } from '../hooks/useXP';

export default function LevelUpModal() {
  const { levelUpQueue, dismissLevelUp } = useXP();
  const current = levelUpQueue[0];

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.level}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={dismissLevelUp}
          />

          {/* Card */}
          <motion.div
            className="relative z-10 text-center px-10 py-10 rounded-3xl max-w-sm w-full"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1,   y: 0 }}
            exit={{   scale: 0.9,  y: -10 }}
            transition={{ type: 'spring', damping: 18, stiffness: 300 }}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 0 60px rgba(255,255,255,0.08)',
            }}
          >
            {/* Linha de brilho topo */}
            <div
              className="absolute top-0 left-0 right-0 h-px rounded-t-3xl"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}
            />

            <div className="text-5xl mb-4">🎉</div>
            <div className="text-xs font-bold tracking-widest uppercase text-white/40 mb-2">
              Nível alcançado
            </div>
            <div
              className="text-6xl font-extrabold tracking-tight mb-3"
              style={{ textShadow: '0 0 40px rgba(255,255,255,0.4)' }}
            >
              {current.level}
            </div>
            <div className="text-xl font-bold mb-2">{current.title}</div>
            <div className="text-sm text-white/40 mb-8">
              Continue assim para desbloquear o próximo nível!
            </div>
            <button
              onClick={dismissLevelUp}
              className="w-full py-3 rounded-xl text-sm font-bold bg-white text-black"
              style={{ boxShadow: '0 0 20px rgba(255,255,255,0.2)' }}
            >
              Continuar →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Adicionar LevelUpModal ao AppLayout**

```jsx
import LevelUpModal from '../components/LevelUpModal';

// Dentro do JSX:
<LevelUpModal />
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/LevelUpModal.jsx frontend/src/layouts/AppLayout.jsx
git commit -m "feat: LevelUpModal — celebração ao subir de nível com animação spring"
```

---

## Task 6: Integrar XP nos componentes existentes

**Files:**
- Modify: `frontend/src/components/TaskItem.jsx`
- Modify: `frontend/src/components/HabitCard.jsx`
- Modify: `frontend/src/modules/focus_room/FocusRoom.jsx`
- Modify: `frontend/src/modules/trackers/goal_tracker/GoalTracker.jsx`
- Modify: `frontend/src/modules/trackers/project_tracker/ProjectTracker.jsx`
- Modify: `frontend/src/modules/trackers/daily_task_tracker/DailyTaskTracker.jsx`

- [ ] **Step 1: Integrar em TaskItem.jsx**

Ler o arquivo. Localizar a função que é chamada quando o checkbox é marcado (provavelmente `onToggle`, `onComplete`, ou similar). Adicionar:

```jsx
import { useXP } from '../hooks/useXP';
import { XP_VALUES } from '../data/gamification';

// Dentro do componente:
const { addXP } = useXP();

// Dentro do handler de conclusão (onde a tarefa é marcada como concluída):
const handleToggle = () => {
  // ... lógica existente ...
  if (!task.completed) {  // só adiciona XP ao completar, não ao desmarcar
    const amount = task.important ? XP_VALUES.task_important : XP_VALUES.task_normal;
    addXP(amount, task.important ? 'tarefa importante' : 'tarefa', { tasksCompleted: (stats?.tasksCompleted ?? 0) + 1 });
  }
};
```

**Nota:** O campo `stats` vem do `useXP()` — adicionar `stats` ao destructuring: `const { addXP, stats } = useXP();`

- [ ] **Step 2: Integrar em HabitCard.jsx**

Ler o arquivo. Localizar onde o toggle de conclusão diária é acionado:

```jsx
import { useXP } from '../../hooks/useXP';
import { XP_VALUES } from '../../data/gamification';

const { addXP } = useXP();

// No handler de toggle do hábito (quando marca como feito hoje):
if (!isCompletedToday) {
  addXP(XP_VALUES.habit, 'hábito diário');
}
```

- [ ] **Step 3: Integrar em FocusRoom.jsx**

Ler o arquivo. Localizar `handleTimerComplete` (já existe conforme o código anterior):

```jsx
import { useXP } from '../../hooks/useXP';
import { XP_VALUES } from '../../data/gamification';

const { addXP, stats } = useXP();

// Dentro de handleTimerComplete, quando o timer de trabalho (não pausa) termina:
if (timerType === 'work') {
  addXP(XP_VALUES.pomodoro, 'pomodoro', {
    pomodorosCompleted: (stats?.pomodorosCompleted ?? 0) + 1,
  });
}
```

- [ ] **Step 4: Integrar em GoalTracker.jsx**

Ler o arquivo. Localizar onde o status de uma meta é alterado. Quando o novo status for o equivalente a "concluída":

```jsx
import { useXP } from '../../../hooks/useXP';
import { XP_VALUES } from '../../../data/gamification';

const { addXP, stats } = useXP();

// No handler de mudança de status:
if (newStatus === 'concluida' && goal.status !== 'concluida') {
  const xpMap = {
    final:     XP_VALUES.goal_final,
    long_term: XP_VALUES.goal_longterm,
    mid_term:  XP_VALUES.goal_midterm,
  };
  addXP(xpMap[goal.type] ?? XP_VALUES.goal_midterm, 'meta concluída', {
    goalsCompleted: (stats?.goalsCompleted ?? 0) + 1,
  });
}
```

**Nota:** O valor exato de `newStatus` e `goal.type` deve ser verificado lendo o arquivo — adaptar os nomes de string conforme o código existente.

- [ ] **Step 5: Integrar em ProjectTracker.jsx**

```jsx
import { useXP } from '../../../hooks/useXP';
import { XP_VALUES } from '../../../data/gamification';

const { addXP, stats } = useXP();

// No handler de conclusão de projeto:
if (newStatus === 'concluido' && project.status !== 'concluido') {
  addXP(XP_VALUES.project, 'projeto concluído', {
    projectsCompleted: (stats?.projectsCompleted ?? 0) + 1,
  });
}
```

- [ ] **Step 6: Integrar em DailyTaskTracker.jsx — bônus de plano 100%**

Ler o arquivo. Localizar onde a tarefa diária é marcada como concluída. Após marcar, verificar se todas as tarefas do plano estão concluídas:

```jsx
import { useXP } from '../../../hooks/useXP';
import { XP_VALUES } from '../../../data/gamification';

const { addXP } = useXP();

// No handler de conclusão de tarefa diária:
// Após chamar a função de toggle existente:
const updatedTasks = dailyTasks.map((t) =>
  t.id === task.id ? { ...t, completed: true } : t
);
const allDone = updatedTasks.every((t) => t.completed);
if (allDone && updatedTasks.length > 0) {
  addXP(XP_VALUES.daily_plan_100, 'plano do dia 100%');
}
```

- [ ] **Step 7: Verificar integração**

```bash
cd frontend && npm run dev
```

1. Marcar uma tarefa como concluída — toast "+10 XP" ou "+25 XP" deve aparecer
2. Completar um hábito — toast "+20 XP" deve aparecer
3. Completar um Pomodoro — toast "+15 XP" deve aparecer
4. Verificar no Dashboard que o XP Banner reflete o XP acumulado

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/TaskItem.jsx \
        frontend/src/components/HabitCard.jsx \
        frontend/src/modules/focus_room/FocusRoom.jsx \
        frontend/src/modules/trackers/goal_tracker/GoalTracker.jsx \
        frontend/src/modules/trackers/project_tracker/ProjectTracker.jsx \
        frontend/src/modules/trackers/daily_task_tracker/DailyTaskTracker.jsx
git commit -m "feat: integra addXP em TaskItem, HabitCard, FocusRoom, GoalTracker, ProjectTracker, DailyTaskTracker"
```

---

## Task 7: Criar página de Conquistas

**Files:**
- Create: `frontend/src/pages/Achievements.jsx`
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Criar Achievements.jsx**

```jsx
// frontend/src/pages/Achievements.jsx
import React from 'react';
import { useXP } from '../hooks/useXP';
import { ACHIEVEMENTS } from '../data/gamification';

export default function Achievements() {
  const { unlockedAchievements, stats, totalXP, level, levelTitle, levelProgress, nextLevelXP } = useXP();

  const unlocked = unlockedAchievements;
  const total = ACHIEVEMENTS.length;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-extrabold tracking-tight text-white"
          style={{ textShadow: '0 0 30px rgba(255,255,255,0.15)' }}
        >
          Conquistas
        </h1>
        <p className="text-sm text-white/40 mt-1">
          {unlocked.length} de {total} desbloqueadas
        </p>
      </div>

      {/* Perfil de nível */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 mb-8"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
          border: '1px solid rgba(255,255,255,0.13)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
        />
        <div className="flex items-center gap-5 mb-4">
          {/* Anel de nível */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-extrabold flex-shrink-0"
            style={{
              background: `conic-gradient(#fff 0% ${levelProgress}%, rgba(255,255,255,0.07) ${levelProgress}% 100%)`,
              padding: '4px',
            }}
          >
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center flex-col">
              <span className="text-xl font-extrabold leading-none">{level}</span>
              <span className="text-[9px] text-white/30 uppercase tracking-wider">Nível</span>
            </div>
          </div>
          <div>
            <div className="text-xl font-bold">{levelTitle}</div>
            <div className="text-sm text-white/40 mt-1">
              {totalXP.toLocaleString('pt-BR')} XP total
            </div>
          </div>
        </div>
        {/* Barra XP */}
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${levelProgress}%`,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.5), #fff)',
              boxShadow: '0 0 12px rgba(255,255,255,0.6)',
            }}
          />
        </div>
        {nextLevelXP && (
          <div className="text-[11px] text-white/25 mt-1.5">
            {(nextLevelXP - totalXP).toLocaleString('pt-BR')} XP para o próximo nível
          </div>
        )}
      </div>

      {/* Grid de conquistas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlocked.includes(ach.id);
          return (
            <div
              key={ach.id}
              className="relative overflow-hidden rounded-2xl p-4 text-center transition-colors"
              style={{
                background: isUnlocked
                  ? 'linear-gradient(135deg, rgba(255,197,61,0.07), rgba(255,197,61,0.02))'
                  : 'rgba(255,255,255,0.02)',
                border: isUnlocked
                  ? '1px solid rgba(255,197,61,0.25)'
                  : '1px solid rgba(255,255,255,0.07)',
                opacity: isUnlocked ? 1 : 0.35,
              }}
            >
              {isUnlocked && (
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,197,61,0.35), transparent)' }}
                />
              )}
              <div className="text-3xl mb-2">{ach.name.split(' ')[0]}</div>
              <div className="text-[12px] font-bold text-white leading-tight">
                {ach.name.split(' ').slice(1).join(' ')}
              </div>
              <div className="text-[10px] text-white/40 mt-1 leading-tight">{ach.desc}</div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
```

- [ ] **Step 2: Adicionar rota `/achievements` ao App.jsx**

Ler `frontend/src/App.jsx`. Localizar onde as rotas protegidas são definidas (dentro do `<Route element={<AppLayout />}>`). Adicionar:

```jsx
import Achievements from './pages/Achievements';

// Dentro das rotas protegidas:
<Route path="/achievements" element={<Achievements />} />
```

- [ ] **Step 3: Verificar**

Navegar para `/achievements`. O grid deve mostrar conquistas desbloqueadas em dourado, bloqueadas em opacidade baixa. O anel de nível deve refletir o XP atual.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Achievements.jsx frontend/src/App.jsx
git commit -m "feat: página de Conquistas com grid, perfil de nível e progresso XP"
```

---

## Task 8: Atualizar Dashboard Hub com XP real

**Files:**
- Modify: `frontend/src/pages/Dashboard.jsx`

- [ ] **Step 1: Importar useXP no Dashboard**

```jsx
import { useXP } from '../hooks/useXP';

// Dentro do componente:
const { totalXP, level, levelTitle, levelProgress, nextLevelXP } = useXP();
```

- [ ] **Step 2: Substituir o XP Banner hard-coded pelo dinâmico**

Localizar o bloco do XP Banner adicionado na Fase 1 (com `NÍVEL 7 — EXECUTOR` e `2.840` hard-coded) e atualizar para usar as variáveis reais:

```jsx
{/* XP Banner dinâmico */}
<div
  className="relative overflow-hidden rounded-2xl p-5 mb-6"
  style={{
    background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
    border: '1px solid rgba(255,255,255,0.12)',
  }}
>
  <div
    className="absolute top-0 left-0 right-0 h-px"
    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
  />
  <div className="flex items-center justify-between mb-3">
    <span
      className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
      style={{
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.18)',
      }}
    >
      NÍVEL {level} — {levelTitle.replace(/^.+?\s/, '')}
    </span>
    <span className="text-xs text-white/40">
      <span className="text-[#11ff99] font-semibold">{totalXP.toLocaleString('pt-BR')}</span>
      {nextLevelXP ? ` / ${nextLevelXP.toLocaleString('pt-BR')} XP` : ' XP (máx)'}
    </span>
  </div>
  <div className="relative h-1.5 bg-white/[0.06] rounded-full overflow-visible">
    <div
      className="h-full rounded-full transition-all duration-700"
      style={{
        width: `${levelProgress}%`,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.5), #fff)',
        boxShadow: '0 0 12px rgba(255,255,255,0.7)',
      }}
    />
  </div>
  {nextLevelXP && (
    <div className="text-[11px] text-white/25 mt-1.5">
      {(nextLevelXP - totalXP).toLocaleString('pt-BR')} XP para o próximo nível
    </div>
  )}
</div>
```

- [ ] **Step 3: Verificar**

Completar uma tarefa. O XP no banner do Dashboard deve aumentar em tempo real.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Dashboard.jsx
git commit -m "feat: Dashboard XP Banner usa dados reais do GamificationContext"
```

---

## Verificação End-to-End da Fase 2

- [ ] Completar tarefa comum → toast "+10 XP" aparece no canto inferior direito
- [ ] Completar tarefa importante → toast "+25 XP" aparece
- [ ] Completar hábito diário → toast "+20 XP" aparece
- [ ] Completar Pomodoro → toast "+15 XP" aparece
- [ ] Completar plano do dia 100% → toast "+75 XP" aparece
- [ ] Acumular XP suficiente para subir de nível → LevelUpModal aparece com animação spring
- [ ] Dashboard XP Banner mostra valores reais (não hard-coded)
- [ ] `/achievements` mostra grid com conquistas desbloqueadas em dourado
- [ ] Recarregar a página → XP e conquistas persistem (localStorage)
