# FAB Speed Dial — Botão de Ação Flutuante Global

**Data:** 2026-06-04
**Status:** Aprovado

## Visão Geral

Adicionar um Floating Action Button (FAB) global com Speed Dial ao app OrkestOS. O botão aparece em todas as telas autenticadas e permite criar os 4 tipos principais de item (Tarefa, Hábito, Meta, Projeto) sem navegar até o tracker correspondente.

---

## Componente: `FloatingActionButton.jsx`

### Posicionamento

- `position: fixed`
- Mobile (`< lg`): `bottom: 96px, right: 20px` — acima da BottomNav (~80px de altura)
- Desktop (`lg+`): `bottom: 32px, right: 32px`
- `z-index: 50` (mesmo nível que BottomNav, abaixo de modais)

### Botão Principal

- Círculo de 56×56px
- Gradiente: `linear-gradient(135deg, #7850ff, #3b9eff)` (mesmo acento da Sidebar)
- Glow: `box-shadow: 0 0 24px rgba(120,80,255,0.5)`
- Ícone: `Plus` (lucide-react), 24px
- Ao abrir: ícone rotaciona 45° (transformação CSS/framer-motion), formando visualmente um "×"

### Sub-botões (Speed Dial)

Quatro botões que sobem em pilha vertical ao abrir, com stagger de 60ms entre cada:

| Ordem (de baixo p/ cima) | Label | Ícone lucide |
|---|---|---|
| 1 | Nova Tarefa | `CheckSquare` |
| 2 | Novo Hábito | `Repeat` |
| 3 | Nova Meta | `Target` |
| 4 | Novo Projeto | `Folder` |

Cada sub-botão:
- Pill horizontal: label à esquerda + ícone à direita (44px)
- Background: `rgba(18,10,40,0.95)`, `border: 1px solid rgba(120,80,255,0.3)`
- `backdrop-filter: blur(20px)`
- Hover: border sobe para `rgba(120,80,255,0.6)`, leve glow
- Animação de entrada: `y: 16 → 0`, `opacity: 0 → 1` (framer-motion)

### Comportamento

- Clicar no "+" → abre o Speed Dial (estado `isOpen: true`)
- Clicar fora (overlay) → fecha
- Clicar em um sub-botão → fecha o Speed Dial + abre o modal correspondente
- Após confirmar criação no modal → fecha o modal
- Overlay semitransparente (`rgba(0,0,0,0.4)`) cobre a tela quando aberto, não bloqueia scroll

---

## Modais de Criação

Reutiliza o componente `Modal.jsx` já existente. Um estado por tipo de modal (`showTaskModal`, `showHabitModal`, `showGoalModal`, `showProjectModal`) controlado dentro do `FloatingActionButton`.

### Modal: Nova Tarefa

Campos:
- `title` — Input texto, obrigatório
- `priority` — Select: `normal` (padrão) | `importante`

Chama: `addTask({ title, priority, createdFrom: 'fab' })` via `useData()`

### Modal: Novo Hábito

Campos:
- `name` — Input texto, obrigatório
- `frequency` — Select: `daily` (padrão) | `weekly`

Chama: `addHabit({ name, frequency })` via `useData()`

### Modal: Nova Meta

Campos:
- `title` — Input texto, obrigatório
- `deadline` — Input date, opcional

Chama: `addGoal({ title, deadline })` via `useData()`

### Modal: Novo Projeto

Campos:
- `name` — Input texto, obrigatório
- `goalId` — Select com metas existentes, opcional (placeholder: "Sem meta vinculada")

Chama: `addProject({ name, goalId: goalId || null })` via `useData()`

Todos os formulários usam `InputField.jsx` existente para consistência visual.

---

## Integração

Arquivo a modificar: `frontend/src/layouts/AppLayout.jsx`

Adicionar `<FloatingActionButton />` após `<LevelUpModal />`:

```jsx
<FloatingActionButton />
```

O componente é autocontido — gerencia seus próprios estados de abertura e modais internamente.

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---|---|
| `frontend/src/components/FloatingActionButton.jsx` | Criar |
| `frontend/src/layouts/AppLayout.jsx` | Modificar (adicionar o componente) |

---

## Dependências

- `framer-motion` — já instalado no projeto
- `lucide-react` — já instalado
- `useData` hook — já expõe `addTask`, `addHabit`, `addGoal`, `addProject`, `goals`
- `Modal.jsx`, `InputField.jsx` — componentes existentes reutilizados

---

## Fora do Escopo

- Comportamento contextual por rota (menu fixo em todas as telas)
- Criar outros tipos de item (notas, tarefas diárias)
- Edição de itens pelo FAB
