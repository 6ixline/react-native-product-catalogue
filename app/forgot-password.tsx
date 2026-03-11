import { useState, useRef, useEffect } from 'react';
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
import Toast from 'react-native-toast-message';
import { useForgotPassword } from '@/hooks/useForgotPassword';
import { Ionicons } from '@expo/vector-icons';

type Step = 'email' | 'otp' | 'password';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [countdown, setCountdown] = useState(0);

  const otpInputRefs = useRef<Array<TextInput | null>>([]);

  const {
    requestOTP,
    verifyOTP,
    resetPassword,
    isRequestingOTP,
    isVerifyingOTP,
    isResettingPassword,
  } = useForgotPassword();

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRequestOTP = async () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please enter your email address',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

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

    const success = await requestOTP(email.trim());
    if (success) {
      setStep('otp');
      setCountdown(60); // 60 seconds cooldown
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 300);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: 'Please enter the complete 6-digit code',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    const token = await verifyOTP(email, otpCode);
    if (token) {
      setResetToken(token);
      setStep('password');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please enter a new password',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2: 'Password must be at least 6 characters long',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'Passwords do not match',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    const success = await resetPassword(email, resetToken, newPassword);
    if (success) {
      // Reset all states
      setEmail('');
      setOtp(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setResetToken('');
      setStep('email');
      
      // Navigate to login after a short delay
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    const success = await requestOTP(email);
    if (success) {
      setOtp(['', '', '', '', '', '']);
      setCountdown(60);
      otpInputRefs.current[0]?.focus();
    }
  };

  const renderEmailStep = () => (
    <>
      <View style={{ marginBottom: 24 }}>
        <Text 
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: '#000000',
            marginBottom: 10,
          }}
        >
          Email Address
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
            returnKeyType="done"
            editable={!isRequestingOTP}
            onSubmitEditing={handleRequestOTP}
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

      <Text 
        style={{
          fontSize: 13,
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: 32,
          lineHeight: 20,
        }}
      >
        We'll send a 6-digit verification code to your email
      </Text>

      <TouchableOpacity
        onPress={handleRequestOTP}
        activeOpacity={0.8}
        disabled={isRequestingOTP}
        style={{
          backgroundColor: isRequestingOTP ? '#6b7280' : '#0b55b3',
          height: 52,
          borderRadius: 26,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#0b55b3',
          shadowOpacity: isRequestingOTP ? 0 : 0.25,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 6,
          elevation: isRequestingOTP ? 0 : 5,
        }}
      >
        {isRequestingOTP ? (
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
            Send Verification Code
          </Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderOTPStep = () => (
    <>
      <View style={{ marginBottom: 32 }}>
        <Text 
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: '#000000',
            marginBottom: 10,
            textAlign: 'center',
          }}
        >
          Enter Verification Code
        </Text>
        <Text 
          style={{
            fontSize: 13,
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          We sent a code to {email}
        </Text>

        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between',
          marginBottom: 24,
        }}>
          {otp.map((digit, index) => (
            <View 
              key={index}
              style={{
                width: 48,
                height: 56,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: digit ? '#0b55b3' : '#e5e7eb',
                backgroundColor: '#ffffff',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <TextInput
                ref={(ref) => {
                  otpInputRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(value) => handleOTPChange(index, value)}
                onKeyPress={({ nativeEvent: { key } }) => handleOTPKeyPress(index, key)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!isVerifyingOTP}
                underlineColorAndroid="transparent"
                style={{
                  fontSize: 24,
                  fontWeight: '600',
                  color: '#000000',
                  textAlign: 'center',
                  width: '100%',
                  height: '100%',
                }}
              />
            </View>
          ))}
        </View>

        <View style={{ alignItems: 'center' }}>
          {countdown > 0 ? (
            <Text style={{ fontSize: 13, color: '#6b7280' }}>
              Resend code in {countdown}s
            </Text>
          ) : (
            <TouchableOpacity
              onPress={handleResendOTP}
              activeOpacity={0.7}
              disabled={isRequestingOTP}
            >
              <Text 
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: isRequestingOTP ? '#9ca3af' : '#0b55b3',
                  textDecorationLine: 'underline',
                }}
              >
                Resend Code
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={handleVerifyOTP}
        activeOpacity={0.8}
        disabled={isVerifyingOTP}
        style={{
          backgroundColor: isVerifyingOTP ? '#6b7280' : '#0b55b3',
          height: 52,
          borderRadius: 26,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#0b55b3',
          shadowOpacity: isVerifyingOTP ? 0 : 0.25,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 6,
          elevation: isVerifyingOTP ? 0 : 5,
        }}
      >
        {isVerifyingOTP ? (
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
            Verify Code
          </Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderPasswordStep = () => (
    <>
      <View style={{ marginBottom: 24 }}>
        <Text 
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: '#000000',
            marginBottom: 10,
          }}
        >
          New Password
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
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            editable={!isResettingPassword}
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

      <View style={{ marginBottom: 32 }}>
        <Text 
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: '#000000',
            marginBottom: 10,
          }}
        >
          Confirm Password
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
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            editable={!isResettingPassword}
            onSubmitEditing={handleResetPassword}
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
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{ padding: 4 }}
          >
            <Ionicons 
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
              size={22} 
              color="#6b7280" 
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleResetPassword}
        activeOpacity={0.8}
        disabled={isResettingPassword}
        style={{
          backgroundColor: isResettingPassword ? '#6b7280' : '#0b55b3',
          height: 52,
          borderRadius: 26,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#0b55b3',
          shadowOpacity: isResettingPassword ? 0 : 0.25,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 6,
          elevation: isResettingPassword ? 0 : 5,
        }}
      >
        {isResettingPassword ? (
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
            Reset Password
          </Text>
        )}
      </TouchableOpacity>
    </>
  );

  const getStepTitle = () => {
    switch (step) {
      case 'email':
        return 'Forgot Password';
      case 'otp':
        return 'Verify Code';
      case 'password':
        return 'Create New Password';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'email':
        return 'Enter your email to receive a verification code';
      case 'otp':
        return 'Enter the 6-digit code we sent to your email';
      case 'password':
        return 'Create a strong password for your account';
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
        
        <ImageBackground
          source={require('@/assets/images/bg_pattern.png')}
          style={{ flex: 1 }}
          resizeMode="cover"
          imageStyle={{ 
            transform: [{ scale: 1.4 }],
          }}
        >
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
            {/* Back button */}
            <View style={{ paddingHorizontal: 20 }}>
              <TouchableOpacity
                onPress={() => step === 'email' ? router.back() : setStep(step === 'password' ? 'otp' : 'email')}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOpacity: 0.1,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons name="arrow-back" size={24} color="#000000" />
              </TouchableOpacity>
            </View>

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
                    {/* Header */}
                    <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: 12,
                    }}>
                      <Text 
                        style={{ 
                          fontSize: 24, 
                          fontWeight: '700',
                          color: '#000000',
                          letterSpacing: -0.3,
                        }}
                      >
                        {getStepTitle()}
                      </Text>
                      <Image
                        source={require('@/assets/images/logo.png')}
                        resizeMode="contain"
                        style={{ width: 140, height: 35 }}
                      />
                    </View>

                    <Text 
                      style={{
                        fontSize: 14,
                        color: '#6b7280',
                        marginBottom: 32,
                      }}
                    >
                      {getStepDescription()}
                    </Text>

                    {/* Step indicator */}
                    <View style={{ 
                      flexDirection: 'row', 
                      justifyContent: 'center',
                      marginBottom: 32,
                      gap: 8,
                    }}>
                      {['email', 'otp', 'password'].map((s, index) => (
                        <View
                          key={s}
                          style={{
                            width: 32,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: 
                              s === step ? '#0b55b3' : 
                              index < ['email', 'otp', 'password'].indexOf(step) ? '#0b55b3' : 
                              '#e5e7eb',
                          }}
                        />
                      ))}
                    </View>

                    {/* Render current step */}
                    {step === 'email' && renderEmailStep()}
                    {step === 'otp' && renderOTPStep()}
                    {step === 'password' && renderPasswordStep()}
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