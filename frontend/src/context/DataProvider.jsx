import { useState, useEffect, useRef, useCallback } from 'react';
import { goalAPI, projectAPI, taskAPI, habitAPI, notebookAPI, pageAPI } from '../api/apiService';
import { showToast } from '../utils/toastHelper';
import { DataContext } from './DataContext';
import { useAuth } from '../hooks/useAuth';

export const DataProvider = ({ children }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notebooks, setNotebooks] = useState([]);
  const [pages, setPages] = useState([]);

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('orkest_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('orkest_projects');
    return saved ? JSON.parse(saved) : [];
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('orkest_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('orkest_habits');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [goalsRes, projectsRes, tasksRes, habitsRes, notebooksRes] = await Promise.all([
          goalAPI.getAll(),
          projectAPI.getAll(),
          taskAPI.getAll(),
          habitAPI.getAll(),
          notebookAPI.getAll(),
        ]);
        if (goalsRes.success) setGoals(goalsRes.goals.map(g => ({ ...g, id: g._id })));
        if (projectsRes.success) setProjects(projectsRes.projects.map(p => ({ ...p, id: p._id })));
        if (tasksRes.success) setTasks(tasksRes.tasks.map(t => ({ ...t, id: t._id })));
        if (habitsRes.success) setHabits(habitsRes.habits.map(h => ({ ...h, id: h._id })));
        if (notebooksRes.success) setNotebooks(notebooksRes.notebooks.map(n => ({ ...n, id: n._id })));
      } catch (error) {
        console.error('Falha ao carregar dados do backend:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const refetchTasks = async () => {
    try {
      const res = await taskAPI.getAll();
      if (res.success) setTasks(res.tasks.map(t => ({ ...t, id: t._id })));
    } catch (error) {
      console.error('Falha ao recarregar tarefas:', error);
    }
  };

  const refetchHabits = async () => {
    try {
      const res = await habitAPI.getAll();
      if (res.success) setHabits(res.habits.map(h => ({ ...h, id: h._id })));
    } catch (error) {
      console.error('Falha ao recarregar hábitos:', error);
    }
  };

  const addGoal = async (goal) => {
    try {
      const response = await goalAPI.create(goal);
      if (response.success) {
        const newGoal = { ...response.goal, id: response.goal._id };
        setGoals(prev => [...prev, newGoal]);
        showToast({ message: response.message || 'Meta criada com sucesso', status: 'success' });
        return newGoal;
      } else {
        showToast({ message: response.message || 'Falha ao criar meta', status: 'error' });
        return null;
      }
    } catch (error) {
      console.error('Erro criando meta:', error);
      showToast({ message: error.message || 'Falha ao criar meta', status: 'error' });
      return null;
    }
  };

  const updateGoal = async (goalId, updates) => {
    try {
      const response = await goalAPI.update({ goalId, ...updates });
      if (response.success) {
        const updatedGoal = { ...response.goal, id: response.goal._id };
        setGoals(prev => prev.map(g => (g.id === goalId ? updatedGoal : g)));
        showToast({ message: response.message || 'Meta atualizada com sucesso', status: 'success' });
      } else {
        showToast({ message: response.message || 'Falha ao atualizar meta', status: 'error' });
      }
    } catch (error) {
      console.error('Erro atualizando meta:', error);
      showToast({ message: error.message || 'Falha ao atualizar meta', status: 'error' });
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      const response = await goalAPI.delete(goalId);
      if (response.success) {
        setGoals(prev => prev.filter(g => g.id !== goalId));
        showToast({ message: response.message || 'Meta excluída com sucesso', status: 'success' });
      } else {
        showToast({ message: response.message || 'Falha ao excluir meta', status: 'error' });
      }
    } catch (error) {
      console.error('Erro excluindo meta:', error);
      showToast({ message: error.message || 'Falha ao excluir meta', status: 'error' });
    }
  };

  const addProject = async (project) => {
    try {
      const response = await projectAPI.create(project);
      if (response.success) {
        const newProject = { ...response.project, id: response.project._id };
        setProjects(prev => [...prev, newProject]);
        showToast({ message: response.message || 'Projeto criado com sucesso', status: 'success' });
        return newProject;
      } else {
        showToast({ message: response.message || 'Falha ao criar projeto', status: 'error' });
        return null;
      }
    } catch (error) {
      console.error('Erro criando projeto:', error);
      showToast({ message: error.message || 'Falha ao criar projeto', status: 'error' });
      return null;
    }
  };

  const updateProject = async (projectId, updates) => {
    try {
      const response = await projectAPI.update({ projectId, ...updates });
      if (response.success) {
        const updatedProject = { ...response.project, id: response.project._id };
        setProjects(prev => prev.map(p => (p.id === projectId ? updatedProject : p)));
        showToast({ message: response.message || 'Projeto atualizado com sucesso', status: 'success' });
      } else {
        showToast({ message: response.message || 'Falha ao atualizar projeto', status: 'error' });
      }
    } catch (error) {
      console.error('Erro atualizando projeto:', error);
      showToast({ message: error.message || 'Falha ao atualizar projeto', status: 'error' });
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const response = await projectAPI.delete(projectId);
      if (response.success) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        showToast({ message: response.message || 'Projeto excluído com sucesso', status: 'success' });
      } else {
        showToast({ message: response.message || 'Falha ao excluir projeto', status: 'error' });
      }
    } catch (error) {
      console.error('Erro excluindo projeto:', error);
      showToast({ message: error.message || 'Falha ao excluir projeto', status: 'error' });
    }
  };

  const addTask = async (task) => {
    try {
      const response = await taskAPI.create(task);
      if (response.success) {
        const newTask = { ...response.task, id: response.task._id };
        setTasks(prev => [...prev, newTask]);
        showToast({ message: response.message || 'Tarefa criada com sucesso', status: 'success' });
        return newTask;
      } else {
        showToast({ message: response.message || 'Falha ao criar tarefa', status: 'error' });
        return null;
      }
    } catch (error) {
      console.error('Erro criando tarefa:', error);
      showToast({ message: error.message || 'Falha ao criar tarefa', status: 'error' });
      return null;
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const response = await taskAPI.update({ taskId, ...updates });
      if (response.success) {
        const updatedTask = { ...response.task, id: response.task._id };
        setTasks(prev => prev.map(t => (t.id === taskId ? updatedTask : t)));
        showToast({ message: response.message || 'Tarefa atualizada com sucesso', status: 'success' });
      } else {
        showToast({ message: response.message || 'Falha ao atualizar tarefa', status: 'error' });
      }
    } catch (error) {
      console.error('Erro atualizando tarefa:', error);
      showToast({ message: error.message || 'Falha ao atualizar tarefa', status: 'error' });
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await taskAPI.delete(taskId);
      if (response.success) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        showToast({ message: response.message || 'Tarefa excluída com sucesso', status: 'success' });
      } else {
        showToast({ message: response.message || 'Falha ao excluir tarefa', status: 'error' });
      }
    } catch (error) {
      console.error('Erro excluindo tarefa:', error);
      showToast({ message: error.message || 'Falha ao excluir tarefa', status: 'error' });
    }
  };

  const addHabit = async (habit) => {
    try {
      const response = await habitAPI.create(habit);
      if (response.success) {
        const newHabit = { ...response.habit, id: response.habit._id };
        setHabits(prev => [...prev, newHabit]);
        showToast({ message: response.message || 'Hábito criado com sucesso', status: 'success' });
        return newHabit;
      } else {
        showToast({ message: response.message || 'Falha ao criar hábito', status: 'error' });
        return null;
      }
    } catch (error) {
      console.error('Erro criando hábito:', error);
      showToast({ message: error.message || 'Falha ao criar hábito', status: 'error' });
      return null;
    }
  };

  const updateHabit = async (habitId, updates) => {
    try {
      const response = await habitAPI.update({ habitId, ...updates });
      if (response.success) {
        const updatedHabit = { ...response.habit, id: response.habit._id };
        setHabits(prev => prev.map(h => (h.id === habitId ? updatedHabit : h)));
        showToast({ message: response.message || 'Hábito atualizado com sucesso', status: 'success' });
      } else {
        showToast({ message: response.message || 'Falha ao atualizar hábito', status: 'error' });
      }
    } catch (error) {
      console.error('Erro atualizando hábito:', error);
      showToast({ message: error.message || 'Falha ao atualizar hábito', status: 'error' });
    }
  };

  const handleCompleteHabit = async (habitId) => {
    try {
      const response = await habitAPI.complete(habitId);
      if (response.success) {
        const updatedHabit = { ...response.habit, id: response.habit._id };
        setHabits(prev => prev.map(h => (h.id === habitId ? updatedHabit : h)));
        return response;
      } else {
        showToast({ message: response.message || 'Falha ao concluir hábito', status: 'error' });
        return null;
      }
    } catch (error) {
      console.error('Erro concluindo hábito:', error);
      showToast({ message: error.message || 'Falha ao concluir hábito', status: 'error' });
      return null;
    }
  };

  const deleteHabit = async (habitId) => {
    try {
      const response = await habitAPI.delete(habitId);
      if (response.success) {
        setHabits(prev => prev.filter(h => h.id !== habitId));
        showToast({ message: response.message || 'Hábito excluído com sucesso', status: 'success' });
      } else {
        showToast({ message: response.message || 'Falha ao excluir hábito', status: 'error' });
      }
    } catch (error) {
      console.error('Erro excluindo hábito:', error);
      showToast({ message: error.message || 'Falha ao excluir hábito', status: 'error' });
    }
  };

  const createNotebook = async (name) => {
    const res = await notebookAPI.create({ name });
    if (res.success) setNotebooks(prev => [...prev, { ...res.notebook, id: res.notebook._id }]);
  };

  const updateNotebook = async (notebookId, name) => {
    const res = await notebookAPI.update(notebookId, name);
    if (res.success) setNotebooks(prev => prev.map(n => (n.id === notebookId ? { ...n, name } : n)));
  };

  const deleteNotebook = async (notebookId) => {
    const res = await notebookAPI.delete(notebookId);
    if (res.success) setNotebooks(prev => prev.filter(n => n.id !== notebookId));
  };

  const loadPages = async (notebookId) => {
    const res = await pageAPI.getPagesByNotebook(notebookId);
    if (res.success) setPages(res.pages.map(p => ({ ...p, id: p._id })));
  };

  const createPage = async (notebookId) => {
    const res = await pageAPI.create({ notebookId });
    if (res.success) setPages(prev => [...prev, { ...res.page, id: res.page._id }]);
  };

  const updateTimeoutRef = useRef(null);
  const updatePage = (pageId, content) => {
    setPages(prev => prev.map(p => (p.id === pageId ? { ...p, content } : p)));
    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    updateTimeoutRef.current = setTimeout(async () => {
      await pageAPI.update({ pageId, content });
    }, 500);
  };

  const deletePage = async (pageId, notebookId) => {
    const res = await pageAPI.delete(pageId, notebookId);
    if (res.success) setPages(prev => prev.filter(p => p.id !== pageId));
  };

  const calculateGoalProgress = useCallback((goalId) => {
    const goalTasks = tasks.filter(task => task.goalId === goalId);
    if (goalTasks.length === 0) return 0;
    const completedTasks = goalTasks.filter(task => task.completed).length;
    return Math.round((completedTasks / goalTasks.length) * 100);
  }, [tasks]);

  const calculateProjectProgress = useCallback((projectId) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const completedTasks = projectTasks.filter(task => task.completed).length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  }, [tasks]);

  const getTasksByGoal = useCallback((goalId) => tasks.filter(task => task.goalId === goalId), [tasks]);
  const getTasksByProject = useCallback((projectId) => tasks.filter(task => task.projectId === projectId), [tasks]);
  const getProjectsByGoal = useCallback((goalId) => projects.filter(project => project.goalId === goalId), [projects]);
  const getImportantTasks = useCallback(() => tasks.filter(task => !task.completed && task.isImportant), [tasks]);

  const getBehindTasks = useCallback(() => {
    const now = new Date();
    return tasks.filter(task => {
      if (task.completed || !task.deadline) return false;
      const deadline = new Date(task.deadline);
      if (deadline < now) return true;
      if (task.createdAt) {
        const createdAt = new Date(task.createdAt);
        const totalTime = deadline - createdAt;
        const usedTime = now - createdAt;
        return (usedTime / totalTime) >= 0.75;
      }
      return false;
    });
  }, [tasks]);

  const refetchAll = useCallback(async () => {
    await Promise.all([refetchTasks(), refetchHabits()]);
  }, [refetchTasks, refetchHabits]);

  const clearDataOnly = () => {
    setGoals([]);
    setProjects([]);
    setTasks([]);
    setHabits([]);
    setNotebooks([]);
    setPages([]);
  };

  const value = {
    goals,
    projects,
    tasks,
    habits,
    notebooks,
    pages,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    addHabit,
    updateHabit,
    handleCompleteHabit,
    deleteHabit,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    loadPages,
    createPage,
    updatePage,
    deletePage,
    refetchTasks,
    refetchHabits,
    refetchAll,
    calculateGoalProgress,
    calculateProjectProgress,
    getTasksByGoal,
    getTasksByProject,
    getProjectsByGoal,
    getImportantTasks,
    getBehindTasks,
    clearDataOnly,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
