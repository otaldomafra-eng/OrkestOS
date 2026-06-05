import { useContext } from 'react';
import { GamificationContext } from '../context/GamificationContext';

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification deve ser usado dentro de GamificationProvider');
  return ctx;
}
