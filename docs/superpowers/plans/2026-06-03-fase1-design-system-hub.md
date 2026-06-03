# Fase 1 — Design System + Navegação Hub — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o acento laranja pelo neon branco, introduzir efeitos de profundidade (glow, glassmorphism, blobs), trocar o BottomNav de 7 itens por Sidebar desktop + BottomNav de 3 itens, e transformar o Dashboard em um Hub central de módulos.

**Architecture:** Mudanças puramente no frontend (`frontend/src`). Começa pelos tokens CSS globais, propaga para componentes base, e termina na reestruturação do layout e do Dashboard. Nenhuma alteração de backend. A feature flag não existe — as mudanças são progressivas e cada task deixa o app funcionando.

**Tech Stack:** React 19, Vite, Tailwind CSS 4.2, Framer Motion, Lucide React, React Router 7

---

## Mapa de Arquivos

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `frontend/src/App.css` | Modificar | Tokens de cor, remover laranja, adicionar variáveis de glow e blobs |
| `frontend/src/components/GradientButton.jsx` | Modificar | Variantes primary (branco/preto), outline, ghost |
| `frontend/src/components/Card.jsx` | Modificar | Adicionar linha de brilho `::before`, ajustar border |
| `frontend/src/components/ProgressBar.jsx` | Modificar | Cor da barra para branco neon com glow |
| `frontend/src/components/InputField.jsx` | Modificar | Focus ring branco, remover laranja |
| `frontend/src/components/Modal.jsx` | Modificar | Linha de brilho no topo, glassmorphism |
| `frontend/src/components/Sidebar.jsx` | Criar | Navegação lateral desktop com grupos, indicador ativo |
| `frontend/src/components/BottomNav.jsx` | Modificar | Reduzir para 3 itens (Início, Foco, Perfil), novo estilo |
| `frontend/src/layouts/AppLayout.jsx` | Modificar | Grid responsivo: sidebar no desktop, bottom nav no mobile |
| `frontend/src/pages/Dashboard.jsx` | Modificar | Refatorar para Hub central: XP Banner, stats pills, grid de módulos |

---

## Task 1: Atualizar Tokens CSS Globais

**Files:**
- Modify: `frontend/src/App.css`

- [ ] **Step 1: Abrir App.css e localizar o bloco de variáveis**

O bloco começa em `:root {` e contém variáveis como `--canvas`, `--accent-orange`, etc.

- [ ] **Step 2: Substituir o bloco de variáveis completo**

Localizar o bloco `:root { ... }` e substituir por:

```css
:root {
  /* Backgrounds */
  --canvas:         #000000;
  --surface-card:   #0a0a0c;
  --surface-elev:   #101014;
  --surface-deep:   #06060a;

  /* Texto */
  --ink:            #fcfdff;
  --ink-body:       rgba(252, 253, 255, 0.86);
  --ink-charcoal:   rgba(252, 253, 255, 0.70);
  --ink-dim:        rgba(255, 255, 255, 0.45);
  --ink-mute:       rgba(255, 255, 255, 0.22);
  --mute:           #a1a4a5;
  --ash:            #888e90;

  /* Bordas */
  --stone:          #464a4d;
  --hairline:       rgba(255, 255, 255, 0.06);
  --hairline-strong:rgba(255, 255, 255, 0.14);
  --border:         rgba(255, 255, 255, 0.07);
  --border-md:      rgba(255, 255, 255, 0.13);

  /* Acento primário — BRANCO (substitui laranja) */
  --primary:        #ffffff;
  --primary-glow:   rgba(255, 255, 255, 0.25);
  --primary-dim:    rgba(255, 255, 255, 0.08);

  /* Semânticas (mantidas) */
  --accent-green:   #11ff99;
  --accent-blue:    #3b9eff;
  --accent-red:     #ff2047;
  --accent-yellow:  #ffc53d;

  /* Glow helpers */
  --glow-white:     0 0 12px rgba(255,255,255,0.5), 0 0 24px rgba(255,255,255,0.15);
  --glow-green:     0 0 10px rgba(17,255,153,0.5);
  --glow-blue:      0 0 10px rgba(59,158,255,0.5);
  --glow-red:       0 0 10px rgba(255,32,71,0.5);
  --glow-yellow:    0 0 10px rgba(255,197,61,0.5);
}
```

