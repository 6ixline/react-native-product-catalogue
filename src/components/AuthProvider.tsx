import { useEffect, useState } from 'react';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { View, ActivityIndicator } from 'react-native';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for everything to be ready
    if (!isInitialized || !navigationState?.key) return;

    const performInitialNavigation = async () => {
      try {
        // Add a small delay to ensure router is fully mounted
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const currentSegment = segments[0];
        
        // Only navigate if we're not already on the correct screen
        if (isAuthenticated && currentSegment !== 'dashboard') {
          router.replace('/dashboard');
        } else if (!isAuthenticated && ['dashboard', 'search', 'product', 'profile', 'favorites', 'help'].includes(currentSegment)) {
          router.replace('/login');
        }
        
        // Small delay to ensure navigation completes
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsReady(true);
      } catch (error) {
        console.error('Navigation error:', error);
        setIsReady(true); // Still set ready to prevent infinite loading
      }
    };

    if (!isReady) {
      performInitialNavigation();
    }
  }, [isInitialized, navigationState?.key, isReady]);

  // Handle auth state changes AFTER initial setup
  useEffect(() => {
    if (!isReady || !isInitialized || !navigationState?.key) return;

    const currentSegment = segments[0] as string | undefined;
    const isOnboarding = currentSegment === 'index' || !currentSegment;
    const isLogin = currentSegment === 'login';
    const inProtectedRoute = ['dashboard', 'search', 'product', 'profile', 'favorites', 'help'].includes(
      currentSegment || ''
    );

    if (!isAuthenticated && inProtectedRoute) {
      router.replace('/login');
    } else if (isAuthenticated && (isLogin || isOnboarding)) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, segments, isReady, isInitialized, navigationState, router]);

  // Show loading screen until everything is ready
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#0b55b3" />
      </View>
    );
  }

  return <>{children}</>;
}