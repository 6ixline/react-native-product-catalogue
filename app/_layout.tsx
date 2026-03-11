import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import  NetInfo from "@react-native-community/netinfo";
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import * as ScreenOrientation from 'expo-screen-orientation';
import { AuthProvider } from '@/components/AuthProvider';
import '../global.css';
import { toastConfig } from '@/config/toastConfig';
import { NoInternet } from '@/components/NoInternet';
import { SecureScreen } from '@/components/SecureScreen';
import { IOSScreenProtection } from '@/components/IOSScreenProtection';
import { CompleteIOSProtection } from '@/components/CompleteIOSProtection';
import { SecureScreenPass } from '@/components/SecureScreenPass';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UpdateManager } from '@/components/UpdateManager';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    async function lockOrientation() {
      try {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
      } catch (error) {
        console.log('Failed to lock orientation:', error);
      }
    }
    
    lockOrientation();

    const unsubscribe = NetInfo.addEventListener(state => {
      const status = state.isConnected !== false;
      setIsConnected(status);
      onlineManager.setOnline(status);
    });

    return () => {
      unsubscribe();
      ScreenOrientation.unlockAsync().catch(() => {});
    };
  }, []);

  if (isConnected === false) {
    return <NoInternet />;
  }
  
  return (
    <SafeAreaProvider>
    <SecureScreen>
      <SecureScreenPass>
      <CompleteIOSProtection>
      <IOSScreenProtection>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#3b82f6',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
                animation: 'simple_push',
              }}
            >
              <Stack.Screen 
                name="index" 
                options={{ 
                  title: 'On Boarding',
                  headerShown: false,
                  animation: 'none',
                }} 
              />
              <Stack.Screen 
                name="login" 
                options={{ 
                  headerShown: false,
                  gestureEnabled: false,
                  animation: 'none',
                }} 
              />
               <Stack.Screen 
                name="forgot-password" 
                options={{ 
                  headerShown: false,
                  gestureEnabled: true,
                  animation: 'simple_push',
                }} 
              />
              <Stack.Screen 
                name="dashboard" 
                options={{ 
                  headerShown: false,
                  gestureEnabled: false,
                  animation: 'simple_push',
                }}
              />
              <Stack.Screen 
                name="search" 
                options={{ 
                  headerShown: false,
                  animation: 'simple_push',
                }}
              />
              <Stack.Screen 
                name="product" 
                options={{ 
                  headerShown: false,
                  animation: 'simple_push',
                }}
              />
              <Stack.Screen 
                name="favorites" 
                options={{ 
                  headerShown: false,
                  animation: 'simple_push',
                }}
              />
              <Stack.Screen 
                name="enquiries" 
                options={{ 
                  headerShown: false,
                  animation: 'simple_push',
                }}
              />
              <Stack.Screen 
                name="enquiry-detail" 
                options={{ 
                  headerShown: false,
                  animation: 'simple_push',
                }}
              />
              <Stack.Screen 
                name="profile" 
                options={{ 
                  title: 'Profile', 
                  headerShown: false,
                  animation: 'simple_push',
                }} 
              />
              <Stack.Screen 
                name="help" 
                options={{ 
                  title: 'Help and Support', 
                  headerShown: false,
                  animation: "simple_push",
                }} 
              />
            </Stack>
            <UpdateManager autoCheck={true} checkInterval={3600000} />
            <Toast config={toastConfig} />
          </AuthProvider>
        </QueryClientProvider>
      </IOSScreenProtection>
      </CompleteIOSProtection>
      </SecureScreenPass>
    </SecureScreen>
    </SafeAreaProvider>
  );
}