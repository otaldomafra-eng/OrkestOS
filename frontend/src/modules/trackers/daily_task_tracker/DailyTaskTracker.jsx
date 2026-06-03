import { useState } from 'react';
import { Calendar, Clock, Plus, ListTodo, X, CheckCircle2, CalendarSyncIcon, CheckSquare, CalendarClock } from 'lucide-react';
import { useData } from '../../../hooks/useData';
import { useDailyPlan } from '../../../hooks/useDailyPlan';
import Card from '../../../components/Card';
import DonutChart from '../../../components/DonutChart';
import Button from '../../../components/GradientButton';
import InputField from '../../../components/InputField';
import { format } from 'date-fns';
import { motion as Motion } from 'framer-motion';
import Modal from '../../../components/Modal';
import { showToast } from '../../../utils/toastHelper';
import { PlannerSkeleton } from '../../../components/LoadingSkeleton';
import { useXP } from '../../../hooks/useXP';
import { XP_VALUES } from '../../../data/gamification';

const DailyTaskTracker = () => {
  const { tasks, habits, loading } = useData();
  const {
    dailyPlan,
    addToDailyPlan,
    removeFromDailyPlan,
    createManualDailyTask,
    toggleDailyPlanTaskCompletion,
    clearDailyPlan,
    calculateProductivityScore,
    calculateDisciplineScore
  } = useDailyPlan();

  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'add'
  const [addModo, setAddModo] = useState('tasks'); // 'tasks' | 'habits' | 'manual'
  const [activeView, setActiveView] = useState('timeline');
  const [manualTaskForm, setManualTaskForm] = useState({
    title: '',
    startTime: '09:00',
    endTime: '10:00',
    isImportant: false
  });

  const [selectedTask, setSelectedTask] = useState(null);
  const [showTimeModal, setShowTimeModal] = useState(false);

  const [timeForm, setTimeForm] = useState({
    startTime: '09:00',
    endTime: '10:00'
  });

  const currentHour = new Date().getHours();
  const productivityScore = calculateProductivityScore();
  const disciplineScore = calculateDisciplineScore();

  const START_HOUR = 0;
  const END_HOUR = 24;
  const HOUR_HEIGHT = 145;

  const hours = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, i) => i + START_HOUR
  );

  const activeTasks = dailyPlan.plannedTasks.filter(t => !t.completed);
  const completedTasks = dailyPlan.plannedTasks.filter(t => t.completed);

  const isPlanEmpty = dailyPlan.plannedTasks.length === 0;

  const { addXP } = useXP();

  const handleToggleTask = (taskId) => {
    const task = dailyPlan.plannedTasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      addXP(XP_VALUES.task_normal, 'tarefa do plano');
      const updatedTasks = dailyPlan.plannedTasks.map(t =>
        t.id === taskId ? { ...t, completed: true } : t
      );
      const allDone = updatedTasks.every(t => t.completed);
      if (allDone && updatedTasks.length > 0) {
        addXP(XP_VALUES.daily_plan_100, 'plano do dia 100%');
      }
    }
    toggleDailyPlanTaskCompletion(taskId);
  };

  // Get tasks not yet in daily plan
  const availableTasks = tasks.filter(
    task => !task.completed &&
      !dailyPlan.plannedTasks.some(pt => pt.taskId === task.id)
  );

  // Get habits with time that aren't in daily plan
  const suggestedHabits = habits.filter(
    habit => habit.startTime &&
      !dailyPlan.plannedTasks.some(pt => pt.habitId === habit.id)
  );

  const completedCount = dailyPlan.plannedTasks.filter(t => t.completed).length;

  // Add habit to plan
  const handleAddHabitToPlan = (habit) => {
    const start = new Date(`2000-01-01T${habit.startTime}:00`);
    let endTime = habit.endTime;

    if (!endTime) {
      const newEnd = new Date(start.getTime() + 30 * 60 * 1000); // 30 min
      endTime = format(newEnd, 'HH:mm');
    } else {
      const end = new Date(`2000-01-01T${endTime}:00`);
      const diffMinutes = (end - start) / (1000 * 60);

      if (diffMinutes < 30) {
        const newEnd = new Date(start.getTime() + 30 * 60 * 1000);
        endTime = format(newEnd, 'HH:mm');
        showToast({ message: "Mínimo de 30 minutos aplicado" });
      }
    }
    addToDailyPlan({
      source: 'habit',
      habitId: habit.id,
      title: habit.name,
      startTime: habit.startTime,
      endTime: endTime,
      completed: false,
      isImportant: false
    });
  };

  // Create manual task
  const handleCreateManualTask = (e) => {
    e.preventDefault();
    if (!manualTaskForm.title.trim()) {
      alert('Por favor, insira um título para a tarefa');
      return;
    }
    const start = new Date(`2000-01-01T${manualTaskForm.startTime}:00`);
    const end = new Date(`2000-01-01T${manualTaskForm.endTime}:00`);

    const diffMinutes = (end - start) / (1000 * 60);

    if (diffMinutes < 30) {
      showToast({ message: "A duração mínima da tarefa deve ser de 30 minutos", status: "error" });
      return;
    }

    createManualDailyTask(manualTaskForm);
    setManualTaskForm({
      title: '',
      startTime: '09:00',
      endTime: '10:00',
      isImportant: false
    });
  };

  const handleAddTaskToPlan = async () => {
    if (!selectedTask) return;

    const start = new Date(`2000-01-01T${timeForm.startTime}:00`);
    const end = new Date(`2000-01-01T${timeForm.endTime}:00`);

    const diffMinutes = (end - start) / (1000 * 60);

    if (diffMinutes < 30) {
      // alert("Minimum task duration should be 30 minutes");
      showToast({ message: "A duração mínima da tarefa deve ser de 30 minutos", status: "error" });
      return;
    }

    await addToDailyPlan({
      source: 'task',
      taskId: selectedTask.id,
      title: selectedTask.title,
      startTime: timeForm.startTime,
      endTime: timeForm.endTime,
      completed: selectedTask.completed,
      isImportant: selectedTask.isImportant
    });

    setSelectedTask(null);
    setShowTimeModal(false);
  };

  const getSourceBadge = (source) => {
    if (source === 'task') return { label: 'Task', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    if (source === 'habit') return { label: 'Habit', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    return { label: 'Manual', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
  };

  if (loading) {
    return (
      <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <div className="min-h-screen bg-canvas pb-20 px-4 pt-6 relative overflow-hidden">
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="mb-6">
              <h1 className="text-3xl young-serif-regular font-bold text-ink mb-2">Planejador diário</h1>
              <div className="flex items-center gap-2 text-mute">
                <Calendar size={20} />
                <p>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
              </div>
            </div>
            <PlannerSkeleton />
          </div>
        </div>
      </Motion.div>
    );
  }

  return (
    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <div className="min-h-screen bg-canvas pb-20 px-4 pt-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl young-serif-regular font-bold text-ink mb-2">Planejador di�rio</h1>
            <div className="flex items-center gap-2 text-mute">
              <Calendar size={20} />
              <p>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            </div>
          </Motion.div>

          {/* Scores */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <h3 className="text-sm text-mute mb-3 text-center">Pontuação de Produtividade</h3>
              <DonutChart value={productivityScore} color="#10b981" size={120} />
            </Card>
            <Card>
              <h3 className="text-sm text-mute mb-3 text-center">Pontuação de Disciplina</h3>
              <DonutChart value={disciplineScore} color="#f59e0b" size={120} />
            </Card>
          </div>

          {/* Warning if past 8 AM and no plan */}
          {currentHour >= 8 && isPlanEmpty && (
            <Card className="mb-6 bg-accent-yellow/10 border border-accent-yellow/30">
              <div className="flex items-center gap-3">
                <Clock size={24} className="text-accent-yellow" />
                <div>
                  <p className="text-accent-yellow font-semibold">Você ainda não planejou seu dia!</p>
                  <p className="text-sm text-mute">É recomendado planejar antes das 8h</p>
                </div>
              </div>
            </Card>
          )}

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setActiveTab('timeline');
                setActiveView('timeline');

              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === 'timeline'
                ? 'bg-surface-elevated text-ink border border-hairline-strong'
                : 'bg-surface-deep text-mute hover:bg-surface-elevated'
                }`}
              data-testid="timeline-tab"
            >
              <ListTodo size={20} className="inline mr-2" />
              Linha do tempo de hoje ({dailyPlan.plannedTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === 'add'
                ? 'bg-surface-elevated text-ink border border-hairline-strong'
                : 'bg-surface-deep text-mute hover:bg-surface-elevated'
                }`}
              data-testid="add-tasks-tab"
            >
              <Plus size={20} className="inline mr-2" />
              Adicionar ao Plano
            </button>
          </div>

          {/* TIMELINE VIEW */}
          {activeTab === 'timeline' && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {isPlanEmpty ? (
                <Card className="text-center py-12">
                  <CalendarSyncIcon size={48} className="mx-auto text-accent-blue mb-4" />
                  <h3 className="text-xl font-bold text-ink mb-2">Seu dia está livre!</h3>
                  <p className="text-mute mb-4">Comece a planejar adicionando tarefas, hábitos ou criando tarefas manuais</p>
                  <Button variant="primary" onClick={() => setActiveTab('add')} data-testid="start-planning-btn">
                    Começar a Planejar
                  </Button>
                </Card>
              ) : (
                <>
                  {/* Progresso Summary */}
                  <Card className="mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-ink mb-1">Progresso de hoje</h3>
                        <p className="text-mute text-sm">
                          {completedCount} de {dailyPlan.plannedTasks.length} tarefas concluídas
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl default-bold text-accent-blue">
                          {dailyPlan.plannedTasks.length > 0
                            ? Math.round((completedCount / dailyPlan.plannedTasks.length) * 100)
                            : 0}%
                        </p>
                        <button
                          onClick={clearDailyPlan}
                          className="text-sm text-accent-red hover:underline mt-1"
                          data-testid="clear-plan-btn"
                        >
                          Limpar Plano
                        </button>
                      </div>
                    </div>
                  </Card>

                  {/* Tab Navigation */}
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => setActiveView('timeline')}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${activeView === 'timeline'
                        ? 'bg-surface-elevated text-ink border border-hairline-strong'
                        : 'bg-surface-deep text-mute hover:bg-surface-elevated'
                        }`}
                      data-testid="timeline-view-tab"
                    >
                      <CalendarClock size={20} className="inline mr-2" />
                      Visualização em linha do tempo ({dailyPlan.plannedTasks.length})
                    </button>
                    <button
                      onClick={() => setActiveView('list')}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${activeView === 'list'
                        ? 'bg-surface-elevated text-ink border border-hairline-strong'
                        : 'bg-surface-deep text-mute hover:bg-surface-elevated'
                        }`}
                      data-testid="tasks-list-view-tab"
                    >
                      <CheckSquare size={20} className="inline mr-2" />
                      Visualização em lista
                    </button>
                  </div>

                  {/* NEW TIME GRID VIEW - POLISHED */}
                  {activeView === 'timeline' && (
                    <div className="flex relative mt-6 bg-surface-card border border-hairline-strong rounded-2xl overflow-hidden">

                      {/* LEFT TIME COLUMN */}
                      <div className="w-20 bg-surface-deep border-r border-hairline">
                        {hours.map(hour => (
                          <div
                            key={hour}
                            className="h-[145px] flex items-start justify-end pr-3 pt-1 text-xs text-mute border-b border-hairline"
                          >
                            {`${hour.toString().padStart(2, '0')}:00`}
                          </div>
                        ))}
                      </div>

                      {/* RIGHT GRID AREA */}
                      <div className="flex-1 relative">

                        {/* GRID BACKGROUND */}
                        <div className="absolute inset-0">
                          {hours.map(hour => (
                            <div
                              key={hour}
                              className="h-[145px] border-b border-hairline"
                            />
                          ))}
                        </div>

                        {/* SUBTLE VERTICAL GRID LINES */}
                        <div className="absolute inset-0 grid grid-cols-4 opacity-20">
                          <div className="border-r border-hairline"></div>
                          <div className="border-r border-hairline"></div>
                          <div className="border-r border-hairline"></div>
                          <div></div>
                        </div>

                        {/* EMPTY STATE (temporary) */}
                        {dailyPlan.plannedTasks.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-ash text-sm">
                              Nenhuma tarefa agendada ainda
                            </p>
                          </div>
                        )}

                        {/* (Tasks will come next step) */}
                        {activeTasks.map((task) => {
                          const [sh, sm] = task.startTime.split(':').map(Number);
                          const [eh, em] = task.endTime.split(':').map(Number);

                          const startInHours = sh + sm / 60;
                          const endInHours = eh + em / 60;

                          const top = (startInHours - START_HOUR) * HOUR_HEIGHT;
                          const height = (endInHours - startInHours) * HOUR_HEIGHT;

                          // �"� Adaptive UI logic
                          const isSmall = height < 60;
                          const isMedium = height >= 30 && height < 40;

                          return (
                            <div
                              key={task.id}
                              className={`group absolute left-4 right-4 pointer-events-auto rounded-xl p-2 backdrop-blur-lg border shadow-lg transition-all
        ${task.completed
                                  ? 'opacity-50 border-gray-500'
                                  : 'border-accent-blue/50 hover:scale-[1.02]'
                                }`}
                              style={{
                                top: `${top}px`,
                                height: `${height}px`,
                                backgroundColor:
                                  task.source === 'task'
                                    ? 'rgba(59,130,246,0.3)'
                                    : task.source === 'habit'
                                      ? 'rgba(34,197,94,0.3)'
                                      : 'rgba(168,85,247,0.3)'
                              }}
                            >

                              {/* �"� ACTION BUTTONS (FIXED) */}
                              <div
                                className="absolute top-1 right-1 flex gap-1 transition z-20 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleTask(task.id);
                                  }}
                                  className={`p-2 rounded ${task.completed
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-black/40 text-charcoal hover:bg-green-500/20 hover:text-green-400'
                                    }`}
                                >
                                  <CheckCircle2 size={14} />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFromDailyPlan(task.id);
                                  }}
                                  className="p-2 rounded bg-black/40 text-charcoal hover:bg-red-500/20 hover:text-red-400"
                                >
                                  <X size={14} />
                                </button>
                              </div>

                              {/* �"� CONTENT */}
                              <div className="h-full flex flex-col justify-start overflow-hidden">

                                {/* TITLE (ALWAYS VISIBLE) */}
                                <p className={`text-sm font-semibold truncate ${task.completed
                                  ? 'line-through text-mute'
                                  : 'text-ink'
                                  }`}>
                                  {task.title}
                                </p>

                                {/* TIME (ONLY IF SPACE AVAILABLE) */}
                                {!isSmall && (
                                  <p className="text-xs text-charcoal mt-1 truncate">
                                    {task.startTime} - {task.endTime}
                                  </p>
                                )}

                                {/* BADGES (ONLY IF LARGE BLOCK) */}
                                {!isSmall && !isMedium && (
                                  <div className="flex gap-2 mt-1 flex-wrap">
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-elevated border border-hairline-strong text-charcoal">
                                      {task.source}
                                    </span>

                                    {task.isImportant && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-yellow/20 text-accent-yellow">
                                        Importante
                                      </span>
                                    )}
                                  </div>
                                )}

                              </div>
                            </div>
                          );
                        })}

                      </div>
                    </div>
                  )}
                  {activeView === 'list' && (
                    <div className="space-y-3 p-5 bg-surface-card border border-hairline-strong rounded-2xl">
                      <h2 className="text-xl font-bold text-ink mb-4">Tarefas planejadas para hoje</h2>
                      {activeTasks.map((item, index) => (
                        <Motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative"
                        >
                          <div className="bg-surface-elevated rounded-lg p-3 border border-hairline-strong hover:border-white/50 transition-all">
                            <div className="flex items-start gap-3">
                              {/* Time */}
                              <div className="text-center min-w-[60px]">
                                <p className="text-xs text-accent-blue font-semibold">{item.startTime}</p>
                                <p className="text-xs text-ash">{item.endTime}</p>
                              </div>

                              {/* Content */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div className="flex-1">
                                    <h4 className={`font-medium ${item.completed ? 'line-through text-ash' : 'text-ink'}`}>
                                      {item.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getSourceBadge(item.source).color}`}>
                                        {getSourceBadge(item.source).label}
                                      </span>
                                      {item.isImportant && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30">
                                          Importante
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleToggleTask(item.id)}
                                      className={`p-2 rounded-lg transition-all ${item.completed
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-surface-deep text-mute hover:bg-green-500/20 hover:text-green-400'
                                        }`}
                                      data-testid={`complete-daily-task-${item.id}`}
                                    >
                                      <CheckCircle2 size={20} />
                                    </button>
                                    <button
                                      onClick={() => removeFromDailyPlan(item.id)}
                                      className="p-2 rounded-lg bg-surface-deep text-mute hover:bg-red-500/20 hover:text-red-400 transition-all"
                                      data-testid={`remove-daily-task-${item.id}`}
                                    >
                                      <X size={20} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Motion.div>
                      ))}
                    </div>
                  )}
                  {completedTasks.length > 0 && (
                    <div className="mt-8">

                      {/* HEADER */}
                      <h3 className="text-lg font-semibold text-charcoal mb-4">
                        Tarefas Concluídas ({completedTasks.length})
                      </h3>

                      {/* LIST */}
                      <div className="space-y-3">
                        {completedTasks.map(task => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between p-4 rounded-xl bg-surface-card border border-hairline-strong"
                          >

                            {/* LEFT */}
                            <div>
                              <p className="text-mute line-through">
                                {task.title}
                              </p>
                              <p className="text-xs text-ash">
                                {task.startTime} - {task.endTime}
                              </p>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex gap-2">

                              {/* UNDO (bring back to timeline) */}
                              <button
                                onClick={() => handleToggleTask(task.id)}
                                className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              >
                                <CheckCircle2 size={18} />
                              </button>

                              {/* DELETE */}
                              <button
                                onClick={() => removeFromDailyPlan(task.id)}
                                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                              >
                                <X size={18} />
                              </button>

                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </Motion.div>
          )}

          {/* ADD TO PLAN VIEW */}
          {activeTab === 'add' && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Sub-tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setAddModo('tasks')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${addModo === 'tasks'
                    ? 'bg-surface-elevated text-ink border border-hairline-strong'
                    : 'bg-surface-deep text-mute hover:bg-surface-elevated'
                    }`}
                  data-testid="add-from-tasks-tab"
                >
                  A partir de tarefas ({availableTasks.length})
                </button>
                <button
                  onClick={() => setAddModo('habits')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${addModo === 'habits'
                    ? 'bg-surface-elevated text-ink border border-hairline-strong'
                    : 'bg-surface-deep text-mute hover:bg-surface-elevated'
                    }`}
                  data-testid="add-from-habits-tab"
                >
                  Hábitos sugeridos ({suggestedHabits.length})
                </button>
                <button
                  onClick={() => setAddModo('manual')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${addModo === 'manual'
                    ? 'bg-surface-elevated text-ink border border-hairline-strong'
                    : 'bg-surface-deep text-mute hover:bg-surface-elevated'
                    }`}
                  data-testid="create-manual-task-tab"
                >
                  Criar Manual
                </button>
                <button
                  onClick={() => setAddModo('habits')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${addModo === 'habits'
                    ? 'bg-surface-elevated text-ink border border-hairline-strong'
                    : 'bg-surface-deep text-mute hover:bg-surface-elevated'
                    }`}
                  data-testid="add-from-habits-tab"
                >
                  H�bitos sugeridos ({suggestedHabits.length})
                </button>
                <button
                  onClick={() => setAddModo('manual')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${addModo === 'manual'
                    ? 'bg-surface-elevated text-ink border border-hairline-strong'
                    : 'bg-surface-deep text-mute hover:bg-surface-elevated'
                    }`}
                  data-testid="create-manual-task-tab"
                >
                  Criar Manual
                </button>
              </div>

              {/* Add from Tasks */}
              {addModo === 'tasks' && (
                <Card>
                  <h3 className="text-lg font-semibold text-ink mb-4">Selecionar tarefa para adicionar</h3>
                  {availableTasks.length > 0 ? (
                    <>
                      <div className="space-y-2 mb-6 max-h-96 overflow-y-auto pr-3">
                        {availableTasks.map(task => (
                          <Motion.div
                            key={task.id}
                            whileTap={{ scale: 0.98 }}
                            className="p-4 bg-surface-elevated rounded-lg border border-hairline-strong hover:border-accent-green/50 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <p className="text-ink font-medium">{task.title}</p>
                                {task.deadline && (
                                  <p className="text-xs text-mute">
                                    Prazo: {format(new Date(task.deadline), "d 'de' MMM 'às' HH:mm")}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setShowTimeModal(true);
                                }}
                                className="px-4 py-2 bg-[rgba(16,185,129,0.1)] text-accent-green rounded-lg hover:shadow-lg transition-all"
                                data-testid={`select-task-${task.id}`}
                              >
              Adicionar ao Plano
                              </button>
                            </div>
                          </Motion.div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-mute">Nenhuma tarefa disponível para adicionar</p>
                      <p className="text-sm text-ash mt-1">Todas as tarefas estão concluídas ou ja estão no plano</p>
                    </div>
                  )}
                </Card>
              )}

              {/* H�bitos sugeridos */}
              {addModo === 'habits' && (
                <Card>
                  <h3 className="text-lg font-semibold text-ink mb-4">H�bitos sugeridos</h3>
                  {suggestedHabits.length > 0 ? (
                    <div className="space-y-3 mb-6 max-h-96 overflow-y-auto px-3">
                      {suggestedHabits.map(habit => (
                        <Motion.div
                          key={habit.id}
                          whileHover={{ scale: 1.005 }}
                          className="p-4 bg-surface-elevated rounded-lg border border-hairline-strong hover:border-accent-green/50 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-ink font-medium">{habit.name}</h4>
                              <p className="text-sm text-mute">
                                {habit.startTime} - {habit.endTime || 'Sem horário final'}
                              </p>
                              <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 inline-block mt-1">
                                Hábito
                              </span>
                            </div>
                            <button
                              onClick={() => handleAddHabitToPlan(habit)}
                              className="px-4 py-2 bg-[rgba(16,185,129,0.1)] text-accent-green rounded-lg hover:shadow-lg transition-all"
                              data-testid={`add-habit-${habit.id}`}
                            >
                              Adicionar ao Plano
                            </button>
                          </div>
                        </Motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-mute">Nenhum hábito disponível</p>
                      <p className="text-sm text-ash mt-1">Hábitos sem horário ou ja adicionados ao plano ficam ocultos</p>
                    </div>
                  )}
                </Card>
              )}

              {/* Criar tarefa manual */}
              {addModo === 'manual' && (
                <Card>
                  <h3 className="text-lg font-semibold text-ink mb-4">Criar tarefa manual</h3>
                  <form onSubmit={handleCreateManualTask} className="space-y-4">
                    <InputField
                      label="Titulo da tarefa"
                      type="text"
                      value={manualTaskForm.title}
                      onChange={(e) => setManualTaskForm({ ...manualTaskForm, title: e.target.value })}
                      placeholder="O que você precisa fazer?"
                      required
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <InputField
                        label="Horario inicial"
                        type="time"
                        value={manualTaskForm.startTime}
                        onChange={(e) => setManualTaskForm({ ...manualTaskForm, startTime: e.target.value })}
                        required
                      />
                      <InputField
                        label="Horario final"
                        type="time"
                        value={manualTaskForm.endTime}
                        onChange={(e) => setManualTaskForm({ ...manualTaskForm, endTime: e.target.value })}
                        required
                      />
                    </div>

                    <label className="flex items-center gap-2 text-charcoal cursor-pointer">
                      <input
                        type="checkbox"
                        checked={manualTaskForm.isImportant}
                        onChange={(e) => setManualTaskForm({ ...manualTaskForm, isImportant: e.target.checked })}
                        className="w-5 h-5"
                      />
                      Marcar como Importante
                    </label>

                    <Button variant="primary" type="submit" className="w-full" data-testid="create-manual-task-btn">
                      Criar e Adicionar ao Plano
                    </Button>
                  </form>
                </Card>
              )}
            </Motion.div>
          )}
        </div>
      </div>
      {showTimeModal && selectedTask && (
        <Modal
          isOpen={showTimeModal}
          onClose={() => setShowTimeModal(false)}
          title={`Definir hor�rio para ${selectedTask.title}`}
        >
          <div className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Horario inicial"
                type="time"
                value={timeForm.startTime}
                onChange={(e) =>
                  setTimeForm({ ...timeForm, startTime: e.target.value })
                }
                required
              />

              <InputField
                label="Horario final"
                type="time"
                value={timeForm.endTime}
                onChange={(e) =>
                  setTimeForm({ ...timeForm, endTime: e.target.value })
                }
                required
              />
            </div>

            <Button
              variant="primary"
              onClick={handleAddTaskToPlan}
              className="w-full"
            >
              Adicionar ao Plano
            </Button>
          </div>
        </Modal>
      )}
    </Motion.div>
  );
};

export default DailyTaskTracker;
