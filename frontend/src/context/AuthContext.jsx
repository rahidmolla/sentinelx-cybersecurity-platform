import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sentinelx_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('sentinelx_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      if (token) {
        try {
          const resp = await authApi.getMe();
          setUser(resp.data.user);
          localStorage.setItem('sentinelx_user', JSON.stringify(resp.data.user));
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    }
    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    const resp = await authApi.login({ email, password });
    const { token: newToken, user: newUser } = resp.data;
    localStorage.setItem('sentinelx_token', newToken);
    localStorage.setItem('sentinelx_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async (name, email, password, organization) => {
    const resp = await authApi.register({ name, email, password, organization });
    const { token: newToken, user: newUser } = resp.data;
    localStorage.setItem('sentinelx_token', newToken);
    localStorage.setItem('sentinelx_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('sentinelx_token');
    localStorage.removeItem('sentinelx_user');
    setToken(null);
    setUser(null);
  };

  const quickLogin = async (role = 'admin') => {
    if (role === 'admin') {
      return login('admin@sentinelx.local', 'Admin@123456');
    } else if (role === 'analyst') {
      return login('analyst@sentinelx.local', 'Analyst@123456');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isAnalyst: user?.role === 'analyst' || user?.role === 'admin',
        login,
        register,
        logout,
        quickLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
