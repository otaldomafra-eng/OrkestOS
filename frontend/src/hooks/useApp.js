import { useContext } from 'react';
import { AppContext } from '../store/AppContext';

/**
 * Returns the 3 cross-cutting composed functions that coordinate multiple
 * contexts at once. For raw data use useData(), useAuth() or useDailyPlan()
 * directly.
 *
 * @returns {{ toggleTaskCompletion, handleCompleteHabit, clearAllData }}
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
