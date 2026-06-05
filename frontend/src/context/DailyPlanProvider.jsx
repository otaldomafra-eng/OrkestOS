import { useState, useEffect, useCallback, useRef } from 'react';
import { dailyPlanAPI, statsAPI } from '../api/apiService';
import { showToast } from '../utils/toastHelper';
import { DailyPlanContext } from './DailyPlanContext';
import { useData } from '../hooks/useData';

export const DailyPlanProvider = ({ children }) => {
  const { refetchTasks, refetchHabits } = useData();

  const [dailyTasks, setDailyTasks] = useState(() => {
    const saved = localStorage.getItem('orkest_daily_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyPlan, setDailyPlan] = useState(() => {
    const saved = localStorage.getItem('orkest_daily_plan');
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date().toISOString().split('T')[0];
      if (parsed.date !== today) {
        return { date: today, plannedTasks: [] };
      }
      return parsed;
    }
    return {
      date: new Date().toISOString().split('T')[0],
      plannedTasks: []
    };
  });

  const saveStatsTimerRef = useRef(null);

  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem('orkest_scores');
    return saved ? JSON.parse(saved) : { productivity: 0, discipline: 0 };
  });

  useEffect(() => {
    localStorage.setItem('orkest_daily_plan', JSON.stringify(dailyPlan));
  }, [dailyPlan]);

  const setDailyTasksList = (tasksList) => {
    setDailyTasks(tasksList);
  };

  const updateScores = (newScores) => {
    setScores(prev => ({ ...prev, ...newScores }));
  };

  const calculateProductivityScore = useCallback(() => {
    const todayTasks = dailyPlan?.plannedTasks || [];
    if (todayTasks.length === 0) return 0;
    const completed = todayTasks.filter(task => task.completed).length;
    return Math.round((completed / todayTasks.length) * 100);
  }, [dailyPlan]);

  const calculateDisciplineScore = useCallback(() => {
    const tasks = dailyPlan?.plannedTasks || [];
    if (tasks.length === 0) return 0;
    let onTimeConcluido = 0;
    tasks.forEach(task => {
      if (task.completed && task.completedAt) {
        const completedTime = new Date(task.completedAt);
        const completedMinutes = completedTime.getHours() * 60 + completedTime.getMinutes();
        const [eh, em] = task.endTime.split(':').map(Number);
        const endMinutes = eh * 60 + em;
        if (completedMinutes <= endMinutes) onTimeConcluido++;
      }
    });
    return Math.round((onTimeConcluido / tasks.length) * 100);
  }, [dailyPlan]);

  const addToDailyPlan = async (item) => {
    try {
      const response = await dailyPlanAPI.add(item);
      if (response.success) {
        const updatedPlan = {
          ...response.dailyPlan,
          plannedTasks: response.dailyPlan.plannedTasks.map(pt => ({
            ...pt, id: pt._id, completedAt: pt.completedAt || null
          }))
        };
        setDailyPlan(updatedPlan);
        showToast({ message: response.message || 'Adicionado ao plano diário', status: 'success' });
        return updatedPlan.plannedTasks[updatedPlan.plannedTasks.length - 1];
      } else {
        showToast({ message: response.message || 'Falha ao adicionar ao plano diário', status: 'error' });
        return null;
      }
    } catch (error) {
      console.error('Erro adicionando ao plano:', error);
      showToast({ message: error.message || 'Falha ao adicionar ao plano diário', status: 'error' });
      return null;
    }
  };

  const removeFromDailyPlan = async (id) => {
    try {
      const response = await dailyPlanAPI.remove(id);
      if (response.success) {
        const updatedPlan = {
          ...response.dailyPlan,
          plannedTasks: response.dailyPlan.plannedTasks.map(pt => ({
            ...pt, id: pt._id, completedAt: pt.completedAt || null
          }))
        };
        setDailyPlan(updatedPlan);
        showToast({ message: response.message || 'Removido do plano diário', status: 'success' });
      } else {
        showToast({ message: response.message || 'Falha ao remover do plano diário', status: 'error' });
      }
    } catch (error) {
      console.error('Erro removendo do plano:', error);
      showToast({ message: error.message || 'Falha ao remover do plano diário', status: 'error' });
    }
  };

  const createManualDailyTask = async (taskData) => {
    try {
      const manualTaskData = {
        source: 'manual',
        title: taskData.title,
        startTime: taskData.startTime || '09:00',
        endTime: taskData.endTime || '10:00',
        isImportant: taskData.isImportant || false
      };
      const response = await dailyPlanAPI.add(manualTaskData);
      if (response.success) {
        const updatedPlan = {
          ...response.dailyPlan,
          plannedTasks: response.dailyPlan.plannedTasks.map(pt => ({
            ...pt, id: pt._id, completedAt: pt.completedAt || null
          }))
        };
        setDailyPlan(updatedPlan);
        showToast({ message: response.message || 'Tarefa manual adicionada', status: 'success' });
        return updatedPlan.plannedTasks[updatedPlan.plannedTasks.length - 1];
      } else {
        showToast({ message: response.message || 'Falha ao criar tarefa manual', status: 'error' });
        return null;
      }
    } catch (error) {
      console.error('Erro criando tarefa manual:', error);
      showToast({ message: error.message || 'Falha ao criar tarefa manual', status: 'error' });
      return null;
    }
  };

  const toggleDailyPlanTaskCompletion = async (id) => {
    try {
      const response = await dailyPlanAPI.toggle(id);
      if (response.success) {
        const updatedPlan = {
          ...response.dailyPlan,
          plannedTasks: response.dailyPlan.plannedTasks.map(pt => ({
            ...pt, id: pt._id, completedAt: pt.completedAt || null
          }))
        };
        setDailyPlan(updatedPlan);
        const toggledItem = response.dailyPlan.plannedTasks.find(pt => pt._id === id);
        if (!toggledItem) return;
        if (toggledItem.source === 'task' && toggledItem.taskId) {
          await refetchTasks();
        } else if (toggledItem.source === 'habit' && toggledItem.habitId) {
          await refetchHabits();
        }
      } else {
        showToast({ message: response.message || 'Falha ao alternar tarefa', status: 'error' });
      }
    } catch (error) {
      console.error('Erro alternando tarefa do plano:', error);
      showToast({ message: error.message || 'Falha ao alternar tarefa', status: 'error' });
    }
  };

  const updateDailyPlanTask = async (id, updates) => {
    try {
      setDailyPlan(prev => ({
        ...prev,
        plannedTasks: prev.plannedTasks.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      }));
    } catch (error) {
      console.error('Erro atualizando tarefa do plano:', error);
      showToast({ message: error.message || 'Falha ao atualizar tarefa', status: 'error' });
    }
  };

  const clearDailyPlan = async () => {
    try {
      const response = await dailyPlanAPI.clear();
      if (response.success) {
        const today = new Date().toISOString().split('T')[0];
        setDailyPlan({ date: today, plannedTasks: [] });
        showToast({ message: response.message || 'Plano diário limpo', status: 'success' });
      } else {
        showToast({ message: response.message || 'Falha ao limpar plano diário', status: 'error' });
      }
    } catch (error) {
      console.error('Erro limpando plano:', error);
      showToast({ message: error.message || 'Falha ao limpar plano diário', status: 'error' });
    }
  };

  useEffect(() => {
    if (!dailyPlan) return;
    clearTimeout(saveStatsTimerRef.current);
    saveStatsTimerRef.current = setTimeout(async () => {
      try {
        const productivity = calculateProductivityScore();
        const discipline = calculateDisciplineScore();
        await statsAPI.save({ productivity, discipline });
      } catch (error) {
        console.log('Falha ao salvar stats:', error);
      }
    }, 5000);
  }, [dailyPlan, calculateProductivityScore, calculateDisciplineScore]);

  const value = {
    dailyTasks,
    dailyPlan,
    scores,
    setDailyPlan,
    setDailyTasks,
    setDailyTasksList,
    updateScores,
    addToDailyPlan,
    removeFromDailyPlan,
    createManualDailyTask,
    toggleDailyPlanTaskCompletion,
    updateDailyPlanTask,
    clearDailyPlan,
    calculateProductivityScore,
    calculateDisciplineScore,
  };

  return (
    <DailyPlanContext.Provider value={value}>
      {children}
    </DailyPlanContext.Provider>
  );
};
