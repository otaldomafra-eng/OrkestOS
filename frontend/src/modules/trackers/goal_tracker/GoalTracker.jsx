import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, ChevronRight, Target, Trophy } from 'lucide-react';
import { useApp } from '../../../hooks/useApp';
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

const GoalTracker = () => {
  const navigate = useNavigate();
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
    toggleTaskCompletion
  } = useApp();

  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddProjectTask, setShowAddProjectTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', deadline: '', projectId: '', isImportant: false });
  const [newProjectTask, setNewProjectTask] = useState({ title: '', deadline: '', isImportant: false });
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', deadline: '', description: '' });
  const [newGoal, setNewGoal] = useState({ title: '', type: 'mid-term', description: '', deadline: '' });
  const { addXP, stats } = useXP();

  const claimedGoalsRef = useState(new Set())[0];

  const handleCompleteGoal = (goal) => {
    const progress = calculateGoalProgress(goal.id);
    if (progress < 100) {
      showToast({ message: 'Complete todas as tarefas da meta primeiro', status: 'warning' });
      return;
    }
    const key = `goal_${goal.id}`;
    if (claimedGoalsRef.has(key)) return;
    claimedGoalsRef.add(key);
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

  const handleAddProject = () => {
    if (!newProject.title.trim() || !selectedGoal) return;
    addProject({
      ...newProject,
      goalId: selectedGoal.id,
      createdFrom: 'goal'
    });
    setNewProject({ title: '', deadline: '', description: '' });
    setShowAddProject(false);
  };

  const handleAddProjectTask = () => {
    if (!newProjectTask.title.trim() || !selectedProject) return;
    addTask({
      ...newProjectTask,
      projectId: selectedProject.id,
      goalId: selectedProject.goalId,
      createdFrom: 'project'
    });
    setNewTask({ title: '', deadline: '', isImportant: false });
    setShowAddTask(false);
  };

  const handleAddTask = () => {
    if (!newTask.title.trim() || !selectedGoal) return;
    addTask({
      ...newTask,
      goalId: selectedGoal.id,
      createdFrom: 'goal'
    });
    setNewTask({ title: '', deadline: '', projectId: '', isImportant: false });
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

  if (selectedProject) {
    const projectTasks = getTasksByProject(selectedProject.id);
    const progress = calculateProjectProgress(selectedProject.id);
    const linkedGoal = goals.find(g => g.id === selectedProject.goalId);

    return (
      <div className="min-h-screen bg-canvas pb-20 px-4 pt-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedProject(null)}
            className="flex items-center gap-2 text-mute hover:text-ink mb-6 transition-all hover:-translate-x-1 cursor-pointer"
            data-testid="back-to-projects-btn"
          >
            <ArrowLeft size={20} />
            Voltar aos Projetos
          </button>

          <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-[rgba(16,185,129,0.1)]">
                    <Target size={22} className="text-accent-green" />
                  </div>

                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-ink">
                      {selectedProject.title}
                    </h1>

                    <p className="text-sm text-accent-green mt-1">
                      Progresso: {progress}%
                    </p>

                    {linkedGoal && (
                      <span className="text-xs mt-1 inline-block text-accent-blue">
                        Vinculado a: {linkedGoal.title}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <DonutChart value={progress} size={100} color="#10b981" />
                </div>
              </div>
              {selectedProject.description && (
                <p className="text-mute mt-4">{selectedProject.description}</p>
              )}
            </Card>
          </Motion.div>

          <Card className="">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-ink">Tarefas</h2>
              <Button
                variant="primary"
                onClick={() => setShowAddProjectTask(true)}
                data-testid="add-task-btn"
              >
                <Plus size={20} className="inline mr-2" />
                Adicionar tarefa
              </Button>
            </div>
            {projectTasks.length > 0 ? (
              <div className="space-y-3">
                {projectTasks.map((task, index) => (
                  <Motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <TaskItem
                      task={task}
                      onToggle={toggleTaskCompletion}
                    />
                  </Motion.div>
                ))}
              </div>
            ) : (
              <p className="text-mute text-center py-8">Nenhuma tarefa ainda. Adicione sua primeira tarefa!</p>
            )}
          </Card>
        </div>

        {/* Adicionar tarefa Modal */}
        <Modal isOpen={showAddProjectTask} onClose={() => setShowAddProjectTask(false)} title="Adicionar tarefa ao Projeto">
          <div className="space-y-4">
            <InputField
              label="Titulo da tarefa"
              value={newProjectTask.title}
              onChange={(e) => setNewProjectTask({ ...newProjectTask, title: e.target.value })}
              placeholder="Digite o título da tarefa"
              data-testid="task-title-input"
            />
            <InputField
              label="Prazo (Opcional)"
              type="date"
              value={newProjectTask.deadline}
              onChange={(e) => setNewProjectTask({ ...newProjectTask, deadline: e.target.value })}
              data-testid="task-deadline-input"
            />
            <div className="flex items-center justify-between bg-surface-card border border-hairline-strong rounded-lg px-4 py-3">
              <label htmlFor="important" className="text-charcoal text-sm">
                Marcar como Importante
              </label>

              <input
                type="checkbox"
                id="important"
                checked={newProjectTask.isImportant}
                onChange={(e) => setNewProjectTask({ ...newProjectTask, isImportant: e.target.checked })}
                className="w-5 h-5 accent-yellow-500"
                data-testid="task-important-checkbox"
              />
            </div>
            <Button variant="primary" onClick={handleAddProjectTask} className="w-full" data-testid="submit-task-btn">
              Adicionar tarefa
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

  if (selectedGoal) {
    const goalTasks = getTasksByGoal(selectedGoal.id);
    const goalProjects = getProjectsByGoal(selectedGoal.id);
    const progress = calculateGoalProgress(selectedGoal.id);

    if(selectedProject) return;

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
            <Card className="mb-4 text-center">
              <h2 className="text-xl font-bold text-ink mb-4 text-start">Projetos</h2>
              <p className="text-mute text-center py-8">
                Nenhum projeto ainda.
                <br />
                <span className="text-accent-blue">Adicione Projetos para um você mais forte.</span>
              </p>
              <Button
                variant="primary"
                onClick={() => setShowAddProject(true)}
                data-testid="add-project-btn"
              >
                <Plus size={20} className="inline mr-2" />
                Adicionar Projeto
              </Button>
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
                      key={task.id}
                      task={task}
                      onToggle={toggleTaskCompletion}
                    />
                  </Motion.div>
                ))}
              </div>
            </Card>
          ) : goalProjects.length > 0 && (
            <Card className="mb-4 text-center">
              <h2 className="text-xl font-bold text-ink mb-4 text-start">Tarefas</h2>
              <p className="text-mute text-center py-8">
                Nenhuma tarefa ainda.
                <br />
                <span className="text-accent-blue">Adicione sua primeira tarefa!</span>
              </p>
              <Button
                variant="primary"
                onClick={() => setShowAddTask(true)}
                data-testid="add-task-btn"
              >
                <Plus size={20} className="inline mr-2" />
                Adicionar tarefa
              </Button>
            </Card>
          )}


          {goalProjects.length === 0 && goalTasks.length === 0 && (
            <Card className="text-center">
              <p className="text-mute text-center py-8">
                Nenhum projeto ou tarefa ainda.
                <br />
                <span className="text-accent-blue">Comece a construir seu sistema de execução</span>
              </p>
              <div className='flex gap-3 justify-center'>
                <Button
                  variant="primary"
                  onClick={() => setShowAddProject(true)}
                  data-testid="add-project-btn"
                >
                  <Plus size={20} className="inline mr-2" />
                  Adicionar Projeto
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowAddTask(true)}
                  data-testid="add-task-btn"
                >
                  <Plus size={20} className="inline mr-2" />
                  Adicionar tarefa
                </Button>
              </div>
            </Card>
          )}
        </div>
        {/* Adicionar tarefa Modal */}
        <Modal isOpen={showAddTask} onClose={() => setShowAddTask(false)} title="Adicionar tarefa ao Projeto">
          <div className="space-y-4">
            <InputField
              label="Titulo da tarefa"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Digite o título da tarefa"
              data-testid="task-title-input"
            />
            <div>
              <label className="block text-charcoal text-sm font-medium mb-2">Vincular ao Projeto (Opcional)</label>
              <select
                value={newTask.projectId}
                onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                className="w-full bg-surface-elevated text-ink border border-hairline-strong rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                data-testid="task-project-select"
              >
                <option value="">Sem Projeto (independente)</option>
                {goalProjects.map(project => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </div>
            <InputField
              label="Prazo (Opcional)"
              type="date"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              data-testid="task-deadline-input"
            />
            <div className="flex items-center justify-between bg-surface-card border border-hairline-strong rounded-lg px-4 py-3">
              <label htmlFor="important" className="text-charcoal text-sm">
                Marcar como Importante
              </label>

              <input
                type="checkbox"
                id="important"
                checked={newTask.isImportant}
                onChange={(e) => setNewTask({ ...newTask, isImportant: e.target.checked })}
                className="w-5 h-5 accent-yellow-500"
                data-testid="task-important-checkbox"
              />
            </div>
            <Button variant="primary" onClick={handleAddTask} className="w-full" data-testid="submit-task-btn">
              Adicionar tarefa
            </Button>
          </div>
        </Modal>
        {/* Add Project Modal */}
        <Modal isOpen={showAddProject} onClose={() => setShowAddProject(false)} title="Criar novo projeto">
          <div className="space-y-4">
            <InputField
              label="Titulo do projeto"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              placeholder="Digite o título do projeto"
              required
              data-testid="project-title-input"
            />

            <InputField
              label="Deadline (Optional)"
              type="date"
              value={newProject.deadline}
              onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
              required
              data-testid="project-deadline-input"
            />

            <div>
              <label className="block text-charcoal text-sm font-medium mb-2">Descrição</label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Descreva seu projeto..."
                data-testid="project-description-input"
                required
                className="w-full bg-surface-elevated text-ink border border-hairline-strong rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-blue min-h-[100px]"
              />
            </div>

            <Button variant="primary" onClick={handleAddProject} className="w-full" data-testid="submit-project-btn">
              Criar projeto
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas pb-20 px-4 pt-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-6"
        >
          <div>
            <h1 className="text-3xl young-serif-regular font-bold text-ink">Rastreador de metas</h1>
            <p className="text-mute">Acompanhe suas metas finais, de longo prazo e médio prazo</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowAddGoal(true)}
            data-testid="add-goal-btn"
          >
            <Plus size={24} />
          </Button>
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
              <div onClick={() => handleGoalClick(goal)}>


                <GoalCard
                  key={goal.id}
                  goal={goal}
                  progress={calculateGoalProgress(goal.id)}
                  onClick={() => handleGoalClick(goal)}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className="text-center">
            <div className="text-center py-16">
              <Target size={64} className="mx-auto text-accent-blue mb-4 animate-pulse" />
              <p className="text-mute text-lg mb-4">Nenhuma meta ainda. Comece adicionando sua primeira meta!</p>
              <Button variant="primary" onClick={() => setShowAddGoal(true)} data-testid="add-first-goal-btn">
                Adicionar Primeira Meta
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Add Goal Modal */}
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
