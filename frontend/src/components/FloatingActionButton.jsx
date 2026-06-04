import { useState } from 'react';
import { Plus, CheckSquare, Repeat, Target, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './Modal';
import InputField from './InputField';
import { useData } from '../hooks/useData';

const ACTIONS = [
  { key: 'task',    label: 'Nova Tarefa',  Icon: CheckSquare },
  { key: 'habit',   label: 'Novo Hábito',  Icon: Repeat },
  { key: 'goal',    label: 'Nova Meta',    Icon: Target },
  { key: 'project', label: 'Novo Projeto', Icon: Folder },
];

const SELECT_CLASS =
  'w-full bg-surface-deep text-ink border border-hairline-strong rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-colors';

const SUBMIT_STYLE = {
  background: 'linear-gradient(135deg, #7850ff, #3b9eff)',
};

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const [taskForm, setTaskForm]       = useState({ title: '', priority: 'normal' });
  const [habitForm, setHabitForm]     = useState({ name: '', frequency: 'daily' });
  const [goalForm, setGoalForm]       = useState({ title: '', deadline: '' });
  const [projectForm, setProjectForm] = useState({ name: '', goalId: '' });

  const { addTask, addHabit, addGoal, addProject, goals } = useData();

  const openModal = (key) => {
    setIsOpen(false);
    setActiveModal(key);
  };

  const closeModal = () => {
    setActiveModal(null);
    setTaskForm({ title: '', priority: 'normal' });
    setHabitForm({ name: '', frequency: 'daily' });
    setGoalForm({ title: '', deadline: '' });
    setProjectForm({ name: '', goalId: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeModal === 'task') {
      if (!taskForm.title.trim()) return;
      await addTask({ title: taskForm.title.trim(), priority: taskForm.priority, createdFrom: 'fab' });
    } else if (activeModal === 'habit') {
      if (!habitForm.name.trim()) return;
      await addHabit({ name: habitForm.name.trim(), frequency: habitForm.frequency });
    } else if (activeModal === 'goal') {
      if (!goalForm.title.trim()) return;
      await addGoal({
        title: goalForm.title.trim(),
        ...(goalForm.deadline && { deadline: goalForm.deadline }),
      });
    } else if (activeModal === 'project') {
      if (!projectForm.name.trim()) return;
      await addProject({ name: projectForm.name.trim(), goalId: projectForm.goalId || null });
    }
    closeModal();
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[55]"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Speed Dial container */}
      <div
        className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 z-[60] flex flex-col items-end gap-3"
        role="region"
        aria-label="Ações rápidas"
      >
        {/* Sub-botões */}
        <AnimatePresence>
          {isOpen && ACTIONS.map(({ key, label, Icon }, i) => (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 16 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: (ACTIONS.length - 1 - i) * 0.06 },
              }}
              exit={{
                opacity: 0,
                y: 16,
                transition: { delay: i * 0.04 },
              }}
              onClick={() => openModal(key)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium text-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60"
              style={{
                background: 'rgba(18,10,40,0.95)',
                border: '1px solid rgba(120,80,255,0.3)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.borderColor = 'rgba(120,80,255,0.6)')
              }
              onMouseLeave={e =>
                (e.currentTarget.style.borderColor = 'rgba(120,80,255,0.3)')
              }
            >
              <span>{label}</span>
              <Icon size={16} />
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Botão principal FAB */}
        <motion.button
          onClick={() => setIsOpen(prev => !prev)}
          className="w-14 h-14 rounded-full flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          style={{
            background: 'linear-gradient(135deg, #7850ff, #3b9eff)',
            boxShadow: isOpen
              ? '0 0 32px rgba(120,80,255,0.7)'
              : '0 0 24px rgba(120,80,255,0.5)',
          }}
          whileTap={{ scale: 0.92 }}
          aria-label={isOpen ? 'Fechar menu' : 'Criar novo item'}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus size={24} className="text-white" />
          </motion.div>
        </motion.button>
      </div>

      {/* Modal: Nova Tarefa */}
      <Modal isOpen={activeModal === 'task'} onClose={closeModal} title="Nova Tarefa">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField
            label="Título"
            value={taskForm.title}
            onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Nome da tarefa"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-mute">Prioridade</label>
            <select
              value={taskForm.priority}
              onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))}
              className={SELECT_CLASS}
            >
              <option value="normal">Normal</option>
              <option value="importante">Importante</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2.5 rounded-lg text-white font-medium" style={SUBMIT_STYLE}>
            Criar Tarefa
          </button>
        </form>
      </Modal>

      {/* Modal: Novo Hábito */}
      <Modal isOpen={activeModal === 'habit'} onClose={closeModal} title="Novo Hábito">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField
            label="Nome"
            value={habitForm.name}
            onChange={e => setHabitForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Nome do hábito"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-mute">Frequência</label>
            <select
              value={habitForm.frequency}
              onChange={e => setHabitForm(f => ({ ...f, frequency: e.target.value }))}
              className={SELECT_CLASS}
            >
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2.5 rounded-lg text-white font-medium" style={SUBMIT_STYLE}>
            Criar Hábito
          </button>
        </form>
      </Modal>

      {/* Modal: Nova Meta */}
      <Modal isOpen={activeModal === 'goal'} onClose={closeModal} title="Nova Meta">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField
            label="Título"
            value={goalForm.title}
            onChange={e => setGoalForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Nome da meta"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-mute">Prazo (opcional)</label>
            <input
              type="date"
              value={goalForm.deadline}
              onChange={e => setGoalForm(f => ({ ...f, deadline: e.target.value }))}
              className={SELECT_CLASS}
            />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-lg text-white font-medium" style={SUBMIT_STYLE}>
            Criar Meta
          </button>
        </form>
      </Modal>

      {/* Modal: Novo Projeto */}
      <Modal isOpen={activeModal === 'project'} onClose={closeModal} title="Novo Projeto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField
            label="Nome"
            value={projectForm.name}
            onChange={e => setProjectForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Nome do projeto"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-mute">Meta vinculada (opcional)</label>
            <select
              value={projectForm.goalId}
              onChange={e => setProjectForm(f => ({ ...f, goalId: e.target.value }))}
              className={SELECT_CLASS}
            >
              <option value="">Sem meta vinculada</option>
              {goals
                .filter(g => g.status !== 'concluida')
                .map(g => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
            </select>
          </div>
          <button type="submit" className="w-full py-2.5 rounded-lg text-white font-medium" style={SUBMIT_STYLE}>
            Criar Projeto
          </button>
        </form>
      </Modal>
    </>
  );
}
