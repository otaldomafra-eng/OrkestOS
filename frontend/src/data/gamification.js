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

export function getLevelForXP(xp) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXP) current = lvl;
  }
  return current;
}

export function getNextLevel(currentLevel) {
  const idx = LEVELS.findIndex((l) => l.level === currentLevel);
  return idx >= 0 && idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

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
  streak_bonus:   50,
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
