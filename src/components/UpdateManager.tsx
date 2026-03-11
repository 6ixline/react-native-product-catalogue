import { useEffect, useState, useRef } from 'react';
import * as Updates from 'expo-updates';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ActivityIndicator,
  Animated,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UpdateManagerProps {
  autoCheck?: boolean;
  checkInterval?: number; // in milliseconds
}

export function UpdateManager({ 
  autoCheck = true, 
  checkInterval = 3600000 // 1 hour default
}: UpdateManagerProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (autoCheck) {
      checkForUpdates();
      
      // Set up periodic checks
      const interval = setInterval(() => {
        checkForUpdates();
      }, checkInterval);

      return () => clearInterval(interval);
    }
  }, [autoCheck, checkInterval]);

  useEffect(() => {
    if (showModal) {
      // Animate modal entrance
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Start pulsing animation for icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [showModal]);

  const checkForUpdates = async () => {
    // Skip in development mode
    if (__DEV__) {
      console.log('Update check skipped in development mode');
      return;
    }

    try {
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        setUpdateAvailable(true);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  const downloadAndApplyUpdate = async () => {
    if (__DEV__) return;

    try {
      setIsUpdating(true);
      setProgress(0);

      // Simulate progress (expo-updates doesn't provide download progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Download the update
      await Updates.fetchUpdateAsync();
      
      clearInterval(progressInterval);
      setProgress(100);

      // Small delay to show 100%
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reload the app to apply the update
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error downloading update:', error);
      setIsUpdating(false);
      setShowModal(false);
      setProgress(0);
    }
  };

  const dismissUpdate = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowModal(false);
      // Check again after the interval
      setTimeout(checkForUpdates, checkInterval);
    });
  };

  if (!updateAvailable || !showModal) {
    return null;
  }

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="none"
      onRequestClose={isUpdating ? undefined : dismissUpdate}
    >
      <Animated.View 
        style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          opacity: fadeAnim 
        }}
        className="justify-center items-center px-6"
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            width: Math.min(SCREEN_WIDTH - 48, 380),
          }}
          className="bg-white rounded-[32px] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <View className="pt-10 pb-8 px-6 items-center bg-blue-600">
            <Animated.View
              style={{ transform: [{ scale: pulseAnim }] }}
              className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-4"
            >
              <View className="w-20 h-20 bg-white rounded-full items-center justify-center">
                <Ionicons name="cloud-download" size={48} color="#0b55b3" />
              </View>
            </Animated.View>

            <Text className="text-white text-2xl font-bold text-center">
              Update Available
            </Text>
          </View>

          {/* Content */}
          <View className="px-6 pt-6 pb-8">
            <Text className="text-center text-gray-600 text-base leading-6 mb-6">
              We've made some improvements! Update now to enjoy the latest features and bug fixes.
            </Text>

            {/* Progress Bar (shown during update) */}
            {isUpdating && (
              <View className="mb-6">
                <View className="bg-gray-100 rounded-full h-2 overflow-hidden">
                  <Animated.View
                    style={{
                      width: `${progress}%`,
                      backgroundColor: '#0b55b3',
                      height: '100%',
                      borderRadius: 9999,
                    }}
                  />
                </View>
                <Text className="text-center text-gray-500 text-sm mt-2">
                  {progress < 100 ? `Downloading... ${progress}%` : 'Installing...'}
                </Text>
              </View>
            )}

            {/* Buttons */}
            <View className="space-y-3 gap-3">
              <TouchableOpacity
                onPress={downloadAndApplyUpdate}
                disabled={isUpdating}
                className={`rounded-2xl py-4 px-6 shadow-lg ${
                  isUpdating ? 'bg-blue-400' : 'bg-blue-600'
                }`}
                activeOpacity={0.8}
                style={{
                  shadowColor: '#0b55b3',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <View className="flex-row items-center justify-center">
                  {isUpdating ? (
                    <>
                      <ActivityIndicator color="white" size="small" />
                      <Text className="text-white font-bold text-base ml-3">
                        Updating...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="download" size={20} color="white" />
                      <Text className="text-white font-bold text-base ml-2">
                        Update Now
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>

              {!isUpdating && (
                <TouchableOpacity
                  onPress={dismissUpdate}
                  className="bg-gray-100 rounded-2xl py-4 px-6"
                  activeOpacity={0.8}
                >
                  <Text className="text-gray-700 font-semibold text-base text-center">
                    Maybe Later
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Version Info */}
            <Text className="text-center text-gray-400 text-xs mt-4">
              This update will install automatically
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// Export a hook for manual update checks
export function useManualUpdate() {
  const [checking, setChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const checkForUpdate = async () => {
    if (__DEV__) {
      console.log('Manual update check skipped in development mode');
      return false;
    }

    setChecking(true);
    try {
      const update = await Updates.checkForUpdateAsync();
      setUpdateAvailable(update.isAvailable);
      return update.isAvailable;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    } finally {
      setChecking(false);
    }
  };

  const applyUpdate = async () => {
    if (__DEV__) return;

    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error applying update:', error);
    }
  };

  return {
    checkForUpdate,
    applyUpdate,
    checking,
    updateAvailable,
  };
}