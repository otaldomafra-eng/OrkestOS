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
      { to: '/future-twin', icon: '🧠', label: 'FutureTwin AI', dot: true },
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
        background: 'linear-gradient(180deg, rgba(18,10,40,0.97) 0%, rgba(8,6,20,0.97) 100%)',
        borderRight: '1px solid rgba(120,80,255,0.2)',
        backdropFilter: 'blur(20px)',
        boxShadow: 'inset -1px 0 0 rgba(120,80,255,0.08)',
      }}
    >
      {/* Blob de luz roxo no canto superior */}
      <div className="absolute top-0 left-0 w-full h-32 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(120,80,255,0.15), transparent 70%)' }} />

      {/* Logo */}
      <div
        className="px-5 py-6 relative z-10"
        style={{ borderBottom: '1px solid rgba(120,80,255,0.15)' }}
      >
        <div
          className="text-base font-bold tracking-tight text-white"
          style={{ textShadow: '0 0 20px rgba(120,80,255,0.5)' }}
        >
          WiseMindOS
        </div>
        <div className="text-[11px] text-white/50 mt-0.5 tracking-wide">
          Sistema de Produtividade
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto relative z-10">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest px-2.5 mb-2">
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
                    `relative flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-sm mb-0.5 transition-all ${
                      isActive
                        ? 'text-white'
                        : 'text-white/50 hover:text-white'
                    }`
                  }
                  style={({ isActive }) => isActive ? {
                    background: 'linear-gradient(135deg, rgba(120,80,255,0.2), rgba(59,158,255,0.1))',
                    border: '1px solid rgba(120,80,255,0.25)',
                  } : {}}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r"
                          style={{
                            background: 'linear-gradient(180deg, #7850ff, #3b9eff)',
                            boxShadow: '0 0 8px rgba(120,80,255,0.8)',
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
        className="px-3 py-3 relative z-10"
        style={{ borderTop: '1px solid rgba(120,80,255,0.15)' }}
      >
        <div
          className="flex items-center gap-2.5 p-2.5 rounded-[10px] cursor-pointer transition-all hover:bg-white/[0.05]"
          onClick={() => navigate('/profile')}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(120,80,255,0.3), rgba(59,158,255,0.15))',
              border: '1px solid rgba(120,80,255,0.4)',
              boxShadow: '0 0 16px rgba(120,80,255,0.2)',
            }}
          >
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">
              {user?.name ?? 'Usuário'}
            </div>
            <div className="text-[11px] text-white/50">Nível 7</div>
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