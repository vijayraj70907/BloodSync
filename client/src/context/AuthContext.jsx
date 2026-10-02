import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateUserState = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/register', formData);
      updateUserState(data);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      updateUserState(data);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/google', payload);
      updateUserState(data);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Google Sign-in failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const getSecurityQuestion = async (email) => {
    try {
      const { data } = await api.post('/auth/forgot-password/question', { email });
      return { success: true, securityQuestion: data.securityQuestion };
    } catch (err) {
      const msg = err.response?.data?.message || 'No security question found for this account';
      return { success: false, message: msg };
    }
  };

  const resetPasswordWithSecurity = async (email, answer, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/forgot-password/reset', { email, answer, newPassword });
      return { success: true, message: data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.put('/donors/profile', formData);
      const mergedUser = { ...user, ...data };
      updateUserState(mergedUser);
      return { success: true, data: mergedUser };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (password) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete('/auth/account', { data: { password } });
      logout();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete account';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      // Merge fresh server data with existing stored user (preserve token)
      const mergedUser = { ...user, ...data };
      updateUserState(mergedUser);
      return { success: true, data: mergedUser };
    } catch (err) {
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        loginWithGoogle,
        getSecurityQuestion,
        resetPasswordWithSecurity,
        updateProfile,
        refreshUser,
        deleteAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);