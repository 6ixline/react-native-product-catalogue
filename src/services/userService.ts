import api from './api';
import { LoginRequest, LoginResponse, User } from '@/types';
import { useAuthStore } from '@/store/authStore';

export const userService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post('/user/login', {
        email: credentials.email,
        password: credentials.password,
      });

      // Handle nested data structure from API
      const apiData = response.data.data || response.data;
      
      return {
        user: apiData.user,
        token: apiData.token,
        refreshToken: apiData.refreshToken,
        message: response.data.message,
      };
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error ||
        error.message ||
        'Login failed. Please check your credentials.';
      
      throw new Error(errorMessage);
    }
  },

  logout: async (): Promise<void> => {
    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      // Send refresh token in body for Android compatibility
      await api.post('/user/logout', { refreshToken });
    } catch (error) {
      // Still logout locally even if server request fails
      console.error('Logout error:', error);
    }
  },

  refreshToken: async (): Promise<{ token: string }> => {
    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/user/refresh-token', { refreshToken });
      const apiData = response.data.data || response.data;
      
      // Update refresh token if server sends a new one
      if (apiData.refreshToken) {
        useAuthStore.getState().setRefreshToken(apiData.refreshToken);
      }
      
      return { token: apiData.token };
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get('/user/profile');
      const apiData = response.data.data || response.data;
      return apiData.user || apiData;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch user profile'
      );
    }
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await api.put('/user/profile', userData);
      const apiData = response.data.data || response.data;
      return apiData.user || apiData;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to update profile'
      );
    }
  },
};