import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/apiService';
import { showToast } from '../utils/toastHelper';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState(() => localStorage.getItem('wisemind_token') || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('wisemind_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('wisemind_user', JSON.stringify(user));
    }
  }, [user]);

  const updateUser = async (updates) => {
    try {
      setLoading(true);
      const response = await authAPI.update(updates);

      if (response.success) {
        setUser(prev => ({
          ...prev,
          ...response.user
        }));
        showToast({
          message: response.message || 'Perfil atualizado com sucesso',
          status: 'success'
        });
        return true;
      } else {
        showToast({
          message: response.message || 'Falha ao atualizar perfil',
          status: 'error'
        });
        return false;
      }
    } catch (error) {
      console.error('Erro atualizando user:', error);
      showToast({
        message: error.message || 'Falha ao atualizar perfil',
        status: 'error'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfilePic = async (updates) => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfilePic(updates);

      if (response.success) {
        setUser(prev => ({
          ...prev,
          ...response.user
        }));
        showToast({
          message: 'Foto de perfil atualizada',
          status: 'success'
        });
        return true;
      } else {
        showToast({
          message: response.message || 'Falha ao atualizar foto',
          status: 'error'
        });
        return false;
      }
    } catch (error) {
      console.error('Erro atualizando foto:', error);
      showToast({
        message: error.message || 'Falha ao atualizar foto',
        status: 'error'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('wisemind_token');
    localStorage.removeItem('wisemind_user');
    navigate('/login');
    showToast({
      message: 'Você foi desconectado',
      status: 'success'
    });
  };

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const value = {
    token,
    setToken,
    user,
    setUser,
    loading,
    updateUser,
    updateUserProfilePic,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
