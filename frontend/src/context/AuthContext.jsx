/**
 * AuthContext - Gerenciamento de autenticação e perfil do usuário
 * Responsabilidades:
 * - Token (JWT)
 * - User data (nome, email, bio, avatar)
 * - Loading state
 * - Profile updates
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/apiService';
import { showToast } from '../utils/toastHelper';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Autenticação
  const [token, setToken] = useState('');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('orkestos_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  // Recuperar token ao montar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Persistir user no localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('orkestos_user', JSON.stringify(user));
    }
  }, [user]);

  // Atualizar perfil do usuário (nome, email, bio, etc)
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

  // Atualizar foto de perfil
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

  // Logout
  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('orkestos_user');
    navigate('/login');
    showToast({
      message: 'Você foi desconectado',
      status: 'success'
    });
  };

  const value = {
    // Estados
    token,
    setToken,
    user,
    setUser,
    loading,
    navigate,
    // Funções
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
