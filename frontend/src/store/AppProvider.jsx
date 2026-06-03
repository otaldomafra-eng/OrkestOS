import { taskAPI, dailyPlanAPI } from '../api/apiService';
import { showToast } from '../utils/toastHelper';
import { AppContext } from './AppContext';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { useDailyPlan } from '../hooks/useDailyPlan';

export const AppProvider = ({ children }) => {
  const auth = useAuth();
  const data = useData();
  const dailyPlan = useDailyPlan();

  const toggleTaskCompletion = async (taskId) => {
    try {
      const isInDailyPlan = dailyPlan.dailyPlan.plannedTasks.some(pt => pt.taskId === taskId);
      if (isInDailyPlan) {
        const plannedTask = dailyPlan.dailyPlan.plannedTasks.find(pt => pt.taskId === taskId);
        if (plannedTask) {
          const response = await dailyPlanAPI.toggle(plannedTask.id);
          if (response.success) {
            const updatedPlan = {
              ...response.dailyPlan,
              plannedTasks: response.dailyPlan.plannedTasks.map(pt => ({
                ...pt, id: pt._id, completedAt: pt.completedAt || null
              }))
            };
            dailyPlan.setDailyPlan(updatedPlan);
            const updatedPlannedTask = response.dailyPlan.plannedTasks.find(pt => pt._id === plannedTask.id);
            if (updatedPlannedTask) {
              data.setTasks(data.tasks.map(task =>
                task.id === taskId ? { ...task, completed: updatedPlannedTask.completed } : task
              ));
            }
          }
        }
      } else {
        const response = await taskAPI.toggle(taskId);
        if (response.success) {
          const updatedTask = { ...response.task, id: response.task._id };
          data.setTasks(data.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          ));
        } else {
          showToast({ message: response.message || 'Falha ao atualizar tarefa', status: 'error' });
        }
      }
      dailyPlan.setDailyTasks(dailyPlan.dailyTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ));
    } catch (error) {
      console.error('Erro alternando tarefa:', error);
      showToast({ message: error.message || 'Falha ao atualizar tarefa', status: 'error' });
    }
  };

  const handleCompleteHabit = async (habitId) => {
    const response = await data.handleCompleteHabit(habitId);
    if (response && response.success) {
      const dailyPlanRes = await dailyPlanAPI.getToday();
      if (dailyPlanRes.success) {
        const updatedPlan = {
          ...dailyPlanRes.dailyPlan,
          plannedTasks: dailyPlanRes.dailyPlan.plannedTasks.map(pt => ({
            ...pt, id: pt._id, completedAt: pt.completedAt || null
          }))
        };
        dailyPlan.setDailyPlan(updatedPlan);
      }
      showToast({ message: response.message || 'Hábito concluído com sucesso', status: 'success' });
    } else if (response && !response.success) {
      showToast({ message: response.message || 'Falha ao concluir hábito', status: 'error' });
    }
  };

  const clearAllData = () => {
    data.clearDataOnly();
    dailyPlan.setDailyPlan({
      date: new Date().toISOString().split('T')[0],
      plannedTasks: []
    });
    dailyPlan.setDailyTasks([]);
    dailyPlan.updateScores({ productivity: 0, discipline: 0 });
    auth.setUser(null);
  };

  const value = {
    ...auth,
    ...data,
    ...dailyPlan,
    toggleTaskCompletion,
    handleCompleteHabit,
    clearAllData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
