import { useState, useEffect } from 'react';
import Modal from './Modal';
import InputField from './InputField';
import Button from './GradientButton';
import AreaSelector from './AreaSelector';
import { WORKFLOW_TYPES, WORKFLOW_PHASES, ENGINEERING_DISCIPLINES } from '../data/workflowConfig';

const EMPTY_FORM = {
  title: '',
  goalId: '',
  deadline: '',
  description: '',
  areaId: null,
  workflowType: 'generico',
  currentPhase: '',
  disciplines: [],
  stack: '',
  repoUrl: '',
  deployUrl: '',
  contractValue: '',
};

export const AddProjectModal = ({
  isOpen,
  onClose,
  onSubmit,
  goals = [],
  title = 'Novo Projeto',
}) => {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) setForm(EMPTY_FORM);
  }, [isOpen]);

  const phases = WORKFLOW_PHASES[form.workflowType] || [];

  const toggleDiscipline = (d) => {
    setForm(prev => ({
      ...prev,
      disciplines: prev.disciplines.includes(d)
        ? prev.disciplines.filter(x => x !== d)
        : [...prev.disciplines, d],
    }));
  };

  const handleWorkflowChange = (wt) => {
    const newPhases = WORKFLOW_PHASES[wt] || [];
    setForm(prev => ({ ...prev, workflowType: wt, currentPhase: newPhases[0] || '', disciplines: [] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({
      title: form.title.trim(),
      goalId: form.goalId || null,
      deadline: form.deadline,
      description: form.description.trim(),
      areaId: form.areaId,
      workflowType: form.workflowType,
      currentPhase: form.currentPhase,
      disciplines: form.disciplines,
      stack: form.stack ? form.stack.split(',').map(s => s.trim()).filter(Boolean) : [],
      repoUrl: form.repoUrl.trim(),
      deployUrl: form.deployUrl.trim(),
      contractValue: form.contractValue ? Number(form.contractValue) : undefined,
    });
    setForm(EMPTY_FORM);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { setForm(EMPTY_FORM); onClose(); }} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">

        <InputField
          label="Título do projeto"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Digite o título do projeto"
          required
        />

        {/* Tipo de workflow */}
        <div>
          <label className="block text-charcoal text-sm font-medium mb-2">Tipo de projeto</label>
          <div className="flex gap-2 flex-wrap">
            {WORKFLOW_TYPES.map(wt => (
              <button
                key={wt.value}
                type="button"
                onClick={() => handleWorkflowChange(wt.value)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all"
                style={form.workflowType === wt.value
                  ? { background: 'rgba(120,80,255,0.2)', borderColor: '#7850ff', color: '#fff' }
                  : { background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }
                }
              >
                <span>{wt.icon}</span> {wt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fase inicial */}
        {phases.length > 0 && (
          <div>
            <label className="block text-charcoal text-sm font-medium mb-2">Fase inicial</label>
            <select
              value={form.currentPhase}
              onChange={(e) => setForm({ ...form, currentPhase: e.target.value })}
              className="w-full bg-surface-elevated text-ink border border-hairline-strong rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-blue"
            >
              {phases.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        )}

        {/* Disciplinas (engenharia) */}
        {form.workflowType === 'engenharia' && (
          <div>
            <label className="block text-charcoal text-sm font-medium mb-2">Disciplinas envolvidas</label>
            <div className="flex flex-wrap gap-2">
              {ENGINEERING_DISCIPLINES.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDiscipline(d)}
                  className="px-3 py-1.5 rounded-full text-xs border transition-all"
                  style={form.disciplines.includes(d)
                    ? { background: 'rgba(34,197,94,0.15)', borderColor: '#22c55e', color: '#22c55e' }
                    : { background: 'transparent', borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)' }
                  }
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stack (software) */}
        {form.workflowType === 'software' && (
          <>
            <InputField
              label="Stack / Tecnologias (separadas por vírgula)"
              value={form.stack}
              onChange={(e) => setForm({ ...form, stack: e.target.value })}
              placeholder="React, Node.js, MongoDB"
            />
            <InputField
              label="URL do repositório (Opcional)"
              value={form.repoUrl}
              onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
              placeholder="https://github.com/..."
            />
            <InputField
              label="URL de deploy (Opcional)"
              value={form.deployUrl}
              onChange={(e) => setForm({ ...form, deployUrl: e.target.value })}
              placeholder="https://..."
            />
          </>
        )}

        {/* Valor do contrato (engenharia) */}
        {form.workflowType === 'engenharia' && (
          <InputField
            label="Valor do contrato (Opcional)"
            type="number"
            value={form.contractValue}
            onChange={(e) => setForm({ ...form, contractValue: e.target.value })}
            placeholder="0,00"
          />
        )}

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
                <option key={goal.id} value={goal.id}>{goal.title}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-charcoal text-sm font-medium mb-2">Área</label>
          <AreaSelector value={form.areaId} onChange={(id) => setForm({ ...form, areaId: id })} />
        </div>

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
            className="w-full bg-surface-elevated text-ink border border-hairline-strong rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-blue min-h-[80px] resize-none"
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
