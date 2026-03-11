import api from './api';

interface OTPResponse {
  message: string;
  expiresIn?: string;
}

interface VerifyOTPResponse {
  message: string;
  resetToken: string;
}

interface ResetPasswordResponse {
  message: string;
}

export const passwordResetService = {
  /**
   * Request OTP for password reset
   * @param email - User's email address
   * @returns Promise with success message
   */
  requestOTP: async (email: string): Promise<OTPResponse> => {
    try {
      const response = await api.post('/user/forgot-password', { email });
      
      // Check if the response is actually successful
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send verification code');
      }
      
      const apiData = response.data.data || response.data;
      
      return {
        message: response.data.message || 'OTP sent successfully',
        expiresIn: apiData.expiresIn,
      };
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error ||
        error.message ||
        'Failed to send verification code';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Verify OTP code
   * @param email - User's email address
   * @param otp - 6-digit OTP code
   * @returns Promise with reset token
   */
  verifyOTP: async (email: string, otp: string): Promise<string> => {
    try {
      const response = await api.post('/user/verify-otp', { 
        email, 
        otp 
      });
      
      const apiData = response.data.data || response.data;
      
      if (!apiData.resetToken) {
        throw new Error('Invalid response from server');
      }
      
      return apiData.resetToken;
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error ||
        error.message ||
        'Invalid verification code';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Reset password with verified token
   * @param email - User's email address
   * @param resetToken - Token received after OTP verification
   * @param newPassword - New password to set
   * @returns Promise with success message
   */
  resetPassword: async (
    email: string,
    resetToken: string,
    newPassword: string
  ): Promise<ResetPasswordResponse> => {
    try {
      const response = await api.post('/user/reset-password', {
        email,
        resetToken,
        newPassword,
      });
      
      return {
        message: response.data.message || 'Password reset successfully',
      };
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error ||
        error.message ||
        'Failed to reset password';
      
      throw new Error(errorMessage);
    }
  },
};