- [ ] **Step 3: Remover todas as referências a `--accent-orange` no arquivo**

Buscar por `--accent-orange` e `#ff801f` no arquivo inteiro e substituir por `var(--primary)` ou `#ffffff` conforme o contexto.

- [ ] **Step 4: Adicionar estilos de blob de luz ambiente ao `body`**

Após os estilos do `body`, adicionar:

```css
/* Blobs de luz ambiente — decorativos, ficam fixos atrás de tudo */
body::before,
body::after {
  content: '';
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}
body::before {
  width: 600px;
  height: 600px;
  background: rgba(255, 255, 255, 0.02);
  top: -200px;
  right: -150px;
  filter: blur(100px);
}
body::after {
  width: 400px;
  height: 400px;
  background: rgba(17, 255, 153, 0.03);
  bottom: -100px;
  left: -100px;
  filter: blur(100px);
}
```

- [ ] **Step 5: Iniciar o servidor de desenvolvimento e verificar visualmente**

```bash
cd frontend && npm run dev
```

Abrir `http://localhost:5173`. O laranja não deve aparecer em nenhum lugar. O fundo deve ter sutis reflexos de luz nos cantos.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/App.css
git commit -m "design: substitui tokens laranja por branco neon, adiciona blobs de luz"
```

---

## Task 2: Atualizar GradientButton

**Files:**
- Modify: `frontend/src/components/GradientButton.jsx`

- [ ] **Step 1: Ler o arquivo atual para entender as variantes existentes**

O arquivo tem variantes como `primary`, `ghost`, `outline`. Identificar onde as cores são definidas.

- [ ] **Step 2: Substituir o conteúdo do componente**

```jsx
// frontend/src/components/GradientButton.jsx
import React from 'react';

const variants = {
  primary: {
    className:
      'bg-white text-black font-semibold hover:opacity-90 active:scale-95',
    style: {
      boxShadow: '0 0 20px rgba(255,255,255,0.2)',
    },
  },
  outline: {
    className:
      'bg-transparent text-white/70 border border-white/20 hover:border-white/40 hover:text-white active:scale-95',
    style: {},
  },
  ghost: {
    className:
      'bg-transparent text-white/45 hover:text-white active:scale-95',
    style: {},
  },
  danger: {
    className:
      'bg-transparent text-[#ff2047] border border-[#ff2047]/30 hover:border-[#ff2047]/60 active:scale-95',
    style: {},
  },
};

export default function GradientButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
}) {
  const v = variants[variant] ?? variants.primary;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        px-4 py-2 rounded-xl text-sm
        transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        ${v.className} ${className}
      `}
      style={v.style}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 3: Verificar visualmente**

Navegar por telas que usam botões (Login, Dashboard, modais de criação). Botão primário deve ser branco com texto preto.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/GradientButton.jsx
git commit -m "design: atualiza GradientButton — primário branco/preto, remove laranja"
```

---

## Task 3: Atualizar Card, ProgressBar, InputField e Modal

**Files:**
- Modify: `frontend/src/components/Card.jsx`
- Modify: `frontend/src/components/ProgressBar.jsx`
- Modify: `frontend/src/components/InputField.jsx`
- Modify: `frontend/src/components/Modal.jsx`

- [ ] **Step 1: Atualizar Card.jsx**

Ler o arquivo atual e substituir o conteúdo por:

```jsx
// frontend/src/components/Card.jsx
import React from 'react';

export default function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-[#0a0a0c] border border-white/[0.07]
        rounded-2xl p-4
        ${onClick ? 'cursor-pointer transition-colors hover:border-white/[0.13]' : ''}
        ${className}
      `}
    >
      {/* Linha de brilho no topo */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
        }}
      />
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Atualizar ProgressBar.jsx**

Ler o arquivo atual e substituir a cor da barra preenchida:

