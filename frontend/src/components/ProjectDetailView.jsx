import { useState } from 'react';
import { Plus, ArrowLeft, Target, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from './Card';
import DonutChart from './DonutChart';
import Button from './GradientButton';
import InputField from './InputField';
import Modal from './Modal';
import TaskItem from './TaskItem';

/**
 * ProjectDetailView
 *
 * Bloco reutilizável de visualização de projeto selecionado.
 * Extraído do padrão duplicado presente em GoalTracker e ProjectTracker.
 *
 * Props:
 *   project      {object}   - objeto do projeto (id, title, description, goalId, ...)
 *   tasks        {array}    - lista de tarefas do projeto
 *   linkedGoal   {object}   - meta vinculada ao projeto (opcional) – { title }
 *   progress     {number}   - progresso calculado (0-100)
 *   onBack       {function} - callback do botão "Voltar"
 *   backLabel    {string}   - texto do botão voltar (padrão: "Voltar aos Projetos")
 *   onAddTask    {function} - recebe { title, deadline, isImportant }
 *   onToggleTask {function} - recebe taskId
 *   onCompleteProject {function} - recebe o projeto; chamado pelo botão de XP (opcional)
 *   showXP       {bool}     - exibe botão de receber XP quando progress >= 100 (padrão: true)
 */
export const ProjectDetailView = ({
  project,
  tasks = [],
  linkedGoal,
  progress = 0,
  onBack,
  backLabel = 'Voltar aos Projetos',
  onAddTask,
  onToggleTask,
  onCompleteProject,
  showXP = true,
}) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', deadline: '', isImportant: false });

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    onAddTask?.({ ...newTask });
    setNewTask({ title: '', deadline: '', isImportant: false });
    setShowAddTask(false);
  };

  return (
    <div className="min-h-screen bg-canvas pb-20 px-4 pt-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">

        {/* Botão voltar */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-mute hover:text-ink mb-6 transition-all hover:-translate-x-1 cursor-pointer"
          data-testid="back-to-projects-btn"
        >
          <ArrowLeft size={20} />
          {backLabel}
        </button>

        {/* Card de cabeçalho do projeto */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[rgba(16,185,129,0.1)]">
                  <Target size={22} className="text-accent-green" />
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-ink">
                    {project.title}
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

            {project.description && (
              <p className="text-mute mt-4">{project.description}</p>
            )}

            {showXP && progress >= 100 && onCompleteProject && (
              <div className="mt-6 pt-4 border-t border-white/[0.07]">
                <Button
                  variant="primary"
                  onClick={() => onCompleteProject(project)}
                  className="w-full"
                >
                  <Trophy size={18} />
                  Receber XP por Concluir Projeto
                </Button>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Card de tarefas */}
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

          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <TaskItem
                    task={task}
                    onToggle={onToggleTask}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-mute text-center py-8">
              Nenhuma tarefa ainda. Adicione sua primeira tarefa!
            </p>
          )}
        </Card>
      </div>

      {/* Modal de adicionar tarefa */}
      <Modal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        title="Adicionar tarefa ao Projeto"
      >
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
            <label htmlFor="pdv-important" className="text-charcoal text-sm">
              Marcar como Importante
            </label>
            <input
              type="checkbox"
              id="pdv-important"
              checked={newTask.isImportant}
              onChange={(e) => setNewTask({ ...newTask, isImportant: e.target.checked })}
              className="w-5 h-5 accent-yellow-500"
              data-testid="task-important-checkbox"
            />
          </div>
          <Button
            variant="primary"
            onClick={handleAddTask}
            className="w-full"
            data-testid="submit-task-btn"
          >
            Adicionar tarefa
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetailView;
