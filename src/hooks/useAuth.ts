import { useState, useCallback } from 'react';
import { useAuth as useAuthContext } from '../contexts/AuthContext';

interface UseAuthReturn {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: any) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const { login: contextLogin, register: contextRegister, logout: contextLogout, updateProfile: contextUpdateProfile, loading } = useAuthContext();
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      await contextLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
      throw err;
    }
  }, [contextLogin]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      setError(null);
      await contextRegister(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
      throw err;
    }
  }, [contextRegister]);

  const logout = useCallback(() => {
    setError(null);
    contextLogout();
  }, [contextLogout]);

  const updateProfile = useCallback(async (data: any) => {
    try {
      setError(null);
      await contextUpdateProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления профиля');
      throw err;
    }
  }, [contextUpdateProfile]);

  return {
    login,
    register,
    logout,
    updateProfile,
    loading,
    error,
    clearError
  };
};