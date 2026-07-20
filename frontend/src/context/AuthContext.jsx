import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      const { data } = await API.post('/auth/register', userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      setUser(data.data);
      toast.success('Registration successful!');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      setUser(data.data);
      toast.success('Welcome back!');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const becomeSeller = async (sellerData) => {
    try {
      const { data } = await API.post('/auth/become-seller', sellerData);
      localStorage.setItem('user', JSON.stringify(data.data));
      setUser(data.data);
      toast.success('Seller application submitted! Awaiting verification.');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply as seller');
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await API.put('/auth/me', profileData);
      localStorage.setItem('user', JSON.stringify(data.data));
      setUser(data.data);
      toast.success('Profile updated!');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    becomeSeller,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;