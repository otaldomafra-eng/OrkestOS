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
