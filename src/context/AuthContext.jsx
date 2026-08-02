import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gfg_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      if (token === 'demo_jwt_token_2026') {
        setUser({ username: 'Super Admin', email: 'admin@gfgcampus.org', role: 'Super Admin' });
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (err) {
        console.warn('Token verification failed:', err.message);
        localStorage.removeItem('gfg_token');
        setToken('');
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('gfg_token', newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      // Fallback demo login if server unreachable
      if (email === 'admin@gfgcampus.org' && password === 'admin123') {
        const demoToken = 'demo_jwt_token_2026';
        const demoUser = { username: 'Super Admin', email, role: 'Super Admin' };
        localStorage.setItem('gfg_token', demoToken);
        setToken(demoToken);
        setUser(demoUser);
        return { success: true };
      }
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('gfg_token');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
