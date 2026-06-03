import taskModel from '../models/taskModel.js';
import habitModel from '../models/habitModel.js';
import goalModel from '../models/goalModel.js';
import dailyPlanModel from '../models/dailyPlanModel.js';

const DOW_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

async function getTaskPatternLast30Days(userId) {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const tasks = await taskModel.find({
    userId,
    createdAt: { $gte: since },
  }).lean();

  const byDow = Array.from({ length: 7 }, () => ({ total: 0, completed: 0 }));
  for (const t of tasks) {
    const dow = new Date(t.createdAt).getDay();
    byDow[dow].total++;
    if (t.completed) byDow[dow].completed++;
  }

  return byDow.map((d, i) => ({
    day: DOW_NAMES[i],
    completionRate: d.total > 0 ? Math.round((d.completed / d.total) * 100) : null,
    total: d.total,
    completed: d.completed,
  }));
}

async function getHabitSummary(userId) {
  const habits = await habitModel.find({ userId }).lean();
  return habits.map((h) => ({
    name: h.name,
    streak: h.streak ?? 0,
    mode: h.mode,
  }));
}

async function getGoalSummary(userId) {
  const goals = await goalModel.find({ userId }).lean();
  return goals.map((g) => ({
    title: g.title,
    type: g.type,
    deadline: g.deadline,
  }));
}

async function getWeeklyMetrics(userId) {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [tasks, plans, habits] = await Promise.all([
    taskModel.find({ userId, createdAt: { $gte: since } }).lean(),
    dailyPlanModel.find({ userId, date: { $gte: since.toISOString().slice(0, 10) } }).lean(),
    habitModel.find({ userId }).lean(),
  ]);

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;

  const habitRate =
    habits.length > 0
      ? Math.round((habits.reduce((acc, h) => acc + (h.streak > 0 ? 1 : 0), 0) / habits.length) * 100)
      : 0;

  return {
    tasksCompleted: completedTasks,
    tasksTotal: totalTasks,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    habitConsistency: habitRate,
    daysTracked: plans.length,
  };
}

async function buildUserContext(userId) {
  const [taskPattern, habits, goals, weekly] = await Promise.all([
    getTaskPatternLast30Days(userId),
    getHabitSummary(userId),
    getGoalSummary(userId),
    getWeeklyMetrics(userId),
  ]);

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
        `- "${g.title}" (${g.type})${g.deadline ? `, prazo: ${new Date(g.deadline).toLocaleDateString('pt-BR')}` : ''}`
    ),
    goals.length === 0 ? '- Nenhuma meta ativa.' : '',
  ];

  return lines.filter((l) => l !== '').join('\n');
}

export { buildUserContext, getWeeklyMetrics };
