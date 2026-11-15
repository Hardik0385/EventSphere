import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginInput, RegisterInput } from '@eventsphere/shared';
import { api, tokenStorage } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get<{ user: User }>('/api/auth/me');
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
        tokenStorage.clear();
      }
    } catch {
      setUser(null);
      tokenStorage.clear();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (input: LoginInput): Promise<User> => {
    const res = await api.post<{ user: User; token: string }>('/api/auth/login', input);
    if (!res.success || !res.data) {
      throw new Error(res.error || 'Failed to log in');
    }
    if (res.data.token) {
      tokenStorage.set(res.data.token);
    }
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (input: RegisterInput): Promise<User> => {
    const res = await api.post<{ user: User; token: string }>('/api/auth/register', input);
    if (!res.success || !res.data) {
      throw new Error(res.error || 'Failed to register account');
    }
    if (res.data.token) {
      tokenStorage.set(res.data.token);
    }
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
