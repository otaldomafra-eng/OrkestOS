import { useState, useEffect } from 'react';
import Modal from './Modal';
import InputField from './InputField';
import Button from './GradientButton';

const EMPTY_FORM = { title: '', goalId: '', deadline: '', description: '' };

export const AddProjectModal = ({
  isOpen,
  onClose,
  onSubmit,
  goals = [],
  title = 'Novo Projeto',
}) => {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) {
      setForm(EMPTY_FORM);
    }
  }, [isOpen]);

  const handleClose = () => {
    setForm(EMPTY_FORM);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({
      title: form.title.trim(),
      goalId: form.goalId || null,
      deadline: form.deadline,
      description: form.description.trim(),
    });
    setForm(EMPTY_FORM);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Titulo do projeto"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Digite o título do projeto"
          required
        />

        {goals.length > 0 && (
          <div>
            <label className="block text-charcoal text-sm font-medium mb-2">
              Vincular a uma Meta (Opcional)
            </label>
            <select
              value={form.goalId}
              onChange={(e) => setForm({ ...form, goalId: e.target.value })}
              className="w-full bg-surface-elevated text-ink border border-hairline-strong rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-blue"
            >
              <option value="">Sem meta vinculada</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <InputField
          label="Prazo (Opcional)"
          type="date"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
        />

        <div>
          <label className="block text-charcoal text-sm font-medium mb-2">
            Descrição (Opcional)
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descreva seu projeto..."
            className="w-full bg-surface-elevated text-ink border border-hairline-strong rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-blue min-h-[100px] resize-none"
          />
        </div>

        <Button variant="primary" type="submit" className="w-full">
          Criar projeto
        </Button>
      </form>
    </Modal>
  );
};

export default AddProjectModal;
