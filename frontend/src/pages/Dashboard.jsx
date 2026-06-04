import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import { TrendingUp, Target, CheckCircle, Zap, ArrowRight, Camera, CalendarDays, Star, AlertTriangle, UserPen, LucideTrophy, Pencil, Activity, Flame, BarChart3, Brain, Trophy, BookOpen, DollarSign } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import Card from '../components/Card';
import ClockWidget from '../components/ClockWidget';
import DonutChart from '../components/DonutChart';
import GoalCard from '../components/GoalCard';
import ProjectCard from '../components/ProjectCard';
import TaskItem from '../components/TaskItem';
import HabitCard from '../components/HabitCard';
import Button from '../components/GradientButton';
import { motion as Motion } from 'framer-motion'
import { useMemo } from 'react';
import profile_pic from '../assets/profile_pic.svg'
import { useState, useEffect } from 'react';
import { statsAPI } from '../api/apiService';
import Modal from '../components/Modal';
import InputField from '../components/InputField';
import { AnalyticsSkeleton, SkeletonCard, SkeletonBlock, TrackerGridSkeleton } from '../components/LoadingSkeleton';
import { useXP } from '../hooks/useXP';
import { ACHIEVEMENTS } from '../data/gamification';


const Painel = () => {

  const [weeklyData, setWeeklyData] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditProfilePic, setShowEditProfilePic] = useState(false);

  const {
    goals,
    user,
    loading,
    projects,
    tasks,
    habits,
    dailyPlan,
    notebooks,
    pages,
    updateUser,
    updateUserProfilePic,
    calculateGoalProgress,
    calculateProjectProgress,
    toggleDailyPlanTaskCompletion,
    getImportantTasks,
    getBehindTasks,
    toggleTaskCompletion,
    calculateProductivityScore,
    calculateDisciplineScore
  } = useApp();

  const [newProfile, setNewProfile] = useState({ name: user.name, username: user.username, bio: user.bio });
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [weeklyLoading, setWeeklyLoading] = useState(true);

  const navigate = useNavigate();
  const { totalXP, level, levelTitle, levelProgress, nextLevelXP, unlockedAchievements } = useXP();

  useEffect(() => {
    const fetchStats = async () => {
      setWeeklyLoading(true);
      try {
        const res = await statsAPI.getWeekly();

        if (res.success) {
          const formatted = res.data.map(item => ({
            name: new Date(item.date).toLocaleDateString('pt-BR', { weekday: 'short' }),
            productivity: item.productivity,
            discipline: item.discipline
          }));

          setWeeklyData(formatted);
        }

      } catch (error) {
        console.log("Failed to fetch stats:", error);
      } finally {
        setWeeklyLoading(false);
      }
    };

    fetchStats();
  }, []);

  const avgProductivity =
    weeklyData.length > 0
      ? Math.round(weeklyData.reduce((sum, d) => sum + d.productivity, 0) / weeklyData.length)
      : 0;

  const avgDiscipline =
    weeklyData.length > 0
      ? Math.round(weeklyData.reduce((sum, d) => sum + d.discipline, 0) / weeklyData.length)
      : 0;

  const productivityScore = useMemo(() => calculateProductivityScore(), [calculateProductivityScore]);
  const disciplineScore = useMemo(() => calculateDisciplineScore(), [calculateDisciplineScore]);

  const todayPlannedTasks = useMemo(() => dailyPlan?.plannedTasks || [], [dailyPlan?.plannedTasks]);
  const pendingPlannedTasks = todayPlannedTasks.filter(t => !t.completed);
  const hasPlannedTasks = todayPlannedTasks.length > 0;

  const importantTasks = getImportantTasks();
  const behindTasks = getBehindTasks();

  const topGoals = goals.slice(0, 4);
  const topProjects = projects.slice(0, 4);
  const topHabits = habits.slice(0, 3);

  const productivityInsights = useMemo(() => {
    const completedDailyTasks = todayPlannedTasks.filter(task => task.completed).length;
    const completedTasks = tasks.filter(task => task.completed || task.status === 'completed').length;
    const completedHabits = habits.filter(habit => habit.completed).length;
    const goalProgressValues = goals.map(goal => {
      const progress = calculateGoalProgress(goal.id);
      return progress || Number(goal.progress) || 0;
    });
    const avgGoalProgress = goalProgressValues.length
      ? Math.round(goalProgressValues.reduce((sum, value) => sum + value, 0) / goalProgressValues.length)
      : 0;
    const habitCompletion = habits.length
      ? Math.round((completedHabits / habits.length) * 100)
      : 0;
    const taskCompletion = tasks.length
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;
    const consistencyDays = weeklyData.filter(day => {
      const dailyScore = Math.round(((day.productivity || 0) + (day.discipline || 0)) / 2);
      return dailyScore >= 70;
    }).length;
    const consistencyScore = weeklyData.length
      ? Math.round((consistencyDays / weeklyData.length) * 100)
      : productivityScore;
    const firstHalf = weeklyData.slice(0, Math.ceil(weeklyData.length / 2));
    const secondHalf = weeklyData.slice(Math.ceil(weeklyData.length / 2));
    const avg = (items, key) => items.length
      ? items.reduce((sum, item) => sum + (item[key] || 0), 0) / items.length
      : 0;
    const trendDelta = weeklyData.length > 1
      ? Math.round(avg(secondHalf, 'productivity') - avg(firstHalf, 'productivity'))
      : 0;
    const heatmap = weeklyData.length
      ? weeklyData.map(day => ({
          name: day.name,
          value: Math.round(((day.productivity || 0) + (day.discipline || 0)) / 2)
        }))
      : [
          { name: 'Today', value: productivityScore },
        ];

    return {
      completedDailyTasks,
      avgGoalProgress,
      habitCompletion,
      taskCompletion,
      consistencyScore,
      trendDelta,
      heatmap,
    };
  }, [todayPlannedTasks, tasks, habits, goals, weeklyData, productivityScore, calculateGoalProgress]);

  const insightCards = [
    {
      title: 'Consistência Semanal',
      value: `${productivityInsights.consistencyScore}%`,
      detail: `${productivityInsights.heatmap.filter(day => day.value >= 70).length}/${productivityInsights.heatmap.length} dias produtivos`,
      icon: <Flame size={22} />,
      accent: 'green',
    },
    {
      title: 'Conclusão de Hábitos',
      value: `${productivityInsights.habitCompletion}%`,
      detail: `${habits.filter(habit => habit.completed).length}/${habits.length || 0} hábitos concluídos`,
      icon: <Activity size={22} />,
      accent: 'green',
    },
    {
      title: 'Progresso de Metas',
      value: `${productivityInsights.avgGoalProgress}%`,
      detail: `${goals.length} metas ativas rastreadas`,
      icon: <Target size={22} />,
      accent: 'blue',
    },
    {
      title: 'Conclusão de Tarefas',
      value: `${productivityInsights.taskCompletion}%`,
      detail: `${productivityInsights.completedDailyTasks}/${todayPlannedTasks.length || 0} planejados para hoje`,
      icon: <BarChart3 size={22} />,
      accent: 'red',
    },
  ];

  const streakValue = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map(h => h.streak || 0), 0);
  }, [habits]);

  const handleEditProfile = async (e) => {
    e.preventDefault();

    const updates = {};

    if (newProfile.name !== "" && newProfile.name !== user.name) {
      updates.name = newProfile.name;
    }

    if (newProfile.username !== "" && newProfile.username !== user.username) {
      updates.username = newProfile.username;
    }

    if (newProfile.bio !== user.bio) {
      updates.bio = newProfile.bio;
    }

    if (Object.keys(updates).length === 0) {
      setShowEditProfile(false);
      return;
    }

    const success = await updateUser(updates);

    if (success) {
      setNewProfile({
        name: updates.name ?? user.name,
        username: updates.username ?? user.username,
        bio: updates.bio ?? user.bio
      });

      setShowEditProfile(false);
    }
  };


  const handleEditProfilePic = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    let hasChanges = false;

    if (newProfilePic) {
      formData.append("profile", newProfilePic);
      hasChanges = true;
    }

    if (!hasChanges) {
      setShowEditProfile(false);
      return;
    }

    const success = await updateUserProfilePic(formData);

    if (success) {
      setNewProfilePic(null);
      setShowEditProfilePic(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas px-3 sm:px-4 pt-4 sm:pt-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-1">
        {/* XP Banner dinâmico */}
        <div
          className="relative overflow-hidden rounded-2xl p-5 mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(120,80,255,0.25) 0%, rgba(59,158,255,0.15) 50%, rgba(17,255,153,0.08) 100%)',
            border: '1px solid rgba(120,80,255,0.35)',
            boxShadow: '0 0 40px rgba(120,80,255,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Linha de brilho topo */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(120,80,255,0.8), rgba(59,158,255,0.6), transparent)' }}
          />
          {/* Blob de brilho interno */}
          <div className="absolute right-0 top-0 w-48 h-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at right, rgba(120,80,255,0.6), transparent 70%)' }} />

          <div className="flex items-center justify-between mb-3 relative z-10">
            <span
              className="text-sm font-bold tracking-widest uppercase px-4 py-1.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(120,80,255,0.4), rgba(59,158,255,0.3))',
                border: '1px solid rgba(120,80,255,0.5)',
                boxShadow: '0 0 16px rgba(120,80,255,0.3)',
                color: '#fff',
              }}
            >
              ⚡ NÍVEL {level} — {levelTitle.replace(/^.+?\s/, '')}
            </span>
            <span className="text-sm text-white/70 font-medium">
              <span className="text-[#11ff99] font-bold text-base">{totalXP.toLocaleString('pt-BR')}</span>
              {nextLevelXP ? ` / ${nextLevelXP.toLocaleString('pt-BR')} XP` : ' XP (máx)'}
            </span>
          </div>
          <div className="relative h-2 rounded-full overflow-hidden z-10" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${levelProgress || 0}%`,
                background: 'linear-gradient(90deg, #7850ff, #3b9eff)',
                boxShadow: '0 0 14px rgba(120,80,255,0.8), 0 0 28px rgba(59,158,255,0.4)',
              }}
            />
          </div>
          {nextLevelXP && (
            <div className="text-xs text-white/60 mt-2 z-10 relative">
              {(nextLevelXP - totalXP).toLocaleString('pt-BR')} XP para o próximo nível
            </div>
          )}
        </div>

        {/* Stats pills */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { val: `${productivityScore ?? 0}%`, label: 'Produtividade', color: '#11ff99', glow: 'rgba(17,255,153,0.15)', border: 'rgba(17,255,153,0.2)' },
            { val: goals?.filter(g => g.status !== 'concluida').length ?? 0, label: 'Metas Ativas', color: '#fff', glow: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.12)' },
            { val: todayPlannedTasks?.length ?? 0, label: 'Tarefas Hoje', color: '#3b9eff', glow: 'rgba(59,158,255,0.15)', border: 'rgba(59,158,255,0.2)' },
            { val: `🔥 ${streakValue ?? 0}`, label: 'Streak', color: '#ffc53d', glow: 'rgba(255,197,61,0.15)', border: 'rgba(255,197,61,0.2)' },
          ].map(({ val, label, color, glow, border }) => (
            <div
              key={label}
              className="rounded-2xl p-4 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${glow} 0%, rgba(10,10,12,0.9) 100%)`,
                border: `1px solid ${border}`,
                boxShadow: `0 0 20px ${glow}`,
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${border}, transparent)` }}
              />
              <div className="text-3xl font-extrabold tracking-tight leading-none mb-1.5 tabular-nums" style={{ color, textShadow: `0 0 20px ${glow}` }}>
                {val}
              </div>
              <div className="text-xs uppercase tracking-widest text-white/60 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Grid de módulos */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-white/45 uppercase tracking-widest mb-3">Módulos</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { to: '/future-twin', Icon: Brain,      name: 'FutureTwin AI',  sub: 'Insights · Chat IA', badge: 'Novo',    badgeColor: '#11ff99' },
              { to: '/trackers',    Icon: Target,      name: 'Rastreadores',   sub: `${goals.filter(g => g.status !== 'concluida').length} metas · ${habits.length} hábitos` },
              { to: '/achievements',Icon: Trophy,      name: 'Conquistas',     sub: `${unlockedAchievements.length} / ${ACHIEVEMENTS.length} desbloqueadas` },
              { to: '/focus-room',  Icon: Zap,         name: 'Sala de Foco',   sub: 'Pomodoro · Timer' },
              { to: '/library',     Icon: BookOpen,    name: 'Biblioteca',     sub: `${pages.length} notas · ${notebooks.length} cadernos` },
              { to: null,           Icon: DollarSign,  name: 'Finance',        sub: 'Em breve', disabled: true },
            ].map(({ to, Icon, name, sub, badge, badgeColor, disabled }) => (
              <button
                key={name}
                onClick={() => to && navigate(to)}
                disabled={disabled}
                aria-label={name}
                className={`relative overflow-hidden rounded-2xl p-4 text-left transition-colors w-full ${
                  disabled
                    ? 'opacity-40 cursor-default border-dashed'
                    : 'cursor-pointer hover:border-white/[0.13] focus-visible:ring-1 focus-visible:ring-white/30 outline-none'
                }`}
                style={{
                  background: disabled ? 'transparent' : 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
                />
                <div className="mb-2.5 text-white/70">
                  <Icon size={20} />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-white">{name}</div>
                    <div className="text-[11px] text-white/35 mt-0.5">{sub}</div>
                  </div>
                  {badge && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: `${badgeColor}18`,
                        border: `1px solid ${badgeColor}40`,
                        color: badgeColor,
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Welcome Section */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="mb-6">
            <div className="flex items-center justify-end mb-4">
              <button
                onClick={() => setShowEditProfile(true)}
                aria-label="Editar perfil"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-surface-elevated border border-hairline-strong text-charcoal hover:text-ink hover:bg-[#1a1a1e] transition-colors duration-200 outline-none focus-visible:ring-1 focus-visible:ring-white/30"
              >
                <UserPen size={16} />
              </button>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full relative group shrink-0 mb-4">
                <img src={user.profile_picture || profile_pic} className="w-full h-full object-cover rounded-full border-2 border-hairline-strong" alt={user.name || 'Foto de perfil'} />
                <button
                  type="button"
                  onClick={() => setShowEditProfilePic(true)}
                  aria-label="Alterar foto de perfil"
                  className="w-full h-full bg-black/50 absolute rounded-full inset-0 opacity-0 z-10 group-hover:opacity-100 flex items-center justify-center transition-opacity outline-none focus-visible:opacity-100"
                >
                  <Camera size={16} className="text-ink" />
                </button>
                <div className="w-4 h-4 rounded-full bg-accent-green border-2 border-surface-card absolute bottom-0 right-0" />
              </div>
              <span className="text-2xl font-semibold text-ink text-center">{user.name || 'Usuário'}</span>
              <span className="text-sm text-mute mt-0.5">@{user.username || 'username'}</span>
              {user.bio && <p className="text-sm text-charcoal mt-3 text-center max-w-md">{user.bio}</p>}
            </div>

          </Card>
        </Motion.div>

        <Card className="mb-6">
          <div className="mb-6">
            <ClockWidget />
          </div>

        </Card>

        {/* Produtividade Insights */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-ink" style={{ textWrap: 'balance' }}>Produtividade Insights</h2>
              <p className="text-sm text-mute">Sinais ao vivo das suas metas, hábitos, tarefas e ritmo semanal</p>
            </div>
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-hairline bg-surface-elevated ${productivityInsights.trendDelta >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
              <TrendingUp size={14} />
              <span className="text-sm font-medium">
                {productivityInsights.trendDelta >= 0 ? '+' : ''}{productivityInsights.trendDelta}% tendência
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
            {insightCards.map((insight) => (
              <Card key={insight.title} className="!p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-mute">{insight.title}</p>
                    <p className="text-2xl font-semibold text-ink mt-1 tabular-nums">{insight.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${
                    insight.accent === 'green' ? 'bg-[rgba(17,255,153,0.1)] text-accent-green' :
                    insight.accent === 'blue' ? 'bg-[rgba(59,158,255,0.1)] text-accent-blue' :
                    'bg-[rgba(255,32,71,0.1)] text-accent-red'
                  }`}>
                    {insight.icon}
                  </div>
                </div>
                <p className="text-xs text-ash mt-3">{insight.detail}</p>
              </Card>
            ))}
          </div>

          <Card>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div>
                <h3 className="text-base font-semibold text-ink mb-1">Mapa de calor semanal</h3>
                <p className="text-sm text-mute">Média diária de produtividade e disciplina.</p>
              </div>
              <div className="grid grid-cols-7 gap-2 w-full lg:w-auto">
                {productivityInsights.heatmap.map(day => (
                  <div key={day.name} className="flex flex-col items-center gap-1.5">
                    <div className="w-full min-w-9 h-12 rounded-lg border border-hairline bg-surface-elevated flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-b-lg ${
                          day.value >= 80 ? 'bg-accent-green' :
                          day.value >= 60 ? 'bg-accent-yellow' :
                          'bg-accent-red'
                        }`}
                        style={{ height: `${Math.max(12, day.value)}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-mute">{day.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Weekly Analytics */}
        <h2 className="text-lg font-semibold text-ink mb-4">Analytics Semanal</h2>
        {weeklyLoading ? (
          <AnalyticsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <h3 className="text-sm font-semibold text-ink mb-4 text-center">Pontuação de Produtividade</h3>
            <div className="flex justify-center">
              <DonutChart value={avgProductivity} size={130} color="#3b9eff" label="Esta Semana" />
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-ink mb-4 text-center">Pontuação de Disciplina</h3>
            <div className="flex justify-center">
              <DonutChart value={avgDiscipline} size={130} color="#11ff99" label="Esta Semana" />
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-ink mb-4 text-center">Tendência Semanal</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} margin={{ top: 20, right: 0, left: -10, bottom: 0 }} barGap={8} >
                <XAxis
                  dataKey="name"
                  stroke="#888e90"
                  tick={{ fill: '#888e90', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Bar
                  dataKey="productivity"
                  fill="#3b9eff"
                  radius={[6, 6, 6, 6]}
                  barSize={8}
                >
                  <LabelList dataKey="productivity" position="top" fill="#3b9eff" style={{ fontSize: '8px' }} />
                </Bar>
                <Bar
                  dataKey="discipline"
                  fill="#11ff99"
                  radius={[6, 6, 6, 6]}
                  barSize={8}
                >
                  <LabelList dataKey="discipline" position="top" fill="#11ff99" style={{ fontSize: '8px' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          </div>
        )}


        {(importantTasks.length > 0 || behindTasks.length > 0) && (
          <Card className="mb-6">
            <div className="flex gap-2 flex-col lg:flex-row">
              {importantTasks.length > 0 && (
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-ink mb-1 flex items-center gap-2">
                    <Star className="text-accent-yellow" size={16} />
                    Tarefas Importantes
                  </h2>
                  <p className="text-sm text-mute mb-4">Tarefas de alta prioridade. Conclua estas primeiro.</p>
                  <div className="space-y-2">
                    {importantTasks.slice(0, 4).map(task => (
                      <Motion.div key={task.id} whileHover={{ scale: 1.005 }}>
                        <TaskItem
                          task={task}
                          onToggle={toggleTaskCompletion}
                        />
                      </Motion.div>
                    ))}
                  </div>
                </div>
              )}

              {importantTasks.length > 0 && behindTasks.length > 0 && (
                <div className="w-px bg-hairline self-stretch hidden lg:block" />
              )}

              {behindTasks.length > 0 && (
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-ink mb-1 flex items-center gap-2">
                    <AlertTriangle className="text-accent-red" size={16} /> Prazo Expirado
                  </h2>
                  <p className="text-sm text-mute mb-4">Aja rápido nessas tarefas, você já está atrasado.</p>
                  <div className="space-y-2">
                    {behindTasks.slice(0, 4).map(task => (
                      <Motion.div key={task.id} whileHover={{ scale: 1.005 }}>
                        <TaskItem
                          task={task}
                          onToggle={toggleTaskCompletion}
                        />
                      </Motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-6 pt-4 border-t border-hairline">
              <Link to="/focus-room" className="flex-1">
                <Button variant="primary" className="w-full" data-testid="focus-room-cta">
                  <span>Entrar Sala de Foco</span>
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/trackers/daily-tasks" className="flex-1">
                <Button variant="primary" className="w-full" data-testid="plan-now-btn">
                  <span>Adicionar ao Plano de Hoje</span>
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </Card>)}

        {/* Today's Tasks */}
        {loading ? (
          <SkeletonCard className="mb-6">
            <div className="flex justify-between items-center mb-5">
              <SkeletonBlock className="h-6 w-48" />
              <SkeletonBlock className="h-4 w-16" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-16 w-full" />
              ))}
            </div>
          </SkeletonCard>
        ) : hasPlannedTasks && pendingPlannedTasks.length > 0 ? (
          <Card className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-ink">Tarefas planejadas para hoje</h2>
              <Link to="/trackers/daily-tasks" className="text-sm text-accent-blue hover:underline">
                Ver Todas
              </Link>
            </div>
            <div className="space-y-2">
              {pendingPlannedTasks.slice(0, 5).map((item, index) => (
                <Motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 bg-surface-elevated border border-hairline rounded-lg"
                  data-testid={`planned-task-${item.id}`}
                >
                  <div className="text-center min-w-[56px]">
                    <p className="text-xs font-medium text-accent-blue">{item.startTime}</p>
                    <p className="text-xs text-mute">{item.endTime}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium truncate ${item.completed ? 'line-through text-mute' : 'text-ink'}`}>
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                            item.source === 'task'
                              ? 'border-accent-blue/20 bg-accent-blue/10 text-accent-blue'
                              : item.source === 'habit'
                                ? 'border-accent-green/20 bg-accent-green/10 text-accent-green'
                                : 'border-hairline-strong bg-surface-elevated text-charcoal'
                          }`}>
                            {item.source === 'task' ? 'Tarefa' : item.source === 'habit' ? 'Hábito' : 'Manual'}
                          </span>
                          {item.isImportant && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full border border-accent-yellow/20 bg-accent-yellow/10 text-accent-yellow">
                              Importante
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleDailyPlanTaskCompletion(item.id)}
                        aria-label={item.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
                        className={`p-1.5 rounded-lg transition-colors shrink-0 outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
                          item.completed
                            ? 'bg-accent-green/10 text-accent-green'
                            : 'bg-surface-elevated text-mute hover:bg-accent-green/10 hover:text-accent-green'
                        }`}
                        data-testid={`toggle-planned-task-${item.id}`}
                      >
                        <CheckCircle size={18} />
                      </button>
                    </div>
                  </div>
                </Motion.div>
              ))}
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Link to="/focus-room" className="flex-1">
                  <Button variant="primary" className="w-full" data-testid="focus-room-cta">
                    <span>Entrar na Sala de Foco</span>
                    <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link to="/trackers/daily-tasks" className="flex-1">
                  <Button variant="ghost" className="w-full" data-testid="plan-now-btn">
                    Planejar
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : hasPlannedTasks && pendingPlannedTasks.length == 0 ? (
          <Card className="mb-6">
            <div className="text-center py-8">
              <LucideTrophy size={40} className="text-accent-blue mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-ink mb-1">Todas as tarefas de hoje foram concluídas!</h3>
              <p className="text-sm text-mute mb-4">Planeje-se e continue se superando...</p>
              <Link to="/trackers/daily-tasks">
                <Button variant="primary" data-testid="plan-now-btn">
                  Planejar Agenda
                </Button>
              </Link>
            </div>
          </Card>
        ) : !hasPlannedTasks && (
          <Card className="mb-6">
            <div className="text-center py-8">
              <CalendarDays size={40} className="text-accent-blue mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-ink mb-1">Planeje seu dia para manter a produtividade</h3>
              <p className="text-sm text-mute mb-4">Crie um plano diário estruturado para maximizar sua produtividade</p>
              <Link to="/trackers/daily-tasks">
                <Button variant="primary" data-testid="plan-now-btn">
                  Planejar Agora
                </Button>
              </Link>
            </div>
          </Card>
        )}


        {/* Progresso das metas */}
        {loading ? (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <SkeletonBlock className="h-6 w-40" />
              <SkeletonBlock className="h-4 w-16" />
            </div>
            <TrackerGridSkeleton count={4} />
          </div>
        ) : goals.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-ink">Progresso das metas</h2>
              <Link to="/trackers/goals" className="text-sm text-accent-blue hover:underline">
                Ver Todas <ArrowRight size={14} className="inline" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {topGoals.map((goal, index) => (
                <Motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    progress={calculateGoalProgress(goal.id)}
                    onClick={() => { }}
                  />
                </Motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Progresso dos projetos */}
        {projects.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-ink">Progresso dos projetos</h2>
              <Link to="/trackers/projects" className="text-sm text-accent-blue hover:underline">
                Ver Todos <ArrowRight size={14} className="inline" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {topProjects.map((project, index) => {
                const linkedGoal = goals.find(g => g.id === project.goalId);
                return (
                  <Motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProjectCard
                      key={project.id}
                      project={project}
                      progress={calculateProjectProgress(project.id)}
                      linkedGoal={linkedGoal?.title}
                      onClick={() => { }}
                    />
                  </Motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Habits */}
        {habits.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-ink">Hábitos</h2>
              <Link to="/trackers/habits" className="text-sm text-accent-blue hover:underline">
                Ver Todos <ArrowRight size={14} className="inline" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topHabits.map((habit, index) => (
                <Motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate('/trackers/habits')}
                >
                  <HabitCard key={habit.id} habit={habit} />
                </Motion.div>
              ))}
            </div>
          </div>
        )}

        {/* FutureTwin CTA */}
        <Card className="!py-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-ink mb-1">Em dúvida? Pergunte ao seu FuturoEu...</h2>
            <p className="text-sm text-charcoal mb-4">Use o FutureTwin para prever resultados e otimizar suas decisões.</p>
            <Link to="/future-twin">
              <Button variant="primary" data-testid="future-twin-cta">
                Pergunte ao FutureTwin
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} title="Editar Perfil">
        <form onSubmit={handleEditProfile} className="space-y-4">
          <InputField
            id="profile-name"
            name="name"
            label="Nome completo"
            value={newProfile.name}
            onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
            placeholder="Informe seu nome completo"
            autoComplete="name"
            required
            data-testid="profile-name-input"
          />
          <InputField
            id="profile-username"
            name="username"
            label="Usuário"
            value={newProfile.username}
            onChange={(e) => setNewProfile({ ...newProfile, username: e.target.value })}
            placeholder="Usuário"
            autoComplete="username"
            spellCheck={false}
            required
            data-testid="profile-username-input"
          />

          <div>
            <label htmlFor="profile-bio" className="block text-sm text-charcoal font-medium mb-2">Bio</label>
            <textarea
              id="profile-bio"
              value={newProfile.bio}
              onChange={(e) => setNewProfile({ ...newProfile, bio: e.target.value })}
              placeholder="Fale algo interessante sobre você…"
              data-testid="profile-bio-input"
              required
              className="w-full bg-surface-card text-ink border border-hairline-strong rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-shadow min-h-[100px]"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full" data-testid="submit-new-profile-btn">
            Salvar Alterações
          </Button>
        </form>
      </Modal>

      <Modal isOpen={showEditProfilePic} onClose={() => setShowEditProfilePic(false)} title="Alterar Foto de Perfil">
        <form onSubmit={handleEditProfilePic} className="space-y-4">
          <div className='flex flex-col gap-3 items-center'>
            <label htmlFor="profile_picture" className='block text-sm text-charcoal font-medium mb-2'>
              Clique para enviar
              <input hidden type="file" accept='image/*' id='profile_picture' onChange={(e) => setNewProfilePic(e.target.files[0])} />
              <div className='group/profile relative'>
                <img src={newProfilePic ? URL.createObjectURL(newProfilePic) : user.profile_picture || profile_pic} alt="" className='w-24 h-24 rounded-full object-cover mt-2 border-2 border-hairline-strong' />
                <div className='absolute hidden cursor-pointer group-hover/profile:flex top-0 left-0 right-0 bottom-0 bg-black/40 rounded-full items-center justify-center'>
                  <Pencil className='w-5 h-5 text-ink' />
                </div>
              </div>
            </label>
          </div>
          <Button type="submit" variant="primary" className="w-full" data-testid="submit-new-profile-picture-btn">
            Enviar
          </Button>
        </form>
      </Modal>

    </div>
  );
};

export default Painel;