import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, setCurrentUser, login as loginFn, logout as logoutFn, createUser, initializeData, getUserByEmail } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { email: string; password: string; name: string; department: string; role: 'student' | 'staff' }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeData();
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const loggedInUser = loginFn(email, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const signup = async (data: { email: string; password: string; name: string; department: string; role: 'student' | 'staff' }) => {
    const existingUser = getUserByEmail(data.email);
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const newUser = createUser({
      email: data.email,
      password: data.password,
      name: data.name,
      department: data.department,
      role: data.role,
    });

    setCurrentUser(newUser);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    logoutFn();
    setUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setCurrentUser(updatedUser);
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile }}>
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
