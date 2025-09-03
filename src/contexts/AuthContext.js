import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiFetch } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); // 'user', 'provider', 'admin'
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('hodhod_token');
        const storedUser = localStorage.getItem('hodhod_user');
        const storedUserType = localStorage.getItem('hodhod_user_type');

        if (token && storedUser) {
          // In a real app, you would verify the token with your backend
          setUser(JSON.parse(storedUser));
          setUserType(storedUserType);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password, type = 'user') => {
    try {
      setLoading(true);
      // Real API
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: { email, password }
      });
      
      if (response.success) {
        const userData = response.data.user;
        const token = response.data.token;
        
        // Store in localStorage
        localStorage.setItem('hodhod_token', token);
        localStorage.setItem('hodhod_user', JSON.stringify(userData));
        localStorage.setItem('hodhod_user_type', type);
        
        setUser(userData);
        setUserType(type);
        
        toast.success('Login successful!');
        
        // Redirect based on user type
        if ((userData.role || type) === 'admin') {
          navigate('/dashboard/admin');
        } else if ((userData.role || type) === 'provider') {
          navigate('/dashboard/provider');
        } else {
          navigate('/dashboard/user');
        }
        
        return { success: true };
      } else {
        toast.error(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return { success: false, message: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData, type = 'user') => {
    try {
      setLoading(true);
      // Real API
      const endpoint = type === 'provider' ? '/auth/signup/provider' : '/auth/signup/user';
      const response = await apiFetch(endpoint, {
        method: 'POST',
        body: userData,
      });
      
      if (response.success) {
        const newUser = response.data.user || response.data;
        const token = response.data.token || 'pending_verification';
        
        // Store in localStorage
        localStorage.setItem('hodhod_token', token);
        localStorage.setItem('hodhod_user', JSON.stringify(newUser));
        localStorage.setItem('hodhod_user_type', type);
        
        setUser(newUser);
        setUserType(type);
        
        toast.success('Account created successfully!');
        
        // Redirect based on user type
        if ((newUser.role || type) === 'admin') {
          navigate('/dashboard/admin');
        } else if ((newUser.role || type) === 'provider') {
          navigate('/dashboard/provider');
        } else {
          navigate('/dashboard/user');
        }
        
        return { success: true };
      } else {
        toast.error(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Signup error:', error);
      const msg = (error && error.message) ? error.message : 'Registration failed. Please try again.';

      // Dev/demo fallback: simulate account creation on any failure in development
      const isDev = process.env.NODE_ENV !== 'production';
      const allowFallback = isDev;
      if (allowFallback) {
        const newUser = {
          id: Date.now().toString(),
          role: type,
          email: userData.email,
          phone: userData.phone,
          phoneVerified: true,
          lang: userData.preferredLang || 'en',
          profile: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            governorate: userData.governorate || null,
            area: userData.area || null,
            block: userData.block || null,
            street: userData.street || null,
            houseNumber: userData.houseNumber || null,
          },
        };
        const token = 'dev_demo_token';
        localStorage.setItem('hodhod_token', token);
        localStorage.setItem('hodhod_user', JSON.stringify(newUser));
        localStorage.setItem('hodhod_user_type', type);
        setUser(newUser);
        setUserType(type);
        toast.success('Account created (demo mode)');
        if ((newUser.role || type) === 'admin') {
          navigate('/dashboard/admin');
        } else if ((newUser.role || type) === 'provider') {
          navigate('/dashboard/provider');
        } else {
          navigate('/dashboard/user');
        }
        return { success: true };
      }

      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('hodhod_token');
    localStorage.removeItem('hodhod_user');
    localStorage.removeItem('hodhod_user_type');
    
    // Clear state
    setUser(null);
    setUserType(null);
    
    // Redirect to home
    navigate('/');
    
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    setUser(newUserData);
    localStorage.setItem('hodhod_user', JSON.stringify(newUserData));
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('hodhod_token');
  };

  const hasRole = (role) => {
    return userType === role;
  };

  const value = {
    user,
    userType,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Removed mock APIs; using real backend
