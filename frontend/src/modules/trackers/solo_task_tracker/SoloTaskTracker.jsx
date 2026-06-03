import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { useApp } from '../../../hooks/useApp';
import Card from '../../../components/Card';
import TaskItem from '../../../components/TaskItem';
import Button from '../../../components/GradientButton';
import InputField from '../../../components/InputField';
import Modal from '../../../components/Modal';
import { motion } from 'framer-motion';

const SoloTaskTracker = () => {
  const {
    tasks,
    goals,
    projects,
    addTask,
    toggleTaskCompletion,
    deleteTask
  } = useApp();

  const [showAddTask, setShowAddTask] = useState(false);
  const [filterGoal, setFilterGoal] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    deadline: '',
    goalId: '',
    projectId: '',
    isImportant: false
  });

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    addTask({ ...newTask, createdFrom: 'solo' });
    setNewTask({ title: '', deadline: '', goalId: '', projectId: '', isImportant: false });
    setShowAddTask(false);
  };

  let filteredTasks = tasks;


  if (filterGoal) {
    filteredTasks = filteredTasks.filter(task => task.goalId === filterGoal);
  }

  if (filterProject) {
    filteredTasks = filteredTasks.filter(task => task.projectId === filterProject);
  }

  const pendingTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  return (
    <div className="min-h-screen bg-canvas pb-20 px-4 pt-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold young-serif-regular text-ink">Tarefas avulsas</h1>
            <p className="text-mute">Acompanhe tarefas individuais e afazeres</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowAddTask(true)}
            data-testid="add-task-btn"
          >
            <Plus size={24} />
          </Button>
        </motion.div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-accent-blue" />
              <h2 className="text-lg font-semibold text-ink">Filtros</h2>
            </div>

            {(filterGoal || filterProject) && (
              <button
                onClick={() => {
                  setFilterGoal('');
                  setFilterProject('');
                }}
                className="text-xs text-accent-blue hover:underline"
              >
                Reiniciar
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-charcoal text-sm font-medium mb-2">Filtrar por Meta</label>
              <select
                value={filterGoal}
                onChange={(e) => setFilterGoal(e.target.value)}
                className="w-full bg-surface-elevated text-ink border border-hairline-strong rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                data-testid="filter-goal-select"
              >
                <option value="">Todas as Metas</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id}>{goal.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-charcoal text-sm font-medium mb-2">Filtrar por Projeto</label>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full bg-surface-elevated text-ink border border-hairline-strong rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                data-testid="filter-project-select"
              >
                <option value="">Todos os Projetos</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </div>
          </div>
          {(filterGoal || filterProject) && (
            <button
              onClick={() => {
                setFilterGoal('');
                setFilterProject('');
              }}
              className="mt-3 text-sm text-accent-blue hover:underline"
              data-testid="clear-filters-btn"
            >
              Limpar Filtros
            </button>
          )}
        </Card>

        {/* Pending Tasks */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-ink mb-4">Tarefas Pendentes ({pendingTasks.length})</h2>
          {pendingTasks.length > 0 ? (
            <div className="space-y-3">
              {pendingTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <TaskItem
                    task={task}
                    onToggle={toggleTaskCompletion}
                    onDelete={deleteTask}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-mute text-center py-8">Nenhuma tarefa pendente. Ótimo trabalho! 🎉</p>
          )}
        </Card>

        {/* Concluido Tasks */}
        {completedTasks.length > 0 && (
          <Card className="opacity-80">
            <h2 className="text-xl font-bold text-ink mb-4">
              Tarefas Concluídas ({completedTasks.length})
            </h2>
            <p className="text-xs text-mute mb-3">Muito bem! Mantenha a sequência 🔥</p>
            <div className="space-y-3">
              {completedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTaskCompletion}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          </Card>
        )}

        {filteredTasks.length === 0 && (
          <Card className="text-center">
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📋</div>

              <p className="text-mute text-lg mb-2">
                Nenhuma tarefa ainda.
              </p>

              <p className="text-accent-blue text-sm mb-6">
                Comece a organizar seu dia como um profissional 🚀
              </p>

              <Button variant="primary" onClick={() => setShowAddTask(true)}>
                Adicionar Primeira Tarefa
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Adicionar tarefa Modal */}
      <Modal isOpen={showAddTask} onClose={() => setShowAddTask(false)} title="Criar nova tarefa">
        <div className="space-y-5">
          <InputField
            label="Titulo da tarefa"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Digite o título da tarefa"
            required
            data-testid="task-title-input"
          />

            <InputField
              label="Prazo (Opcional)"
              type="date"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              data-testid="task-deadline-input"
            />

            <div>
              <label className="block text-charcoal text-sm font-medium mb-2">Vincular à Meta (Opcional)</label>
              <select
                value={newTask.goalId}
                onChange={(e) => setNewTask({ ...newTask, goalId: e.target.value })}
                className="w-full bg-surface-elevated text-ink border border-hairline-strong rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                data-testid="task-goal-select"
              >
                <option value="">Sem meta</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id}>{goal.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-charcoal text-sm font-medium mb-2">Vincular ao Projeto (Opcional)</label>
              <select
                value={newTask.projectId}
                onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                className="w-full bg-surface-elevated text-ink border border-hairline-strong rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                data-testid="task-project-select"
              >
                <option value="">Sem projeto</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </div>

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
            Criar Tarefa
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SoloTaskTracker;