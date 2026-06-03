import React from 'react';
import { NavLink } from 'react-router-dom';

const ITEMS = [
  { to: '/dashboard',  icon: '🏠', label: 'Início' },
  { to: '/focus-room', icon: '⚡', label: 'Foco' },
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