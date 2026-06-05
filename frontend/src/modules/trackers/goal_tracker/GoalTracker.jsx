import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Target, Trophy } from 'lucide-react';
import { useApp } from '../../../hooks/useApp';
import { useData } from '../../../hooks/useData';
import Card from '../../../components/Card';
import DonutChart from '../../../components/DonutChart';
import GoalCard from '../../../components/GoalCard';
import Button from '../../../components/GradientButton';
import InputField from '../../../components/InputField';
import Modal from '../../../components/Modal';
import TaskItem from '../../../components/TaskItem';
import ProjectCard from '../../../components/ProjectCard';
import { motion as Motion } from 'framer-motion';
import { SkeletonBlock, SkeletonCard, TrackerGridSkeleton } from '../../../components/LoadingSkeleton';
import { useXP } from '../../../hooks/useXP';
import { XP_VALUES } from '../../../data/gamification';
import { showToast } from '../../../utils/toastHelper';
import ProjectDetailView from '../../../components/ProjectDetailView';
import AddTaskModal from '../../../components/AddTaskModal';
import AddProjectModal from '../../../components/AddProjectModal';
import TrackerPageHeader from '../../../components/TrackerPageHeader';
import EmptyState from '../../../components/EmptyState';

const GoalTracker = () => {
  const navigate = useNavigate();
  const { toggleTaskCompletion } = useApp();
  const {
    goals,
    loading,
    addGoal,
    addProject,
    addTask,
    calculateGoalProgress,
    getTasksByGoal,
    getProjectsByGoal,
    getTasksByProject,
    calculateProjectProgress,
  } = useData();

  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', type: 'mid-term', description: '', deadline: '' });
  const { addXP, stats } = useXP();

  // useRef instead of useState(new Set()) to avoid re-render bug
  const claimedGoalsRef = useRef(new Set());

  const handleCompleteGoal = (goal) => {
    const progress = calculateGoalProgress(goal.id);
    if (progress < 100) {
      showToast({ message: 'Complete todas as tarefas da meta primeiro', status: 'warning' });
      return;
    }
    const key = `goal_${goal.id}`;
    if (claimedGoalsRef.current.has(key)) return;
    claimedGoalsRef.current.add(key);
    const xpMap = { final: XP_VALUES.goal_final, long_term: XP_VALUES.goal_longterm, mid_term: XP_VALUES.goal_midterm };
    addXP(xpMap[goal.type] ?? XP_VALUES.goal_midterm, 'meta concluída', {
      goalsCompleted: (stats?.goalsCompleted ?? 0) + 1,
    });
    showToast({ message: 'Meta concluída! XP concedido.', status: 'success' });
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;
    addGoal(newGoal);
    setNewGoal({ title: '', type: 'mid-term', description: '', deadline: '' });
    setShowAddGoal(false);
  };

  const handleAddProject = (projectData) => {
    if (!selectedGoal) return;
    addProject({
      ...projectData,
      goalId: selectedGoal.id,
      createdFrom: 'goal'
    });
    setShowAddProject(false);
  };

  const handleAddProjectTask = (taskData) => {
    if (!selectedProject) return;
    addTask({
      ...taskData,
      projectId: selectedProject.id,
      goalId: selectedProject.goalId,
      createdFrom: 'project'
    });
  };

  const handleAddGoalTask = (taskData) => {
    if (!selectedGoal) return;
    addTask({
      ...taskData,
      goalId: selectedGoal.id,
      createdFrom: 'goal'
    });
    setShowAddTask(false);
  };

  const handleGoalClick = (goal) => {
    setSelectedGoal(goal);
  };

  const handleBackToList = () => {
    setSelectedGoal(null);
  };

  // Calculate overall goals progress
  const overallProgresso = goals.length > 0
    ? Math.round(goals.reduce((sum, goal) => sum + calculateGoalProgress(goal.id), 0) / goals.length)
    : 0;

  // Project detail view (selected project inside a goal)
  if (selectedProject) {
    const projectTasks = getTasksByProject(selectedProject.id);
    const progress = calculateProjectProgress(selectedProject.id);
    const linkedGoal = goals.find(g => g.id === selectedProject.goalId);

    return (
      <ProjectDetailView
        project={selectedProject}
        tasks={projectTasks}
        linkedGoal={linkedGoal}
        progress={progress}
        onBack={() => setSelectedProject(null)}
        backLabel="Voltar aos Projetos"
        onAddTask={handleAddProjectTask}
        onToggleTask={toggleTaskCompletion}
        showXP={false}
      />
    );
  }

  // Goal detail view
  if (selectedGoal) {
    const goalTasks = getTasksByGoal(selectedGoal.id);
    const goalProjects = getProjectsByGoal(selectedGoal.id);
    const progress = calculateGoalProgress(selectedGoal.id);

    return (
      <div className="min-h-screen bg-canvas pb-20 px-4 pt-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-mute hover:text-ink mb-6 transition-all hover:-translate-x-1 cursor-pointer"
            data-testid="back-to-goals-btn"
          >
            <ArrowLeft size={20} />
            Voltar às Metas
          </button>

          <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mb-6">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                {/* LEFT SECTION */}
                <div className="flex flex-col gap-3 w-full">

                  {/* Top Row: Icon + Title + Badge */}
                  <div className="flex items-start justify-between gap-3">

                    <div className="flex gap-3 items-center">
                      <div className={`p-3 h-12 w-12 flex items-center justify-center bg-[rgba(59,158,255,0.1)] rounded-xl`}>
                        <Target size={20} className="text-accent-blue" />
                      </div>

                      <div>
                        <h1 className="text-xl md:text-2xl font-bold text-ink leading-tight">
                          {selectedGoal.title}
                        </h1>

                        <p className="text-sm text-accent-blue">
                          {progress}% concluído
                        </p>
                      </div>
                    </div>

                    {/* Type Badge */}
                    <span className="text-xs md:text-sm px-3 py-1 rounded-full bg-[rgba(59,158,255,0.1)] text-accent-blue whitespace-nowrap">
                      {selectedGoal.type}
                    </span>

                  </div>

                </div>

                {/* RIGHT SECTION → Donut */}
                <div className="flex justify-center md:justify-end">
                  <DonutChart value={progress} size={100} color="#6366f1" />
                </div>

              </div>

              {/* DESCRIPTION */}
              {selectedGoal.description && (
                <p className="text-mute mt-4 text-sm leading-relaxed">
                  {selectedGoal.description}
                </p>
              )}

              {progress >= 100 && (
                <div className="mt-6 pt-4 border-t border-white/[0.07]">
                  <Button
                    variant="primary"
                    onClick={() => handleCompleteGoal(selectedGoal)}
                    className="w-full"
                  >
                    <Trophy size={18} />
                    Receber XP por Concluir Meta
                  </Button>
                </div>
              )}

            </Card>
          </Motion.div>

          {goalProjects.length > 0 ? (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-ink">Projetos</h2>
                <Button
                  variant="primary"
                  onClick={() => setShowAddProject(true)}
                  data-testid="add-project-btn"
                >
                  <Plus size={20} className="inline mr-2" />
                  Adicionar Projeto
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {goalProjects.map((project, index) => (
                  <Motion.div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProjectCard
                      key={project.id}
                      project={project}
                      progress={calculateProjectProgress(project.id)}
                      onClick={() => navigate(`/trackers/projects/${project.id}`)}
                    />
                  </Motion.div>
                ))}
              </div>
            </div>
          ) : goalTasks.length > 0 && (
            <Card className="mb-4">
              <h2 className="text-xl font-bold text-ink mb-4">Projetos</h2>
              <EmptyState
                description="Nenhum projeto ainda. Adicione Projetos para um você mais forte."
                actionLabel="Adicionar Projeto"
                onAction={() => setShowAddProject(true)}
              />
            </Card>
          )}

          {goalTasks.length > 0 ? (
            <Card className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-ink">Tarefas</h2>
                <Button
                  variant="primary"
                  onClick={() => setShowAddTask(true)}
                  data-testid="add-task-btn"
                >
                  <Plus size={20} className="inline mr-2" />
                  Adicionar tarefa
                </Button>
              </div>
              <div className="space-y-3">
                {goalTasks.map((task) => (
                  <Motion.div
                    key={task.id}
                    whileHover={{ scale: 1.02 }}
                  >
                    <TaskItem
                      task={task}
                      onToggle={toggleTaskCompletion}
                    />
                  </Motion.div>
                ))}
              </div>
            </Card>
          ) : goalProjects.length > 0 && (
            <Card className="mb-4">
              <h2 className="text-xl font-bold text-ink mb-4">Tarefas</h2>
              <EmptyState
                description="Nenhuma tarefa ainda. Adicione sua primeira tarefa!"
                actionLabel="Adicionar tarefa"
                onAction={() => setShowAddTask(true)}
              />
            </Card>
          )}

          {goalProjects.length === 0 && goalTasks.length === 0 && (
            <Card>
              <EmptyState
                description="Nenhum projeto ou tarefa ainda. Comece a construir seu sistema de execução"
                actionLabel="Adicionar Projeto"
                onAction={() => setShowAddProject(true)}
              />
            </Card>
          )}
        </div>

        <AddTaskModal
          isOpen={showAddTask}
          onClose={() => setShowAddTask(false)}
          onSubmit={handleAddGoalTask}
          title="Adicionar tarefa à Meta"
        />

        <AddProjectModal
          isOpen={showAddProject}
          onClose={() => setShowAddProject(false)}
          onSubmit={handleAddProject}
          goals={goals}
          title="Criar novo projeto"
        />
      </div>
    );
  }

  // Main goals list view
  return (
    <div className="min-h-screen bg-canvas pb-20 px-4 pt-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <TrackerPageHeader
            title="Rastreador de metas"
            subtitle="Acompanhe suas metas finais, de longo prazo e médio prazo"
            actionLabel="Nova Meta"
            onAction={() => setShowAddGoal(true)}
            actionIcon={<Plus size={18} />}
          />
        </Motion.div>

        {/* Progresso geral */}
        {loading ? (
          <SkeletonCard className="mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 w-full">
                <SkeletonBlock className="h-6 w-44" />
                <SkeletonBlock className="h-4 w-72 max-w-full" />
                <SkeletonBlock className="h-4 w-28" />
              </div>
              <SkeletonBlock className="h-32 w-32 rounded-full" />
              <div className="flex gap-6">
                <SkeletonBlock className="h-12 w-16" />
                <SkeletonBlock className="h-12 w-16" />
                <SkeletonBlock className="h-12 w-16" />
              </div>
            </div>
          </SkeletonCard>
        ) : goals.length > 0 && (
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">

              {/* Left */}
              <div>
                <h2 className="text-xl font-bold text-ink mb-1">
                  Progresso geral
                </h2>
                <p className="text-mute text-sm">
                  Continue assim — a consistência constrói o sucesso 🚀
                </p>

                <div className="mt-3 text-sm text-mute">
                  Total de Metas: <span className="text-ink font-semibold">{goals.length}</span>
                </div>
              </div>

              {/* Center Donut */}
              <div>
                <DonutChart value={overallProgresso} size={140} color="#6366f1" />
              </div>

              {/* Right Stats */}
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-green-400 text-xl font-bold">
                    {goals.filter(g => calculateGoalProgress(g.id) >= 80).length}
                  </p>
                    <p className="text-xs text-mute">No Caminho</p>
                </div>

                <div>
                  <p className="text-yellow-400 text-xl font-bold">
                    {goals.filter(g => {
                      const p = calculateGoalProgress(g.id);
                      return p >= 50 && p < 80;
                    }).length}
                  </p>
                  <p className="text-xs text-mute">Em andamento</p>
                </div>

                <div>
                  <p className="text-red-400 text-xl font-bold">
                    {goals.filter(g => calculateGoalProgress(g.id) < 50).length}
                  </p>
                  <p className="text-xs text-mute">Atrasado</p>
                </div>
              </div>

            </div>
          </Card>
        )}

        {/* Goals Grid */}
        {loading ? (
          <TrackerGridSkeleton count={6} />
        ) : goals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(goal => (
              <div key={goal.id} onClick={() => handleGoalClick(goal)}>
                <GoalCard
                  goal={goal}
                  progress={calculateGoalProgress(goal.id)}
                  onClick={() => handleGoalClick(goal)}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Target size={64} className="animate-pulse" />}
            title="Nenhuma meta ainda"
            description="Comece adicionando sua primeira meta!"
            actionLabel="Adicionar Primeira Meta"
            onAction={() => setShowAddGoal(true)}
          />
        )}
      </div>

      {/* Add Goal Modal — specific to GoalTracker, not extracted */}
      <Modal isOpen={showAddGoal} onClose={() => setShowAddGoal(false)} title="Criar nova meta">
        <form onSubmit={handleAddGoal} className="space-y-4">
          <InputField
            label="Titulo da meta"
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            placeholder="Digite o título da meta"
            required
            data-testid="goal-title-input"
          />

          <div>
            <label className="block text-charcoal text-sm font-medium mb-2">Categoria</label>
            <select
              value={newGoal.type}
              onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
              className="w-full bg-surface-elevated text-ink border border-hairline-strong rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-blue"
              data-testid="goal-type-select"
            >
              <option value="final">Meta Final</option>
              <option value="long-term">Meta de Longo Prazo</option>
              <option value="mid-term">Meta de Médio Prazo</option>
            </select>
          </div>

          <div>
            <label className="block text-charcoal text-sm font-medium mb-2">Descrição (Opcional)</label>
            <textarea
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              placeholder="Descreva sua meta..."
              data-testid="goal-description-input"
              required
              className="w-full bg-surface-elevated text-ink border border-hairline-strong rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-blue min-h-[100px]"
            />
          </div>

          <InputField
            label="Prazo"
            type="date"
            value={newGoal.deadline}
            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
            data-testid="goal-deadline-input"
            required
          />

          <Button variant="primary" type="submit" className="w-full" data-testid="submit-goal-btn">
            Criar meta
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default GoalTracker;
