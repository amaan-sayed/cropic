import React, { createContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: any) => Promise<boolean>;
  signup: (credentials: any) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error when switching modes
  const clearError = () => setError(null);

  // --- MOCK DATABASE (Simulating your Python Backend) ---
  const getUsers = () => JSON.parse(localStorage.getItem('cropic_users') || '[]');
  const saveUsers = (users: any) => localStorage.setItem('cropic_users', JSON.stringify(users));

  const signup = async (credentials: any) => {
    setError(null);
    const users = getUsers();
    
    // Check if user already exists
    if (users.find((u: any) => u.username === credentials.username)) {
      setError("System ID already registered. Please log in.");
      return false;
    }

    // Save new user to our "database"
    users.push(credentials);
    saveUsers(users);
    
    // Auto-login after signup
    setIsAuthenticated(true);
    return true;
  };

  const login = async (credentials: any) => {
    setError(null);
    const users = getUsers();
    
    // Find the user
    const user = users.find((u: any) => u.username === credentials.username);
    
    if (!user) {
      setError("System ID not found. Do you need to create an account?");
      return false;
    }
    
    if (user.password !== credentials.password) {
      setError("Invalid passcode. Access denied.");
      return false;
    }

    // Success!
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, error, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};