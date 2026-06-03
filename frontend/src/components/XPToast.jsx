import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useXP } from '../hooks/useXP';

export default function XPToastLayer() {
  const { xpToasts } = useXP();

  return (
    <div className="fixed bottom-24 right-5 z-[200] flex flex-col-reverse gap-2 pointer-events-none">
      <AnimatePresence>
        {xpToasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold"
            style={{
              background: 'rgba(17,255,153,0.12)',
              border: '1px solid rgba(17,255,153,0.3)',
              color: '#11ff99',
              boxShadow: '0 0 16px rgba(17,255,153,0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span>+{toast.amount} XP</span>
            {toast.reason && (
              <span className="text-xs font-normal text-white/40">{toast.reason}</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
