import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useXP } from '../hooks/useXP';

export default function LevelUpModal() {
  const { levelUpQueue, dismissLevelUp } = useXP();
  const current = levelUpQueue[0];

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.level}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={dismissLevelUp}
          />

          <motion.div
            className="relative z-10 text-center px-10 py-10 rounded-3xl max-w-sm w-full"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -10 }}
            transition={{ type: 'spring', damping: 18, stiffness: 300 }}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 0 60px rgba(255,255,255,0.08)',
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px rounded-t-3xl"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}
            />

            <div className="text-5xl mb-4">🎉</div>
            <div className="text-xs font-bold tracking-widest uppercase text-white/40 mb-2">
              Nível alcançado
            </div>
            <div
              className="text-6xl font-extrabold tracking-tight mb-3"
              style={{ textShadow: '0 0 40px rgba(255,255,255,0.4)' }}
            >
              {current.level}
            </div>
            <div className="text-xl font-bold text-white mb-2">{current.title}</div>
            <div className="text-sm text-white/40 mb-8">
              Continue assim para desbloquear o próximo nível!
            </div>
            <button
              onClick={dismissLevelUp}
              className="w-full py-3 rounded-xl text-sm font-bold bg-white text-black"
              style={{ boxShadow: '0 0 20px rgba(255,255,255,0.2)' }}
            >
              Continuar →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
