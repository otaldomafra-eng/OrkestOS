import { useState } from 'react';
import { Plus, ArrowLeft, Target, Trophy } from 'lucide-react';
import { useApp } from '../../../hooks/useApp';
import Card from '../../../components/Card';
import ProjectCard from '../../../components/ProjectCard';
import Button from '../../../components/GradientButton';
import InputField from '../../../components/InputField';
import Modal from '../../../components/Modal';
import TaskItem from '../../../components/TaskItem';
import DonutChart from '../../../components/DonutChart';
import { motion } from 'framer-motion';
import { useXP } from '../../../hooks/useXP';
import { XP_VALUES } from '../../../data/gamification';
import { showToast } from '../../../utils/toastHelper';

const ProjectTracker = () => {
  const {
    projects,
    goals,
    addProject,
    calculateProjectProgress,
    getTasksByProject,
    toggleTaskCompletion,
    addTask
  } = useApp();

  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', goalId: '', deadline: '', description: '' });
  const [newTask, setNewTask] = useState({ title: '', deadline: '', isImportant: false });
  const { addXP, stats } = useXP();

  const handleCompleteProject = (project) => {
    const progress = calculateProjectProgress(project.id);
    if (progress < 100) {
      showToast({ message: 'Complete todas as tarefas do projeto primeiro', status: 'warning' });
      return;
    }
    addXP(XP_VALUES.project, 'projeto concluído', {
      projectsCompleted: (stats?.projectsCompleted ?? 0) + 1,
    });
    showToast({ message: 'Projeto concluído! +200 XP', status: 'success' });
  };

  const handleAddProject = () => {
    if (!newProject.title.trim()) return;
    addProject(newProject);
    setNewProject({ title: '', goalId: '', deadline: '', description: '' });
    setShowAddProject(false);
  };

  const handleAddTask = () => {
    if (!newTask.title.trim() || !selectedProject) return;
    addTask({
      ...newTask,
      projectId: selectedProject.id,
      goalId: selectedProject.goalId,
      createdFrom: 'project'
    });
    setNewTask({ title: '', deadline: '', isImportant: false });
    setShowAddTask(false);
  };

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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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
              {progress >= 100 && (
                <div className="mt-6 pt-4 border-t border-white/[0.07]">
                  <Button
                    variant="primary"
                    onClick={() => handleCompleteProject(selectedProject)}
                    className="w-full"
                  >
                    <Trophy size={18} />
                    Receber XP por Concluir Projeto
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>

          <Card>
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
            {projectTasks.length > 0 ? (
              <div className="space-y-3">
                {projectTasks.map((task, index) => (
                  <motion.div
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
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-mute text-center py-8">Nenhuma tarefa ainda. Adicione sua primeira tarefa!</p>
            )}
          </Card>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas pb-20 px-4 pt-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-6"
        >
          <div>
            <h1 className="text-3xl young-serif-regular font-bold text-ink">Rastreador de projetos</h1>
            <p className="text-mute">Gerencie projetos vinculados às suas metas</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowAddProject(true)}
            data-testid="add-project-btn"
          >
            <Plus size={24} />
          </Button>
        </motion.div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => {
              const linkedGoal = goals.find(g => g.id === project.goalId);
              return (
                <motion.div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProjectCard
                    project={project}
                    progress={calculateProjectProgress(project.id)}
                    linkedGoal={linkedGoal?.title}
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="text-center">
            <div className="text-center py-16">
              <p className="text-mute text-lg mb-4">
                Nenhum projeto ainda.
              </p>
              <p className="text-accent-blue text-sm mb-6">
                Comece a construir seu sistema de execução 🚀
              </p>

              <Button variant="primary" onClick={() => setShowAddProject(true)}>
                Adicionar Primeiro Projeto
              </Button>
            </div>
          </Card>
        )}
      </div>

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

          <div>
            <label className="block text-charcoal text-sm font-medium mb-2">Vincular à Meta (Opcional)</label>
            <select
              value={newProject.goalId}
              onChange={(e) => setNewProject({ ...newProject, goalId: e.target.value })}
              className="w-full bg-surface-elevated text-ink border border-hairline-strong rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-blue"
              data-testid="project-goal-select"
            >
                <option value="">Sem meta (independente)</option>
              {goals.map(goal => (
                <option key={goal.id} value={goal.id}>{goal.title}</option>
              ))}
            </select>
          </div>

            <InputField
              label="Prazo (Opcional)"
              type="date"
              value={newProject.deadline}
              onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
              data-testid="project-deadline-input"
            />

            <div>
              <label className="block text-charcoal text-sm font-medium mb-2">Descrição (Opcional)</label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Descreva seu projeto..."
              data-testid="project-description-input"
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
};

export default ProjectTracker;