```jsx
// frontend/src/components/ProgressBar.jsx
import React from 'react';

export default function ProgressBar({ value = 0, label, color = 'white', className = '' }) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const barStyles = {
    white: {
      background: 'linear-gradient(90deg, rgba(255,255,255,0.6), #fff)',
      boxShadow: '0 0 10px rgba(255,255,255,0.5)',
    },
    green: {
      background: 'linear-gradient(90deg, rgba(17,255,153,0.6), #11ff99)',
      boxShadow: '0 0 10px rgba(17,255,153,0.5)',
    },
    blue: {
      background: 'linear-gradient(90deg, rgba(59,158,255,0.6), #3b9eff)',
      boxShadow: '0 0 10px rgba(59,158,255,0.5)',
    },
    red: {
      background: 'linear-gradient(90deg, rgba(255,32,71,0.6), #ff2047)',
      boxShadow: '0 0 10px rgba(255,32,71,0.5)',
    },
    yellow: {
      background: 'linear-gradient(90deg, rgba(255,197,61,0.6), #ffc53d)',
      boxShadow: '0 0 10px rgba(255,197,61,0.5)',
    },
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-white/45">{label}</span>
          <span className="text-xs font-semibold text-white/70">{clampedValue}%</span>
        </div>
      )}
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${clampedValue}%`, ...(barStyles[color] ?? barStyles.white) }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Atualizar InputField.jsx — remover laranja do focus ring**

Ler o arquivo. Localizar qualquer `ring-orange`, `border-orange`, `focus:ring-orange` ou cor laranja e substituir por `ring-white/30` e `border-white/30`.

Exemplo do padrão a substituir:
```jsx
// Antes (exemplo):
className="... focus:ring-orange-500 ..."
// Depois:
className="... focus:ring-white/30 ..."
```

- [ ] **Step 4: Atualizar Modal.jsx — adicionar linha de brilho e glassmorphism**

Ler o arquivo. Localizar o container principal do modal (div com `bg-` e `rounded`) e adicionar:
- `relative overflow-hidden` se não tiver
- Após a abertura do container principal, adicionar a linha de brilho:

```jsx
{/* Linha de brilho */}
<div
  className="absolute top-0 left-0 right-0 h-px pointer-events-none"
  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
/>
```

- [ ] **Step 5: Verificar visualmente**

