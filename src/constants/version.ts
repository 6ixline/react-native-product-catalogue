import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get version from app.json
export const APP_VERSION = Constants.expoConfig?.version || '1.0.0';

// Get native build numbers (auto-incremented by EAS)
export const BUILD_NUMBER = Platform.select({
  ios: Constants.expoConfig?.ios?.buildNumber || 'Unknown',
  android: Constants.expoConfig?.android?.versionCode?.toString() || 'Unknown',
  default: 'Unknown'
});

// Get project ID from app.json
export const PROJECT_ID = Constants.expoConfig?.extra?.eas?.projectId || 'Unknown';

// Get app name
export const APP_NAME = Constants.expoConfig?.name || 'example';

// Get slug
export const APP_SLUG = Constants.expoConfig?.slug || 'example';

// Helper functions
export const getVersionInfo = () => {
  return {
    version: APP_VERSION,
    buildNumber: BUILD_NUMBER,
    projectId: PROJECT_ID,
    platform: Platform.OS,
    appName: APP_NAME,
    slug: APP_SLUG,
  };
};

export const getVersionString = () => {
  return `${APP_VERSION} (${BUILD_NUMBER})`;
};

// For debugging
export const logVersionInfo = () => {
  const info = getVersionInfo();
  console.log('App Version Info:', info);
  return info;
};