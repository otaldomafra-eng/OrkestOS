# FAB Speed Dial — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar um botão de ação flutuante (FAB) global com Speed Dial que permite criar Tarefa, Hábito, Meta ou Projeto de qualquer tela autenticada.

**Architecture:** Um único componente autocontido `FloatingActionButton.jsx` gerencia o estado de abertura do Speed Dial e os 4 modais de criação internamente. Ele é inserido em `AppLayout.jsx` uma única vez, ficando disponível em todas as rotas autenticadas. Reutiliza `Modal.jsx` e `InputField.jsx` existentes, e consome `useData()` para as chamadas de criação.

**Tech Stack:** React 18, framer-motion (já instalado), lucide-react (já instalado), Tailwind CSS com design tokens do projeto (`bg-surface-deep`, `text-ink`, `border-hairline-strong`, etc.)

---

## Arquivos

| Ação | Arquivo |
|------|---------|
| Criar | `frontend/src/components/FloatingActionButton.jsx` |
| Modificar | `frontend/src/layouts/AppLayout.jsx` |

---

### Task 1: Criar `FloatingActionButton.jsx` com Speed Dial

**Files:**
- Create: `frontend/src/components/FloatingActionButton.jsx`

- [ ] **Step 1: Criar o arquivo com estrutura base + Speed Dial**

Crie `frontend/src/components/FloatingActionButton.jsx` com o conteúdo abaixo. Ainda sem os modais — apenas o botão "+" e os 4 sub-botões funcionando:

```jsx
import { useState } from 'react';
import { Plus, CheckSquare, Repeat, Target, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ACTIONS = [
  { key: 'task',    label: 'Nova Tarefa',  Icon: CheckSquare },
  { key: 'habit',   label: 'Novo Hábito',  Icon: Repeat },
  { key: 'goal',    label: 'Nova Meta',    Icon: Target },
  { key: 'project', label: 'Novo Projeto', Icon: Folder },
];

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Speed Dial container */}
      <div className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 z-50 flex flex-col items-end gap-3">

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
              onClick={() => console.log('open modal:', key)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium text-white transition-all outline-none"
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
          className="w-14 h-14 rounded-full flex items-center justify-center outline-none"
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
    </>
  );
}
```

- [ ] **Step 2: Integrar em `AppLayout.jsx`**

Abra `frontend/src/layouts/AppLayout.jsx`. O arquivo atual é:

```jsx
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import XPToastLayer from '../components/XPToast';
import LevelUpModal from '../components/LevelUpModal';
import { useAuth } from '../hooks/useAuth';

const AppLayout = () => {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 lg:pb-0 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
      <XPToastLayer />
      <LevelUpModal />
    </div>
  );
};

export default AppLayout;
```

Substitua pelo seguinte (adiciona import + componente):

```jsx
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import XPToastLayer from '../components/XPToast';
import LevelUpModal from '../components/LevelUpModal';
import FloatingActionButton from '../components/FloatingActionButton';
import { useAuth } from '../hooks/useAuth';

const AppLayout = () => {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 lg:pb-0 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
      <XPToastLayer />
      <LevelUpModal />
      <FloatingActionButton />
    </div>
  );
};

export default AppLayout;
```

- [ ] **Step 3: Verificar visualmente no navegador**

Inicie o frontend (`npm run dev` em `frontend/`) e navegue para qualquer tela autenticada (ex: `/dashboard`).

Verificar:
- Botão "+" roxo/azul aparece no canto inferior direito
- No mobile (< 1024px): botão fica acima da BottomNav
- No desktop: botão fica no canto inferior direito sem sobreposição
- Clicar no "+" → 4 sub-botões sobem com animação stagger
- Ícone "+" rotaciona 45° ao abrir
- Clicar fora (overlay) → fecha tudo
- Clicar num sub-botão → imprime no console (ex: `open modal: task`)

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/FloatingActionButton.jsx frontend/src/layouts/AppLayout.jsx
git commit -m "feat: add global FAB speed dial component"
```

---

### Task 2: Adicionar os 4 modais de criação ao FAB

**Files:**
- Modify: `frontend/src/components/FloatingActionButton.jsx`

- [ ] **Step 1: Substituir o conteúdo completo com modais incluídos**

Substitua todo o conteúdo de `frontend/src/components/FloatingActionButton.jsx` pelo seguinte:

```jsx
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
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Speed Dial container */}
      <div className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 z-50 flex flex-col items-end gap-3">

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
              className="flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium text-white transition-all outline-none"
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
          className="w-14 h-14 rounded-full flex items-center justify-center outline-none"
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
```

- [ ] **Step 2: Verificar os 4 modais no navegador**

Com o servidor rodando, verificar cada ação:

**Nova Tarefa:**
- Clicar no "+" → clicar em "Nova Tarefa"
- Modal abre com campo "Título" e select "Prioridade"
- Preencher título → clicar "Criar Tarefa"
- Toast de sucesso aparece, modal fecha
- Navegar para `/trackers/tasks` → tarefa criada aparece na lista

**Novo Hábito:**
- Clicar no "+" → clicar em "Novo Hábito"
- Modal abre com campo "Nome" e select "Frequência"
- Preencher nome → clicar "Criar Hábito"
- Toast de sucesso aparece, modal fecha
- Navegar para `/trackers/habits` → hábito aparece na lista

**Nova Meta:**
- Clicar no "+" → clicar em "Nova Meta"
- Modal abre com campo "Título" e input de data opcional
- Preencher título → clicar "Criar Meta"
- Toast de sucesso aparece, modal fecha
- Navegar para `/trackers/goals` → meta aparece na lista

**Novo Projeto:**
- Clicar no "+" → clicar em "Novo Projeto"
- Modal abre com campo "Nome" e select de metas (lista as metas ativas)
- Preencher nome → clicar "Criar Projeto"
- Toast de sucesso aparece, modal fecha
- Navegar para `/trackers/projects` → projeto aparece na lista

- [ ] **Step 3: Commit final**

```bash
git add frontend/src/components/FloatingActionButton.jsx
git commit -m "feat: wire creation modals into FAB speed dial"
```