Abrir o app. Criar uma meta ou tarefa para ver o modal. Verificar que barras de progresso têm glow branco e que o modal tem a linha de brilho no topo.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/Card.jsx frontend/src/components/ProgressBar.jsx frontend/src/components/InputField.jsx frontend/src/components/Modal.jsx
git commit -m "design: atualiza Card (brilho topo), ProgressBar (glow neon), InputField e Modal"
```

---

## Task 4: Criar Sidebar Desktop

**Files:**
- Create: `frontend/src/components/Sidebar.jsx`

- [ ] **Step 1: Criar o arquivo**

```jsx
// frontend/src/components/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { to: '/dashboard',   icon: '🏠', label: 'Início' },
      { to: '/trackers',    icon: '🎯', label: 'Rastreadores' },
      { to: '/focus-room',  icon: '⚡', label: 'Sala de Foco' },
      { to: '/future',      icon: '🧠', label: 'FutureTwin AI', dot: true },
    ],
  },
  {
    label: 'Ferramentas',
    items: [
      { to: '/achievements', icon: '🏆', label: 'Conquistas' },
      { to: '/library',      icon: '📚', label: 'Biblioteca' },
      { to: '/integrations', icon: '🔗', label: 'Integrações' },
    ],
  },
  {
    label: 'Em breve',
    items: [
      { to: null, icon: '💰', label: 'Finance', disabled: true },
      { to: null, icon: '🥗', label: 'Diet',    disabled: true },
    ],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside
      className="hidden lg:flex flex-col h-screen sticky top-0 w-[220px] flex-shrink-0"
      style={{
        background: 'rgba(5,5,8,0.85)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <div
        className="px-5 py-6"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="text-sm font-bold tracking-tight text-white"
          style={{ textShadow: '0 0 20px rgba(255,255,255,0.2)' }}
        >
          WiseMindOS
        </div>
        <div className="text-[11px] text-white/25 mt-0.5 tracking-wide">
          Sistema de Produtividade
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <div className="text-[10px] font-semibold text-white/25 uppercase tracking-widest px-2.5 mb-2">
              {group.label}
            </div>
            {group.items.map((item) =>
              item.disabled ? (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-sm text-white/20 cursor-default mb-0.5"
                >
                  <span className="w-5 text-center text-[14px]">{item.icon}</span>
                  {item.label}
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `relative flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-sm mb-0.5 transition-colors ${
                      isActive
                        ? 'bg-white/[0.07] text-white'
                        : 'text-white/45 hover:bg-white/[0.04] hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r"
                          style={{
                            background: '#fff',
                            boxShadow: '0 0 8px rgba(255,255,255,0.7)',
                          }}
                        />
                      )}
                      <span className="w-5 text-center text-[14px]">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {item.dot && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: '#11ff99',
                            boxShadow: '0 0 6px #11ff99',
                          }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              )
            )}
          </div>
        ))}
      </nav>

      {/* Footer com usuário */}
      <div
        className="px-3 py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="flex items-center gap-2.5 p-2.5 rounded-[10px] cursor-pointer hover:bg-white/[0.04] transition-colors"
          onClick={() => navigate('/profile')}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.04))',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 0 16px rgba(255,255,255,0.06)',
            }}
          >
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">
              {user?.name ?? 'Usuário'}
            </div>
            <div className="text-[11px] text-white/30">Nível 7</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); logout(); }}
            className="text-white/25 hover:text-white/60 text-sm transition-colors"
            title="Sair"
          >
            ⇥
          </button>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Verificar que o arquivo foi criado sem erros de sintaxe**

```bash
cd frontend && npx eslint src/components/Sidebar.jsx --max-warnings 0
```

Esperado: sem erros. Se houver erros de lint, corrigi-los antes de continuar.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Sidebar.jsx
git commit -m "feat: cria componente Sidebar para navegação desktop"
```

---

## Task 5: Atualizar BottomNav (mobile — 3 itens)

**Files:**
- Modify: `frontend/src/components/BottomNav.jsx`

- [ ] **Step 1: Ler o arquivo atual para mapear os 7 itens existentes**

- [ ] **Step 2: Substituir o conteúdo do componente**

```jsx
// frontend/src/components/BottomNav.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const ITEMS = [
  { to: '/dashboard',  icon: '🏠', label: 'Início'  },
  { to: '/focus-room', icon: '⚡', label: 'Foco'    },
  { to: '/trackers',   icon: '🎯', label: 'Rastreadores' },
];

export default function BottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex"
      style={{
        background: 'rgba(5,5,7,0.92)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className="flex-1 flex flex-col items-center gap-1 pt-2.5 pb-3 transition-colors"
        >
          {({ isActive }) => (
            <>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-base transition-all"
                style={
                  isActive
                    ? {
                        background: '#fff',
                        boxShadow: '0 0 14px rgba(255,255,255,0.5)',
                        filter: 'invert(0)',
                      }
                    : {}
                }
              >
                <span style={isActive ? { filter: 'invert(1)' } : {}}>{item.icon}</span>
              </div>
              <span
                className={`text-[10px] font-medium tracking-wide transition-colors ${
                  isActive ? 'text-white' : 'text-white/30'
                }`}
              >
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
```

- [ ] **Step 3: Verificar no browser em viewport mobile (<1024px)**

Redimensionar o navegador para menos de 1024px. O BottomNav deve aparecer com 3 itens. Acima de 1024px não deve aparecer (a Sidebar substituirá).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/BottomNav.jsx
git commit -m "design: simplifica BottomNav para 3 itens no mobile"
```

---

## Task 6: Atualizar AppLayout (grid responsivo com Sidebar)

**Files:**
- Modify: `frontend/src/layouts/AppLayout.jsx`

- [ ] **Step 1: Ler o arquivo atual para entender a estrutura existente**

- [ ] **Step 2: Substituir o conteúdo do layout**

```jsx
// frontend/src/layouts/AppLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar — visível apenas em lg+ */}
      <Sidebar />

      {/* Conteúdo principal */}
      <main className="flex-1 min-w-0 pb-20 lg:pb-0 overflow-y-auto">
        <Outlet />
      </main>

      {/* BottomNav — visível apenas abaixo de lg */}
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 3: Verificar em desktop e mobile**

Desktop (>1024px): sidebar à esquerda, conteúdo à direita. Mobile: sem sidebar, BottomNav fixo embaixo.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/layouts/AppLayout.jsx
git commit -m "feat: AppLayout responsivo — sidebar no desktop, bottom nav no mobile"
```

---

## Task 7: Refatorar Dashboard em Hub Central

**Files:**
- Modify: `frontend/src/pages/Dashboard.jsx`

- [ ] **Step 1: Ler o arquivo atual para identificar o que manter**

O Dashboard atual tem: stats cards, heatmap semanal, gráfico de barras, lista de tarefas, metas e hábitos. Vamos manter os dados mas reorganizar o layout.

- [ ] **Step 2: Verificar nomes de variáveis existentes no Dashboard**

Antes de escrever código, ler o arquivo e anotar os nomes exatos das variáveis:
- Qual variável guarda o % de produtividade? (ex: `productivityScore`, `score`, `productivity`)
- Qual array contém as metas? (ex: `goals`, `allGoals`)
- Qual array tem as tarefas de hoje? (ex: `todayTasks`, `dailyTasks`)
- Qual variável representa o streak atual? (ex: `longestStreak`, `currentStreak`)

Adaptar os Steps 3 e 4 abaixo para usar os nomes reais encontrados.

- [ ] **Step 3: Garantir que `useNavigate` está importado**

No topo do arquivo, certificar que existe:

```jsx
import { useNavigate } from 'react-router-dom';
```

E dentro do componente (logo após os outros hooks):

```jsx
const navigate = useNavigate();
```

- [ ] **Step 4: Adicionar o XPBanner como componente inline no topo do Dashboard**

No início do JSX retornado, antes de qualquer grid existente, adicionar:

```jsx
{/* XP Banner */}
<div
  className="relative overflow-hidden rounded-2xl p-5 mb-6"
  style={{
    background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
    border: '1px solid rgba(255,255,255,0.12)',
  }}
>
  {/* Linha de brilho topo */}
  <div
    className="absolute top-0 left-0 right-0 h-px"
    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
  />
  <div className="flex items-center justify-between mb-3">
    <span
      className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
      style={{
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 0 12px rgba(255,255,255,0.08)',
      }}
    >
      NÍVEL 7 — EXECUTOR
    </span>
    <span className="text-xs text-white/40">
      <span className="text-[#11ff99] font-semibold">2.840</span> / 5.000 XP
    </span>
  </div>
  {/* Barra XP */}
  <div className="relative h-1.5 bg-white/[0.06] rounded-full overflow-visible">
    <div
      className="h-full rounded-full"
      style={{
        width: '56%',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.5), #fff)',
        boxShadow: '0 0 12px rgba(255,255,255,0.7)',
      }}
    />
  </div>
  <div className="text-[11px] text-white/25 mt-1.5">568 XP para o próximo nível</div>
</div>
```

- [ ] **Step 5: Adicionar a stats row de 4 pills logo abaixo do XP Banner**

Substituir `productivityScore`, `goals`, `todayTasks`, `longestStreak` pelos nomes reais encontrados no Step 2.

```jsx
{/* Stats pills */}
<div className="grid grid-cols-4 gap-3 mb-6">
  {[
    { val: `${productivityScore ?? 0}%`, label: 'Produtividade', color: '#11ff99' },
    { val: goals?.filter(g => g.status !== 'concluida').length ?? 0, label: 'Metas Ativas', color: '#fff' },
    { val: todayTasks?.length ?? 0, label: 'Tarefas Hoje', color: '#3b9eff' },
    { val: `🔥 ${longestStreak ?? 0}`, label: 'Streak', color: '#ffc53d' },
  ].map(({ val, label, color }) => (
    <div
      key={label}
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{ background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }}
      />
      <div className="text-3xl font-extrabold tracking-tight leading-none mb-1.5" style={{ color }}>
        {val}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-white/25">{label}</div>
    </div>
  ))}
</div>
```

- [ ] **Step 6: Adicionar o grid de módulos**

Logo após as stats pills, e antes dos gráficos existentes:

```jsx
{/* Grid de módulos */}
<div className="mb-8">
  <h2 className="text-xs font-semibold text-white/25 uppercase tracking-widest mb-3">Módulos</h2>
  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
    {[
      { to: '/future',      icon: '🧠', name: 'FutureTwin AI',  sub: '3 insights hoje', badge: 'Novo',    badgeColor: '#11ff99' },
      { to: '/trackers',    icon: '🎯', name: 'Rastreadores',   sub: 'Metas · Hábitos · Projetos' },
      { to: '/achievements',icon: '🏆', name: 'Conquistas',     sub: '12 / 30 desbloqueadas' },
      { to: '/focus-room',  icon: '⚡', name: 'Sala de Foco',   sub: 'Pomodoro · Timer' },
      { to: '/library',     icon: '📚', name: 'Biblioteca',     sub: '8 notas · 2 cadernos' },
      { to: null,           icon: '💰', name: 'Finance',        sub: 'Em breve', disabled: true },
    ].map(({ to, icon, name, sub, badge, badgeColor, disabled }) => (
      <div
        key={name}
        onClick={() => to && navigate(to)}
        className={`relative overflow-hidden rounded-2xl p-4 transition-colors ${
          disabled
            ? 'opacity-40 cursor-default border-dashed'
            : 'cursor-pointer hover:border-white/[0.13]'
        }`}
        style={{
          background: disabled ? 'transparent' : 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
        />
        <div className="text-2xl mb-2.5">{icon}</div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-white">{name}</div>
            <div className="text-[11px] text-white/35 mt-0.5">{sub}</div>
          </div>
          {badge && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: `${badgeColor}18`,
                border: `1px solid ${badgeColor}40`,
                color: badgeColor,
              }}
            >
              {badge}
            </span>
          )}
        </div>
      </div>
    ))}
  </div>
</div>
```

- [ ] **Step 7: Verificar visualmente**

Abrir o Dashboard. Deve aparecer: XP Banner → Stats pills → Grid de módulos → analytics existente abaixo.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/pages/Dashboard.jsx
git commit -m "feat: refatora Dashboard em Hub central — XP banner, stats, grid de módulos"
```

---

## Task 8: Ajustes finais e limpeza

**Files:**
- Modify: `frontend/src/components/StatCard.jsx`
- Modify: `frontend/src/components/GoalCard.jsx`
- Modify: `frontend/src/components/HabitCard.jsx`
- Modify: `frontend/src/components/TaskItem.jsx`

- [ ] **Step 1: Buscar referências ao laranja em todos os componentes**

```bash
cd frontend && grep -r "orange\|ff801f\|accent-orange" src/components/ src/pages/ src/modules/
```

- [ ] **Step 2: Substituir cada ocorrência**

Para cada arquivo listado pelo grep, aplicar as substituições abaixo. Abrir o arquivo, localizar a string e trocar manualmente (ou via busca global no editor):

| Antes | Depois |
|-------|--------|
| `text-orange-400`, `text-orange-500` | `text-white` |
| `bg-orange-500`, `bg-orange-400` | `bg-white` |
| `border-orange-500`, `border-orange-400` | `border-white/30` |
| `#ff801f` | `#ffffff` |
| `var(--accent-orange)` | `var(--primary)` |
| `ring-orange-500` | `ring-white/30` |
| `from-orange-`, `to-orange-` (gradientes) | remover gradiente, usar `bg-white` |

Exemplo prático — se `StatCard.jsx` contém:
```jsx
// Antes:
style={{ color: '#ff801f' }}
// Depois:
style={{ color: '#ffffff' }}
```

- [ ] **Step 3: Rodar o servidor e navegar por todas as telas**

Verificar: `/dashboard`, `/trackers`, `/trackers/goals`, `/trackers/habits`, `/trackers/tasks`, `/focus-room`, `/library`. Nenhum elemento deve ter cor laranja.

- [ ] **Step 4: Verificar responsividade**

Testar em viewport 375px (mobile) e 1280px (desktop). Sidebar deve aparecer no desktop, BottomNav no mobile.

- [ ] **Step 5: Commit final da Fase 1**

```bash
git add -A
git commit -m "design: remove todas as referências ao laranja, finaliza Fase 1 Design System"
```

---

## Verificação End-to-End da Fase 1

- [ ] Nenhum elemento laranja visível em nenhuma tela
- [ ] Dashboard mostra: XP Banner + 4 stats pills + grid de módulos
- [ ] Desktop (>1024px): sidebar lateral com indicador de página ativo
- [ ] Mobile (<1024px): BottomNav com 3 itens (Início, Foco, Rastreadores)
- [ ] Botões primários são brancos com texto preto
- [ ] Cards têm linha de brilho sutil no topo
- [ ] Barras de progresso têm glow neon
- [ ] Blobs de luz visíveis nos cantos do fundo
