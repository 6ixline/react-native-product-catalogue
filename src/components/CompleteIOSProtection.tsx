import { useEffect, useState, ReactNode } from 'react';
import { 
  Platform, 
  View, 
  TextInput,
  Image, 
  StyleSheet, 
  AppState, 
  AppStateStatus 
} from 'react-native';

const LOGO = require('@/assets/images/logo.png');

interface CompleteIOSProtectionProps {
  children: ReactNode;
}

export function CompleteIOSProtection({ children }: CompleteIOSProtectionProps) {
  const [isProtected, setIsProtected] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Blank screen when app goes to background or inactive
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        setIsProtected(true);
      } else if (nextAppState === 'active') {
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
    <View style={styles.container}>
      {/* 
        Invisible secure TextInput layer - this is the "password trick"
        iOS will blur/blank this entire layer during screenshots and screen recording
      */}
      <TextInput
        secureTextEntry={true}
        style={styles.secureField}
        editable={false}
        pointerEvents="none"
        value="" 
      />
      
      {/* Actual content - rendered on top but still within secure layer */}
      <View style={styles.content} pointerEvents="box-none">
        {children}
      </View>

      {/* App switcher protection overlay */}
      {isProtected && (
        <View style={styles.protectionOverlay} pointerEvents="none">
          <Image 
            source={LOGO} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  secureField: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    height: '100%',
    width: '100%',
    zIndex: -1,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
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