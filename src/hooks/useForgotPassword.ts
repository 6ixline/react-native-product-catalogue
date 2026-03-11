import { useState } from 'react';
import { passwordResetService } from '@/services/passwordResetService';
import Toast from 'react-native-toast-message';

export function useForgotPassword() {
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const requestOTP = async (email: string): Promise<boolean> => {
    setIsRequestingOTP(true);
    try {
      const result = await passwordResetService.requestOTP(email);
      
      // Check if it's the generic security message (email not found but hidden for security)
      const isSecurityMessage = result.message.toLowerCase().includes('if an account exists');
      
      Toast.show({
        type: 'success',
        text1: isSecurityMessage ? 'Request Sent' : 'Code Sent',
        text2: result.message,
        position: 'top',
        visibilityTime: 4000,
      });
      
      return true;
    } catch (error: any) {
      console.error('Request OTP error:', error);
      
      // Specific error messages
      let errorTitle = 'Failed to Send Code';
      let errorMessage = error.message || 'Please try again';
      
      if (error.message?.includes('No account found')) {
        errorTitle = 'Account Not Found';
        errorMessage = 'No account exists with this email address';
      } else if (error.message?.includes('wait a minute')) {
        errorTitle = 'Too Many Requests';
        errorMessage = error.message;
      }
      
      Toast.show({
        type: 'error',
        text1: errorTitle,
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
      
      return false;
    } finally {
      setIsRequestingOTP(false);
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<string | null> => {
    setIsVerifyingOTP(true);
    try {
      const resetToken = await passwordResetService.verifyOTP(email, otp);
      
      Toast.show({
        type: 'success',
        text1: 'Code Verified',
        text2: 'Please create a new password',
        position: 'top',
        visibilityTime: 3000,
      });
      
      return resetToken;
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      
      // Show specific error messages from the API
      const errorMessage = error.message || 'Invalid verification code';
      
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
      
      return null;
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const resetPassword = async (
    email: string,
    resetToken: string,
    newPassword: string
  ): Promise<boolean> => {
    setIsResettingPassword(true);
    try {
      await passwordResetService.resetPassword(email, resetToken, newPassword);
      
      Toast.show({
        type: 'success',
        text1: 'Password Reset Successful',
        text2: 'You can now login with your new password',
        position: 'top',
        visibilityTime: 4000,
      });
      
      return true;
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Reset Failed',
        text2: error.message || 'Please try again',
        position: 'top',
        visibilityTime: 4000,
      });
      
      return false;
    } finally {
      setIsResettingPassword(false);
    }
  };

  return {
    requestOTP,
    verifyOTP,
    resetPassword,
    isRequestingOTP,
    isVerifyingOTP,
    isResettingPassword,
  };
}