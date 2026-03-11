const { withMainActivity, AndroidConfig, withAndroidManifest } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withSecureFlag = (config) => {
  config = withMainActivity(config, (config) => {
    const { modResults } = config;
    let mainActivityContent = modResults.contents;

    // Add necessary imports
    const importsToAdd = [
      'import android.view.WindowManager;',
      'import android.os.Bundle;',
      'import android.view.Window;'
    ];

    importsToAdd.forEach(importStatement => {
      if (!mainActivityContent.includes(importStatement)) {
        // Add import after package declaration
        mainActivityContent = mainActivityContent.replace(
          /(package\s+[\w.]+;)/,
          `$1\n${importStatement}`
        );
      }
    });

    // Add FLAG_SECURE in onCreate method - MUST be before super.onCreate()
    if (!mainActivityContent.includes('FLAG_SECURE')) {
      // Try to find onCreate method
      const onCreatePattern = /(@Override\s+)?protected\s+void\s+onCreate\s*\(\s*Bundle\s+savedInstanceState\s*\)\s*\{/;
      
      if (onCreatePattern.test(mainActivityContent)) {
        mainActivityContent = mainActivityContent.replace(
          onCreatePattern,
          (match) => {
            return `${match}\n        // Prevent screenshots and screen recording
        Window window = getWindow();
        window.setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );`;
          }
        );
      }
    }

    modResults.contents = mainActivityContent;
    return config;
  });

  config = withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
    
    // Ensure hardware acceleration is enabled
    mainApplication.$['android:hardwareAccelerated'] = 'true';
    
    return config;
  });

  return config;
};

module.exports = withSecureFlag;