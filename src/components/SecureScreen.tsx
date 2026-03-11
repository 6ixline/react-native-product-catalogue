import { useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';

interface SecureScreenProps {
  children: ReactNode;
}

export function SecureScreen({ children }: SecureScreenProps) {
  useEffect(() => {
    let isActive = true;

    const activateScreenProtection = async () => {
      if (isActive) {
        try {
          
          await ScreenCapture.preventScreenCaptureAsync();
          
          if (Platform.OS === 'android') {
            console.log('Android: Screenshots and screen recording blocked');
          } else {
            console.log('iOS: Screen recording blocked (screenshots cannot be blocked by Apple policy)');
          }
        } catch (error) {
          console.error('Failed to activate screen protection:', error);
          
          // Retry once after a short delay
          setTimeout(async () => {
            if (isActive) {
              try {
                await ScreenCapture.preventScreenCaptureAsync();
                console.log('Screen protection activated (retry successful)');
              } catch (retryError) {
                console.error('Failed to activate screen protection (retry failed):', retryError);
              }
            }
          }, 500);
        }
      }
    };

    // Activate protection immediately
    activateScreenProtection();

    if (Platform.OS === 'ios') {
    }

    // Cleanup function
    return () => {
      isActive = false;
      ScreenCapture.allowScreenCaptureAsync().catch((error) => {
        console.error('Error during screen protection cleanup:', error);
      });
    };
  }, []);

  return <>{children}</>;
}