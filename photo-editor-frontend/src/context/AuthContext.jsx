import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = storage.getToken();
      const savedUser = storage.getUser();

      if (token && savedUser) {
        setUser(savedUser);
        setIsAuthenticated(true);
        
        // Verify token is still valid
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data.user);
          storage.setUser(response.data.user);
        } catch (error) {
          // Token invalid, clear storage
          logout();
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      
      storage.setToken(token);
      storage.setUser(user);
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await authAPI.register({ email, password, name });
      const { token, user } = response.data;
      
      storage.setToken(token);
      storage.setUser(user);
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const loginWithGoogle = () => {
    authAPI.googleLogin();
  };

  const logout = () => {
    storage.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};