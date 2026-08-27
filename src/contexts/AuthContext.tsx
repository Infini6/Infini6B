import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updated: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('caresync_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const profile = await authApi.getCurrentUser();
          setUser(profile);
        } catch (error) {
          console.error('Session restoration failed:', error);
          authApi.logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for custom API events
    const handleSessionExpired = () => {
      setSessionExpired(true);
      setUser(null);
      setToken(null);
    };

    const handleLogout = () => {
      setUser(null);
      setToken(null);
      setSessionExpired(false);
    };

    window.addEventListener('caresync-session-expired', handleSessionExpired);
    window.addEventListener('caresync-logout', handleLogout);

    return () => {
      window.removeEventListener('caresync-session-expired', handleSessionExpired);
      window.removeEventListener('caresync-logout', handleLogout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setSessionExpired(false);
    try {
      const result = await authApi.login(email, password);
      setToken(result.token);
      setUser(result.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    setLoading(true);
    setSessionExpired(false);
    try {
      const result = await authApi.register(name, email, phone, password);
      setToken(result.token);
      setUser(result.user);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    await authApi.forgotPassword(email);
  };

  const logout = () => {
    authApi.logout();
  };

  const updateUserProfile = (updated: UserProfile) => {
    setUser(updated);
    localStorage.setItem('caresync_user', JSON.stringify(updated));
    // Update inside mockUsers list as well for consistency
    const users = JSON.parse(localStorage.getItem('caresync_users') || '[]');
    const email = updated.email.toLowerCase();
    const updatedUsers = users.map((u: any) => u.email.toLowerCase() === email ? { ...u, profile: updated } : u);
    localStorage.setItem('caresync_users', JSON.stringify(updatedUsers));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        sessionExpired,
        login,
        register,
        forgotPassword,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
