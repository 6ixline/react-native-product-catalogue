import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { View, ActivityIndicator, Text } from 'react-native';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isInitialized && !isAuthenticated && !isLoading && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, isInitialized]);

  // Reset redirect flag when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      hasRedirected.current = false;
    }
  }, [isAuthenticated]);

  if (!isInitialized || isLoading) {
    return (
      <View 
        style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        <ActivityIndicator size="large" color="#0b55b3" />
        <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 14 }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}