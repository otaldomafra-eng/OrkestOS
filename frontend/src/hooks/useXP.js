import { useContext } from 'react';
import { GamificationContext } from '../context/GamificationContext';

export function useXP() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useXP deve ser usado dentro de GamificationProvider');
  return ctx;
}
