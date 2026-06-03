import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Target, Zap, Brain, Trophy } from 'lucide-react';

const ITEMS = [
  { to: '/dashboard',    Icon: Home,   label: 'Início' },
  { to: '/trackers',     Icon: Target, label: 'Rastreadores' },
  { to: '/focus-room',   Icon: Zap,    label: 'Foco' },
  { to: '/future-twin',  Icon: Brain,  label: 'FutureTwin' },
  { to: '/achievements', Icon: Trophy, label: 'Conquistas' },
];

export default function BottomNav() {
  return (
    <nav
      aria-label="Navegação mobile"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex"
      style={{
        background: 'rgba(5,5,7,0.92)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {ITEMS.map(({ to, Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          aria-label={label}
          className="flex-1 flex flex-col items-center gap-1 pt-2.5 pb-3 outline-none focus-visible:ring-1 focus-visible:ring-white/30 transition-colors"
        >
          {({ isActive }) => (
            <>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, rgba(120,80,255,0.4), rgba(59,158,255,0.25))',
                        boxShadow: '0 0 12px rgba(120,80,255,0.5)',
                        border: '1px solid rgba(120,80,255,0.4)',
                      }
                    : {}
                }
              >
                <Icon
                  size={16}
                  className={`transition-colors ${isActive ? 'text-white' : 'text-white/35'}`}
                />
              </div>
              <span
                className={`text-[10px] font-medium tracking-wide transition-colors ${
                  isActive ? 'text-white' : 'text-white/30'
                }`}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}