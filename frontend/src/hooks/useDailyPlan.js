import { useContext } from 'react';
import { DailyPlanContext } from '../context/DailyPlanContext';

export const useDailyPlan = () => {
  const context = useContext(DailyPlanContext);
  if (!context) {
    throw new Error('useDailyPlan must be used within DailyPlanProvider');
  }
  return context;
};
