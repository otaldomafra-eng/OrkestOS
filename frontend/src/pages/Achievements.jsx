import React from 'react';
import { useXP } from '../hooks/useXP';
import { ACHIEVEMENTS } from '../data/gamification';

export default function Achievements() {
  const { unlockedAchievements, totalXP, level, levelTitle, levelProgress, nextLevelXP } = useXP();

  const unlocked = unlockedAchievements;
  const total = ACHIEVEMENTS.length;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-extrabold tracking-tight text-white"
          style={{ textShadow: '0 0 30px rgba(255,255,255,0.15)' }}
        >
          Conquistas
        </h1>
        <p className="text-sm text-white/40 mt-1">
          {unlocked.length} de {total} desbloqueadas
        </p>
      </div>

      {/* Perfil de nível */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 mb-8"
        style={{
          background: 'linear-gradient(135deg, rgba(120,80,255,0.25) 0%, rgba(59,158,255,0.15) 50%, rgba(17,255,153,0.08) 100%)',
          border: '1px solid rgba(120,80,255,0.35)',
          boxShadow: '0 0 40px rgba(120,80,255,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(120,80,255,0.8), rgba(59,158,255,0.6), transparent)' }}
        />
        <div className="absolute right-0 top-0 w-48 h-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at right, rgba(120,80,255,0.6), transparent 70%)' }} />

        <div className="flex items-center gap-5 mb-4 relative z-10">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-extrabold flex-shrink-0"
            style={{
              background: `conic-gradient(#7850ff 0% ${levelProgress}%, rgba(255,255,255,0.08) ${levelProgress}% 100%)`,
              padding: '4px',
              boxShadow: '0 0 20px rgba(120,80,255,0.4)',
            }}
          >
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center flex-col">
              <span className="text-xl font-extrabold leading-none text-white">{level}</span>
              <span className="text-[9px] text-white/50 uppercase tracking-wider">Nível</span>
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">{levelTitle}</div>
            <div className="text-sm text-white/60 mt-1">
              <span className="text-[#11ff99] font-bold">{totalXP.toLocaleString('pt-BR')}</span> XP total
            </div>
          </div>
        </div>
        <div className="h-2 rounded-full overflow-hidden relative z-10" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${levelProgress}%`,
              background: 'linear-gradient(90deg, #7850ff, #3b9eff)',
              boxShadow: '0 0 14px rgba(120,80,255,0.8), 0 0 28px rgba(59,158,255,0.4)',
            }}
          />
        </div>
        {nextLevelXP && (
          <div className="text-xs text-white/60 mt-2 relative z-10">
            {(nextLevelXP - totalXP).toLocaleString('pt-BR')} XP para o próximo nível
          </div>
        )}
      </div>

      {/* Grid de conquistas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlocked.includes(ach.id);
          return (
            <div
              key={ach.id}
              className="relative overflow-hidden rounded-2xl p-4 text-center transition-colors"
              style={{
                background: isUnlocked
                  ? 'linear-gradient(135deg, rgba(255,197,61,0.07), rgba(255,197,61,0.02))'
                  : 'rgba(255,255,255,0.02)',
                border: isUnlocked
                  ? '1px solid rgba(255,197,61,0.25)'
                  : '1px solid rgba(255,255,255,0.07)',
                opacity: isUnlocked ? 1 : 0.55,
              }}
            >
              {isUnlocked && (
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,197,61,0.35), transparent)' }}
                />
              )}
              <div className="text-3xl mb-2">{ach.name.split(' ')[0]}</div>
              <div className="text-[12px] font-bold text-white leading-tight">
                {ach.name.split(' ').slice(1).join(' ')}
              </div>
              <div className="text-[10px] text-white/60 mt-1 leading-tight">{ach.desc}</div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
