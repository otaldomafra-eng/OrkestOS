import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { useApp } from '../../../hooks/useApp';
import { useData } from '../../../hooks/useData';
import Card from '../../../components/Card';
import TaskItem from '../../../components/TaskItem';
import TrackerPageHeader from '../../../components/TrackerPageHeader';
import EmptyState from '../../../components/EmptyState';
import AddTaskModal from '../../../components/AddTaskModal';
import { motion } from 'framer-motion';

const SoloTaskTracker = () => {
  const { toggleTaskCompletion } = useApp();
  const {
    tasks,
    goals,
    projects,
    addTask,
    deleteTask,
  } = useData();

  const [showAddTask, setShowAddTask] = useState(false);
  const [filterGoal, setFilterGoal] = useState('');
  const [filterProject, setFilterProject] = useState('');

  const handleAddTask = ({ title, deadline, isImportant }) => {
    addTask({ title, deadline, isImportant, goalId: '', projectId: '', createdFrom: 'solo' });
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
        >
          <TrackerPageHeader
            title="Tarefas avulsas"
            subtitle="Acompanhe tarefas individuais e afazeres"
            actionLabel="Nova tarefa"
            actionIcon={<Plus size={16} />}
            onAction={() => setShowAddTask(true)}
          />
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
          <EmptyState
            icon={<span className="text-5xl">📋</span>}
            title="Nenhuma tarefa ainda."
            description="Comece a organizar seu dia como um profissional 🚀"
            actionLabel="Adicionar Primeira Tarefa"
            onAction={() => setShowAddTask(true)}
          />
        )}
      </div>

      <AddTaskModal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        onSubmit={handleAddTask}
        title="Criar nova tarefa"
      />
    </div>
  );
};

export default SoloTaskTracker;
