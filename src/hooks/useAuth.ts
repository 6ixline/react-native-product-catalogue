import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/store/authStore';
import { LoginRequest } from '@/types';

export function useAuth() {
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading,
    setAuth, 
    logout: storeLogout,
    setLoading,
  } = useAuthStore();
  
  const queryClient = useQueryClient();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => userService.login(data),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      try {
        if (!data.user || !data.token) {
          throw new Error('Invalid response from server');
        }
        
        // Set auth state
        setAuth(data.user, data.token, data.refreshToken);
        
        // Pre-populate the profile cache to avoid refetch
        queryClient.setQueryData(['profile'], data.user);
        
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: `Welcome back, ${data.user.name || data.user.email}!`,
          position: 'top',
          visibilityTime: 2000,
        });
        
        // Navigate immediately after state is set
        router.replace('/dashboard');
      } catch (error: any) {
        console.error('Login success handler error:', error);
        Toast.show({
          type: 'error',
          text1: 'Login Error',
          text2: error.message || 'Something went wrong',
          position: 'top',
          visibilityTime: 4000,
        });
      } finally {
        setLoading(false);
      }
    },
    onError: (error: Error) => {
      setLoading(false);
      console.error('Login error:', error.message);
      
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message || 'Invalid credentials. Please try again.',
        position: 'top',
        visibilityTime: 4000,
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: userService.logout,
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      storeLogout();
      queryClient.clear();
      
      Toast.show({
        type: 'success',
        text1: 'Logged Out',
        text2: 'You have been successfully logged out',
        position: 'top',
        visibilityTime: 2000,
      });
      
      router.replace('/login');
    },
    onError: (error) => {
      console.error('Logout error:', error);
      storeLogout();
      queryClient.clear();
      
      Toast.show({
        type: 'info',
        text1: 'Logged Out',
        text2: 'You have been logged out locally',
        position: 'top',
        visibilityTime: 2000,
      });
      
      router.replace('/login');
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  // Fetch user profile with optimized settings
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: userService.getProfile,
    enabled: isAuthenticated && !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
    refetchOnMount: false, // Don't refetch on component mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
  });

  return {
    user,
    token,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    refetchProfile,
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
    profile,
  };
}