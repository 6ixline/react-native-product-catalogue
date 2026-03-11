const { withAppDelegate, withInfoPlist } = require('@expo/config-plugins');

const withSecureFlagiOS = (config) => {
  config = withAppDelegate(config, (config) => {
    const { modResults } = config;
    let appDelegateContent = modResults.contents;

    // Check if already modified to avoid duplicate additions
    if (appDelegateContent.includes('// SECURITY_OVERLAY_ADDED')) {
      return config;
    }

    // Add UIKit import if not present
    if (!appDelegateContent.includes('#import <UIKit/UIKit.h>')) {
      appDelegateContent = appDelegateContent.replace(
        /#import "AppDelegate.h"/,
        '#import "AppDelegate.h"\n#import <UIKit/UIKit.h>'
      );
    }

    // Add property declaration in the interface
    const interfacePattern = /@interface\s+AppDelegate\s*:\s*\w+\s*<[^>]*>/;
    if (interfacePattern.test(appDelegateContent) && !appDelegateContent.includes('@property (nonatomic, strong) UIView *securityView;')) {
      appDelegateContent = appDelegateContent.replace(
        interfacePattern,
        (match) => `${match}\n@property (nonatomic, strong) UIView *securityView;`
      );
    }

    // Add synthesize in implementation
    const implementationPattern = /@implementation\s+AppDelegate/;
    if (!appDelegateContent.includes('@synthesize securityView')) {
      appDelegateContent = appDelegateContent.replace(
        implementationPattern,
        '@implementation AppDelegate\n@synthesize securityView = _securityView;'
      );
    }

    // Add the security methods with FIXED window access
    const methodsToAdd = `
// SECURITY_OVERLAY_ADDED
- (UIWindow *)getKeyWindow {
  UIWindow *keyWindow = nil;
  
  // iOS 13+ method
  if (@available(iOS 13.0, *)) {
    NSSet<UIScene *> *connectedScenes = [UIApplication sharedApplication].connectedScenes;
    for (UIScene *scene in connectedScenes) {
      if ([scene isKindOfClass:[UIWindowScene class]]) {
        UIWindowScene *windowScene = (UIWindowScene *)scene;
        for (UIWindow *window in windowScene.windows) {
          if (window.isKeyWindow) {
            keyWindow = window;
            break;
          }
        }
      }
      if (keyWindow) break;
    }
  }
  
  // Fallback for older iOS versions (shouldn't be needed but safe)
  if (!keyWindow) {
    keyWindow = [UIApplication sharedApplication].delegate.window;
  }
  
  return keyWindow;
}

- (void)applicationWillResignActive:(UIApplication *)application {
  UIWindow *window = [self getKeyWindow];
  
  if (!self.securityView && window) {
    self.securityView = [[UIView alloc] initWithFrame:window.bounds];
    self.securityView.backgroundColor = [UIColor whiteColor];
    self.securityView.tag = 999999;
  }
  
  if (window && self.securityView) {
    [window addSubview:self.securityView];
    [window bringSubviewToFront:self.securityView];
  }
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
  if (self.securityView) {
    [self.securityView removeFromSuperview];
  }
}
`;

    // Insert before the final @end
    const lines = appDelegateContent.split('\n');
    const lastEndIndex = lines.lastIndexOf('@end');
    if (lastEndIndex !== -1) {
      lines.splice(lastEndIndex, 0, methodsToAdd);
      appDelegateContent = lines.join('\n');
    }

    modResults.contents = appDelegateContent;
    return config;
  });

  config = withInfoPlist(config, (config) => {
    config.modResults.UIViewControllerBasedStatusBarAppearance = false;
    return config;
  });

  return config;
};

module.exports = withSecureFlagiOS;