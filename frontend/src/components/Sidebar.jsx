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