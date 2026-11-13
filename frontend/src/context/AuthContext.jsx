import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiClient, TOKEN_STORAGE_KEY } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const fetchProfile = useCallback(async () => {
    const activeToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!activeToken) {
      setLoading(false);
      return null;
    }

    try {
      const { data } = await apiClient.get('/auth/profile');
      setUser(data.user);
      return data.user;
    } catch {
      clearSession();
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveSession = (nextToken, nextUser) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  };

  const register = async (payload) => {
    const { data } = await apiClient.post('/auth/register', payload);
    saveSession(data.token, data.user);
    return data;
  };

  const login = async (payload) => {
    const { data } = await apiClient.post('/auth/login', payload);
    saveSession(data.token, data.user);
    return data;
  };

  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user && token),
        register,
        login,
        logout,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  }
  return context;
}
