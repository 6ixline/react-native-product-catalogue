import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please enter both email and password',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    // email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    login({ email: email.trim(), password });
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView style={{flex: 1}} contentContainerClassName='flex-1'>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      
      <ImageBackground
        source={require('@/assets/images/bg_pattern.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
        imageStyle={{ 
          transform: [{ scale: 1.4 }],
        }}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 20,
              }}
            >
              <View style={{ width: '100%', maxWidth: 600 }}>
                {/* White card container with blue border */}
                <View
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: '#0b55b3',
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: 4 },
                    shadowRadius: 12,
                    elevation: 8,
                    paddingHorizontal: 28,
                    paddingTop: 36,
                    paddingBottom: 40,
                  }}
                >
                  {/* Header row */}
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: 40,
                  }}>
                    <Text 
                      style={{ 
                        fontSize: 28, 
                        fontWeight: '700',
                        color: '#000000',
                        letterSpacing: -0.3,
                      }}
                    >
                      Login
                    </Text>
                    <Image
                      source={require('@/assets/images/logo.png')}
                      resizeMode="contain"
                      style={{ width: 140, height: 35 }}
                    />
                  </View>

                  {/* Email */}
                  <View style={{ marginBottom: 24 }}>
                    <Text 
                      style={{
                        fontSize: 15,
                        fontWeight: '600',
                        color: '#000000',
                        marginBottom: 10,
                      }}
                    >
                      Email
                    </Text>
                    <View 
                      style={{
                        width: '100%',
                        height: 52,
                        borderRadius: 26,
                        borderWidth: 2,
                        borderColor: '#0b55b3',
                        backgroundColor: '#ffffff',
                        paddingHorizontal: 18,
                        justifyContent: 'center',
                      }}
                    >
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="your.email@example.com"
                        placeholderTextColor="#9ca3af"
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        returnKeyType="next"
                        editable={!isLoading}
                        underlineColorAndroid="transparent"
                        style={{
                          fontSize: 15,
                          color: '#000000',
                          padding: 0,
                          margin: 0,
                          height: 52,
                        }}
                      />
                    </View>
                  </View>

                  {/* Password */}
                  <View style={{ marginBottom: 20 }}>
                    <Text 
                      style={{
                        fontSize: 15,
                        fontWeight: '600',
                        color: '#000000',
                        marginBottom: 10,
                      }}
                    >
                      Password
                    </Text>
                    <View 
                      style={{
                        width: '100%',
                        height: 52,
                        borderRadius: 26,
                        borderWidth: 2,
                        borderColor: '#0b55b3',
                        backgroundColor: '#ffffff',
                        paddingHorizontal: 18,
                        justifyContent: 'center',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        placeholderTextColor="#9ca3af"
                        autoCapitalize="none"
                        secureTextEntry={!showPassword}
                        autoCorrect={false}
                        returnKeyType="done"
                        editable={!isLoading}
                        onSubmitEditing={handleLogin}
                        underlineColorAndroid="transparent"
                        style={{
                          flex: 1,
                          fontSize: 15,
                          color: '#000000',
                          padding: 0,
                          margin: 0,
                          height: 52,
                        }}
                      />
                       <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={{ padding: 4 }}
                      >
                        <Ionicons 
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                          size={22} 
                          color="#6b7280" 
                        />
                      </TouchableOpacity>
                    </View>
                   
                  </View>

                  {/* Forgot password */}
                  <TouchableOpacity 
                    style={{ alignItems: 'center', marginBottom: 32, marginTop: 8 }}
                    activeOpacity={0.7}
                    disabled={isLoading}
                    onPress={handleForgotPassword}
                  >
                    <Text 
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: isLoading ? '#9ca3af' : '#000000',
                        textDecorationLine: 'underline',
                      }}
                    >
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>

                  {/* Login button */}
                  <TouchableOpacity
                    onPress={handleLogin}
                    activeOpacity={0.8}
                    disabled={isLoading}
                    style={{
                      backgroundColor: isLoading ? '#6b7280' : '#0b55b3',
                      height: 52,
                      borderRadius: 26,
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: '#0b55b3',
                      shadowOpacity: isLoading ? 0 : 0.25,
                      shadowOffset: { width: 0, height: 3 },
                      shadowRadius: 6,
                      elevation: isLoading ? 0 : 5,
                    }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text
                        style={{
                          color: '#ffffff',
                          fontSize: 16,
                          fontWeight: '600',
                          letterSpacing: 0.3,
                        }}
                      >
                        Login
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
      </ScrollView>
    </View>
  );
}