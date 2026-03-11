import React, { ReactNode } from 'react';
import { Platform, View, TextInput, StyleSheet } from 'react-native';

interface SecureScreenProps {
  children: ReactNode;
}

export function SecureScreenPass({ children }: SecureScreenProps) {
  if (Platform.OS !== 'ios') {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {/* Invisible secure text field that makes the layer "secure" */}
      <TextInput
        secureTextEntry={true}
        style={styles.secureField}
        editable={false}
        pointerEvents="none"
      />
      {/* Your actual content */}
      <View style={styles.content} pointerEvents="box-none">
        {children}
      </View>
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
    zIndex: -1,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});