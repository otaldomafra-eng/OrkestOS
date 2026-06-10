import { useState, useEffect } from 'react';
import Modal from './Modal';
import InputField from './InputField';
import Button from './GradientButton';
import AreaSelector from './AreaSelector';

const EMPTY_FORM = { title: '', deadline: '', isImportant: false, areaId: null };

export const AddTaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  title = 'Nova Tarefa',
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
    onSubmit({ title: form.title.trim(), deadline: form.deadline, isImportant: form.isImportant, areaId: form.areaId });
    setForm(EMPTY_FORM);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Titulo da tarefa"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Digite o título da tarefa"
          required
        />

        <InputField
          label="Prazo (Opcional)"
          type="date"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
        />

        <div>
          <label className="block text-charcoal text-sm font-medium mb-2">Área</label>
          <AreaSelector value={form.areaId} onChange={(id) => setForm({ ...form, areaId: id })} />
        </div>

        <div className="flex items-center justify-between bg-surface-card border border-hairline-strong rounded-lg px-4 py-3">
          <label htmlFor="add-task-important" className="text-charcoal text-sm cursor-pointer">
            Marcar como Importante
          </label>
          <input
            type="checkbox"
            id="add-task-important"
            checked={form.isImportant}
            onChange={(e) => setForm({ ...form, isImportant: e.target.checked })}
            className="w-5 h-5 accent-yellow-500 cursor-pointer"
          />
        </div>

        <Button variant="primary" type="submit" className="w-full">
          Adicionar tarefa
        </Button>
      </form>
    </Modal>
  );
};

export default AddTaskModal;
