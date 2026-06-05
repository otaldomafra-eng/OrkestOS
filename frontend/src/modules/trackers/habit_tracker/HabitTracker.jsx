import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Flame } from 'lucide-react';
import { useApp } from '../../../hooks/useApp';
import { useData } from '../../../hooks/useData';
import Card from '../../../components/Card';
import HabitCard from '../../../components/HabitCard';
import Button from '../../../components/GradientButton';
import InputField from '../../../components/InputField';
import Modal from '../../../components/Modal';
import { motion } from 'framer-motion';
import { showToast } from '../../../utils/toastHelper';
import TrackerPageHeader from '../../../components/TrackerPageHeader';
import EmptyState from '../../../components/EmptyState';

const HabitTracker = () => {
  const { handleCompleteHabit } = useApp();
  const { habits, addHabit, deleteHabit } = useData();
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    type: 'build',
    startTime: '',
    endTime: '',
    mode: '21-day'
  });

  const handleAddHabit = () => {
    if (!newHabit.name.trim() || !newHabit.startTime || !newHabit.endTime) {
      showToast({ message: 'Por favor, preencha todos os campos obrigatórios', status: 'error' });
      return;
    }
    addHabit(newHabit);
    setNewHabit({ name: '', type: 'build', startTime: '', endTime: '', mode: '21-day' });
    setShowAddHabit(false);
  };
  
  const buildHabits = habits.filter(h => h.type === 'build');
  const breakHabits = habits.filter(h => h.type === 'break');

  return (
    <div className="min-h-screen bg-canvas pb-20 px-4 pt-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <TrackerPageHeader
            title="Rastreador de hábitos"
            subtitle="Construa bons hábitos e reduza os ruins"
            actionLabel="Novo hábito"
            onAction={() => setShowAddHabit(true)}
            actionIcon={<Plus size={18} />}
          />
        </motion.div>

        {/* Overall Stats */}
        {habits.length > 0 && (
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">

              {/* LEFT */}
              <div>
                <h2 className="text-xl font-bold text-ink mb-1">
                  Análise de hábitos
                </h2>
                <p className="text-mute text-sm">
                  A consistência constrói sua identidade
                </p>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-2 gap-4 w-full md:w-auto">

                <div className="bg-surface-card border border-hairline-strong rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-accent-yellow">{habits.length}</p>
                  <p className="text-xs text-mute mt-1">Total de hábitos</p>
                </div>

                <div className="bg-surface-card border border-hairline-strong rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-accent-green">
                    {Math.max(...habits.map(h => h.streak), 0)}
                  </p>
                  <p className="text-xs text-mute mt-1">Maior sequência</p>
                </div>

              </div>

            </div>
          </Card>
        )}

        {/* Construir habitos */}
        <Card className="mb-6 bg-surface-deep border border-hairline-strong">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={24} className="text-accent-green" />
              <h2 className="text-xl font-bold text-ink">
                Construir hábitos ({buildHabits.length})
              </h2>
            </div>

            <span className="text-xs text-accent-green bg-green-500/10 px-3 py-1 rounded-full">
              Zona de crescimento
            </span>
          </div>
          {buildHabits.length > 0 ? (
            <div className="flex flex-col md:grid md:grid-cols-2 gap-3">
              {buildHabits.map((habit, index) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <HabitCard
                    habit={habit}
                    onComplete={handleCompleteHabit}
                    onDelete={() => deleteHabit(habit.id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-mute text-center py-8">Nenhum hábito de construção ainda. Adicione um para começar.</p>
          )}
        </Card>

        {/* Romper habitos */}
        <Card className="mb-6 bg-surface-deep border border-hairline-strong">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown size={24} className="text-accent-red" />
              <h2 className="text-xl font-bold text-ink">
                Romper hábitos ({breakHabits.length})
              </h2>
            </div>

            <span className="text-xs text-accent-red bg-red-500/10 px-3 py-1 rounded-full">
              Zona de disciplina
            </span>
          </div>
          {breakHabits.length > 0 ? (
            <div className="flex flex-col md:grid md:grid-cols-2 gap-3">
              {breakHabits.map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onComplete={handleCompleteHabit}
                  onDelete={() => deleteHabit(habit.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-mute text-center py-8">Nenhum hábito para romper ainda.</p>
          )}
        </Card>



        {habits.length === 0 && (
          <EmptyState
            icon={<Flame size={64} className="animate-pulse" />}
            title="Nenhum hábito ainda."
            description="Comece a construir seu sistema de disciplina"
            actionLabel="Adicionar primeiro hábito"
            onAction={() => setShowAddHabit(true)}
          />
        )}
      </div>

      {/* Add Habit Modal */}
      <Modal isOpen={showAddHabit} onClose={() => setShowAddHabit(false)} title="Criar novo hábito">
        <div className="space-y-4">
          <InputField
            label="Nome do hábito"
            value={newHabit.name}
            onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
            placeholder="Ex.: Exercício Matinal, Ler 30 páginas"
            required
            data-testid="habit-name-input"
          />

          <div>
            <label className="block text-charcoal text-sm font-medium mb-2">Tipo de hábito</label>
            <div className="flex gap-3">
              <button
                onClick={() => setNewHabit({ ...newHabit, type: 'build' })}
                className={`flex-1 py-3 rounded-lg transition-all ${newHabit.type === 'build'
                  ? 'bg-accent-green text-black shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                  : 'bg-surface-elevated text-charcoal border border-hairline-strong'
                  }`}
                data-testid="habit-type-build"
              >
                <TrendingUp size={20} className="inline mr-2" />
                Construir
              </button>
              <button
                onClick={() => setNewHabit({ ...newHabit, type: 'break' })}
                className={`flex-1 py-3 rounded-lg transition-all ${newHabit.type === 'break'
                  ? 'bg-accent-red text-black shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                  : 'bg-surface-elevated text-charcoal border border-hairline-strong'
                  }`}
                data-testid="habit-type-break"
              >
                <TrendingDown size={20} className="inline mr-2" />
                Romper
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Horario inicial"
              type="time"
              value={newHabit.startTime}
              onChange={(e) => setNewHabit({ ...newHabit, startTime: e.target.value })}
              required
              data-testid="habit-start-time"
            />
            <InputField
              label="Horario final"
              type="time"
              value={newHabit.endTime}
              onChange={(e) => setNewHabit({ ...newHabit, endTime: e.target.value })}
              required
              data-testid="habit-end-time"
            />
          </div>

          <div>
            <label className="block text-charcoal text-sm font-medium mb-2">Modo</label>
            <div className="flex gap-3">
              <button
                onClick={() => setNewHabit({ ...newHabit, mode: '21-day' })}
                className={`flex-1 py-3 rounded-lg transition-all ${newHabit.mode === '21-day'
                  ? 'bg-accent-blue text-black'
                  : 'bg-surface-elevated text-charcoal border border-hairline-strong'
                  }`}
                data-testid="habit-mode-21day"
              >
                Desafio de 21 Dias
              </button>
              <button
                onClick={() => setNewHabit({ ...newHabit, mode: 'permanent' })}
                className={`flex-1 py-3 rounded-lg transition-all ${newHabit.mode === 'permanent'
                  ? 'bg-accent-blue text-black'
                  : 'bg-surface-elevated text-charcoal border border-hairline-strong'
                  }`}
                data-testid="habit-mode-permanent"
              >
                Permanente
              </button>
            </div>
          </div>

          <Button variant="primary" onClick={handleAddHabit} className="w-full" data-testid="submit-habit-btn">
            Criar hábito
          </Button>
        </div>
      </Modal>
    </div >
  );
};

export default HabitTracker;
