import { useEffect, useState, ReactNode } from 'react';
import { Platform, View, Image, StyleSheet, AppState, AppStateStatus } from 'react-native';

const LOGO = require('@/assets/images/logo.png');

interface IOSScreenProtectionProps {
  children: ReactNode;
}

export function IOSScreenProtection({ children }: IOSScreenProtectionProps) {
  const [isProtected, setIsProtected] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Blank screen when app goes to background or inactive
      // This prevents content from showing in app switcher
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        setIsProtected(true);
      } else if (nextAppState === 'active') {
        // Small delay to ensure smooth transition back
        setTimeout(() => setIsProtected(false), 50);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  if (Platform.OS !== 'ios') {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      {isProtected && (
        <View style={styles.protectionOverlay}>
          <Image 
            source={LOGO} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  protectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  logo: {
    width: 200,
    height: 100,
  },
});