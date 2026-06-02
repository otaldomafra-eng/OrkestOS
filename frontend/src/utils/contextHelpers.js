/**
 * Funções reutilizáveis para contextos de dados e gerenciamento de estado
 * Reduz duplicação de código CRUD e normalização de dados
 */

import { useState } from 'react';
import { showToast } from './toastHelper';

/**
 * Normaliza item MongoDB para frontend (converte _id → id)
 * @param {Object} item - Item do MongoDB
 * @returns {Object} Item normalizado
 */
export const normalizeItem = (item) => ({
  ...item,
  id: item._id || item.id,
});

/**
 * Normaliza array de items MongoDB
 * @param {Array} items - Array de items do MongoDB
 * @returns {Array} Array de items normalizados
 */
export const normalizeItems = (items = []) =>
  items.map(normalizeItem);

/**
 * Normaliza planned tasks do daily plan
 * @param {Object} plan - Daily plan do MongoDB
 * @returns {Object} Daily plan com planned tasks normalizadas
 */
export const normalizeDailyPlan = (plan) => {
  if (!plan) return null;
  return {
    ...plan,
    plannedTasks: (plan.plannedTasks || []).map(pt => ({
      ...pt,
      id: pt._id || pt.id,
      completedAt: pt.completedAt || null,
    })),
  };
};

/**
 * Hook genérico para operações CRUD assíncronas
 * Reduz duplicação de try-catch, loading, e toast handling
 * @param {Function} apiCall - Função da API (recebe data, retorna { success, message, [entity] })
 * @param {Function} setState - setState para atualizar a lista
 * @param {String} entityName - Nome da entidade (ex: 'meta', 'tarefa')
 * @param {String} action - Ação (ex: 'criar', 'atualizar', 'excluir')
 * @returns {Function} Função assíncrona que faz a chamada e atualiza o estado
 */
export const createAsyncCrudHandler = (apiCall, setState, entityName, action) => {
  return async (data, options = {}) => {
    const {
      onSuccess = null,
      onError = null,
      normalizer = normalizeItem,
      updateFn = null,
    } = options;

    try {
      const response = await apiCall(data);

      if (response.success) {
        const mensagem = options.successMessage || `${entityName} ${action} com sucesso!`;
        showToast({ message: mensagem, status: 'success' });

        // Se updateFn foi fornecido (para update/delete), use-a
        // Senão, assume que é um CREATE e adiciona à lista
        if (updateFn) {
          setState(updateFn);
        } else if (response[entityName.toLowerCase()]) {
          const newItem = normalizer(response[entityName.toLowerCase()]);
          setState(prev => [...prev, newItem]);
        }

        if (onSuccess) onSuccess(response);
        return response;
      } else {
        const msg = response.message || `Falha ao ${action} ${entityName}`;
        showToast({ message: msg, status: 'error' });
        if (onError) onError(response);
        return null;
      }
    } catch (error) {
      const msg = error.message || `Erro ao ${action} ${entityName}. Tente novamente.`;
      showToast({ message: msg, status: 'error' });
      if (onError) onError(error);
      return null;
    }
  };
};

/**
 * Hook genérico para criar operações assíncronas com loading
 * @param {Function} asyncFn - Função assíncrona
 * @returns {Object} { execute, loading, error }
 */
export const useAsync = (asyncFn) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (...args) => {
    setLoading(true);
    setError(null);
    try {
      return await asyncFn(...args);
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
};

/**
 * Cria função update para atualizar item em array
 * Reutilizável para goals, projects, tasks, etc.
 * @param {Array} items - Array atual
 * @param {String} id - ID do item a atualizar
 * @param {Object} updates - Atualizações
 * @returns {Array} Novo array com item atualizado
 */
export const updateItemInArray = (items, id, updates) =>
  items.map(item =>
    (item.id === id || item._id === id)
      ? { ...item, ...updates }
      : item
  );

/**
 * Cria função delete para remover item de array
 * @param {Array} items - Array atual
 * @param {String} id - ID do item a remover
 * @returns {Array} Novo array sem item
 */
export const deleteItemFromArray = (items, id) =>
  items.filter(item => item.id !== id && item._id !== id);

/**
 * Helper para calcular progresso de lista (% de itens completados)
 * Usado para goals, projects, daily plans, etc.
 * @param {Array} items - Array de itens
 * @param {String} completedField - Campo que indica conclusão (padrão: 'completed')
 * @returns {Number} Percentual de conclusão (0-100)
 */
export const calculateProgress = (items = [], completedField = 'completed') => {
  if (items.length === 0) return 0;
  const completed = items.filter(item => item[completedField]).length;
  return Math.round((completed / items.length) * 100);
};

/**
 * Helper para filtrar items pendentes
 * @param {Array} items - Array de itens
 * @param {String} completedField - Campo de conclusão
 * @returns {Array} Items não completados
 */
export const getPendingItems = (items = [], completedField = 'completed') =>
  items.filter(item => !item[completedField]);

/**
 * Helper para filtrar items completados
 * @param {Array} items - Array de itens
 * @param {String} completedField - Campo de conclusão
 * @returns {Array} Items completados
 */
export const getCompletedItems = (items = [], completedField = 'completed') =>
  items.filter(item => item[completedField]);

/**
 * Validador básico para evitar chamadas de API com dados inválidos
 * @param {Object} data - Dados a validar
 * @param {Array} requiredFields - Campos obrigatórios
 * @returns {Boolean|String} true se válido, string com erro senão
 */
export const validateRequiredFields = (data, requiredFields = ['title']) => {
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      return `${field} é obrigatório`;
    }
  }
  return true;
};

/**
 * Helper para serializar datas para API (ISO string)
 * @param {Date|String} date - Data
 * @returns {String} ISO string ou null
 */
export const serializeDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString();
};

/**
 * Helper para deserializar datas da API
 * @param {String} dateString - ISO date string
 * @returns {Date} Date object
 */
export const deserializeDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString);
};
