import { useState, useEffect, useCallback } from 'react';
import { areaAPI } from '../api/apiService';
import { showToast } from '../utils/toastHelper';
import { AreaContext } from './AreaContext';
import { useAuth } from '../hooks/useAuth';

export const AreaProvider = ({ children }) => {
    const { token } = useAuth();
    const [areas, setAreas] = useState([]);
    const [loadingAreas, setLoadingAreas] = useState(true);

    useEffect(() => {
        if (!token) { setLoadingAreas(false); return; }
        (async () => {
            try {
                const res = await areaAPI.getAll();
                if (res.success) setAreas(res.areas.map(a => ({ ...a, id: a._id })));
            } catch (e) {
                console.error('Falha ao carregar áreas:', e);
            } finally {
                setLoadingAreas(false);
            }
        })();
    }, [token]);

    const addArea = async (data) => {
        const res = await areaAPI.create(data);
        if (res.success) {
            setAreas(prev => [...prev, { ...res.area, id: res.area._id }]);
            return res.area;
        }
        showToast({ message: res.message || 'Erro ao criar área', status: 'error' });
        return null;
    };

    const updateArea = async (areaId, data) => {
        const res = await areaAPI.update({ areaId, ...data });
        if (res.success) setAreas(prev => prev.map(a => a.id === areaId ? { ...res.area, id: res.area._id } : a));
        else showToast({ message: res.message || 'Erro ao atualizar área', status: 'error' });
    };

    const deleteArea = async (areaId) => {
        const res = await areaAPI.delete(areaId);
        if (res.success) setAreas(prev => prev.filter(a => a.id !== areaId));
        else showToast({ message: res.message || 'Erro ao excluir área', status: 'error' });
    };

    const getAreaById = useCallback((areaId) => areas.find(a => a.id === areaId || a._id === areaId) || null, [areas]);

    const value = { areas, loadingAreas, addArea, updateArea, deleteArea, getAreaById };

    return <AreaContext.Provider value={value}>{children}</AreaContext.Provider>;
};
