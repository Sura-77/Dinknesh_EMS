import { createContext, useContext, useState, useEffect } from 'react';
import { api as mockApi } from '../services/api';
import { useTheme } from './ThemeContext';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const { setTheme } = useTheme();

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(parsedUser);
      if (parsedUser.theme_preference) setTheme(parsedUser.theme_preference);
    }
  }, []);

  const login = async (email, password) => {
    const response = await mockApi.login(email, password);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    if (response.user.theme_preference) setTheme(response.user.theme_preference);
  };

  const register = async (data) => {
    const existingToken = localStorage.getItem('authToken');
    const existingUser = localStorage.getItem('user');
    if (existingToken && existingUser) {
      setToken(existingToken);
      setUser(JSON.parse(existingUser));
      return;
    }
    const response = await mockApi.register(data);
    if (response.token) {
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
  };

  const registerOrganizer = async (data) => {
    const response = await mockApi.registerOrganizer(data);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  };

  const logout = async () => {
    await mockApi.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const updateUser = (userData) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    token,
    setUser,
    setToken,
    login,
    register,
    registerOrganizer,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOrganizer: user?.role === 'organizer',
    isSecurity: user?.role === 'security' || user?.role === 'staff',
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
