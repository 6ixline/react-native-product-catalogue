import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useCreateEnquiry } from '@/hooks/useEnquiries';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;
const MIN_SHEET_HEIGHT = SCREEN_HEIGHT * 0.4;

interface EnquiryBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  productId?: number;
  productName?: string;
  productCode?: string;
}

const EnquiryBottomSheet: React.FC<EnquiryBottomSheetProps> = ({
  visible,
  onClose,
  productId,
  productName,
  productCode,
}) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [subjectError, setSubjectError] = useState('');
  const [messageError, setMessageError] = useState('');

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const { mutate: createEnquiry, isPending: isSubmitting } = useCreateEnquiry();

  // Auto-fill subject if product is provided
  useEffect(() => {
    if (visible && productName && !subject) {
      setSubject(`Enquiry about ${productName}`);
    }
  }, [visible, productName]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setTimeout(() => {
        setSubject('');
        setMessage('');
        setSubjectError('');
        setMessageError('');
      }, 300);
    }
  }, [visible]);

  // Animate sheet in/out
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const validateForm = useCallback((): boolean => {
    let isValid = true;

    // Validate subject
    if (!subject.trim()) {
      setSubjectError('Subject is required');
      isValid = false;
    } else if (subject.trim().length < 5) {
      setSubjectError('Subject must be at least 5 characters');
      isValid = false;
    } else if (subject.trim().length > 255) {
      setSubjectError('Subject cannot exceed 255 characters');
      isValid = false;
    } else {
      setSubjectError('');
    }

    // Validate message
    if (!message.trim()) {
      setMessageError('Message is required');
      isValid = false;
    } else if (message.trim().length < 10) {
      setMessageError('Message must be at least 10 characters');
      isValid = false;
    } else {
      setMessageError('');
    }

    return isValid;
  }, [subject, message]);

  const handleSubmit = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    Keyboard.dismiss();

    const enquiryData = {
      productId: productId || null,
      subject: subject.trim(),
      message: message.trim(),
    };

    createEnquiry(enquiryData, {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'Enquiry Submitted',
          text2: 'We will get back to you soon.',
          position: 'top',
          visibilityTime: 3000,
        });
        
        // Close the sheet after a short delay
        setTimeout(() => {
          onClose();
        }, 500);
      },
      onError: (error: Error) => {
        Toast.show({
          type: 'error',
          text1: 'Submission Failed',
          text2: error.message || 'Failed to submit enquiry',
          position: 'top',
          visibilityTime: 3000,
        });
      },
    });
  }, [subject, message, productId, validateForm, createEnquiry, onClose]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  const handleOverlayPress = useCallback(() => {
    if (!isSubmitting) {
      handleClose();
    }
  }, [isSubmitting, handleClose]);

  // Pan responder for swipe down to close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          handleClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Backdrop */}
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: fadeAnim,
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleOverlayPress}
            style={{ flex: 1 }}
          />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: MAX_SHEET_HEIGHT,
            minHeight: MIN_SHEET_HEIGHT,
            transform: [{ translateY: slideAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
          }}
        >
          {/* Drag Handle */}
          <View {...panResponder.panHandlers} style={{ paddingTop: 12, paddingBottom: 8 }}>
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: '#d1d5db',
                borderRadius: 2,
                alignSelf: 'center',
              }}
            />
          </View>

          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6',
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827' }}>
              Raise Enquiry
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={isSubmitting}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#f3f4f6',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Product Info (if provided) */}
          {productName && (
            <View
              style={{
                paddingHorizontal: 24,
                paddingVertical: 12,
                backgroundColor: '#eff6ff',
                borderBottomWidth: 1,
                borderBottomColor: '#dbeafe',
              }}
            >
              <Text style={{ fontSize: 12, color: '#3b82f6', fontWeight: '600', marginBottom: 4 }}>
                PRODUCT ENQUIRY
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e40af' }}>
                {productName}
              </Text>
              {productCode && (
                <Text style={{ fontSize: 12, color: '#60a5fa', marginTop: 2 }}>
                  {productCode}
                </Text>
              )}
            </View>
          )}

          {/* Form Content */}
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 20 }}>
            {/* Subject Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                Subject <Text style={{ color: '#ef4444' }}>*</Text>
              </Text>
              <TextInput
                value={subject}
                onChangeText={(text) => {
                  setSubject(text);
                  if (subjectError) setSubjectError('');
                }}
                placeholder="e.g., Product availability query"
                placeholderTextColor="#9ca3af"
                maxLength={255}
                editable={!isSubmitting}
                style={{
                  borderWidth: 1,
                  borderColor: subjectError ? '#ef4444' : '#d1d5db',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 15,
                  color: '#111827',
                  backgroundColor: isSubmitting ? '#f9fafb' : '#ffffff',
                }}
              />
              {subjectError ? (
                <Text style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
                  {subjectError}
                </Text>
              ) : (
                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  {subject.length}/255 characters
                </Text>
              )}
            </View>

            {/* Message Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                Message <Text style={{ color: '#ef4444' }}>*</Text>
              </Text>
              <TextInput
                value={message}
                onChangeText={(text) => {
                  setMessage(text);
                  if (messageError) setMessageError('');
                }}
                placeholder="Please describe your enquiry in detail..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                editable={!isSubmitting}
                style={{
                  borderWidth: 1,
                  borderColor: messageError ? '#ef4444' : '#d1d5db',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 15,
                  color: '#111827',
                  height: 120,
                  backgroundColor: isSubmitting ? '#f9fafb' : '#ffffff',
                }}
              />
              {messageError ? (
                <Text style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
                  {messageError}
                </Text>
              ) : (
                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  Minimum 10 characters required
                </Text>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <View
            style={{
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderTopWidth: 1,
              borderTopColor: '#f3f4f6',
            }}
          >
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
              style={{
                backgroundColor: isSubmitting ? '#93c5fd' : '#0b55b3',
                height: 52,
                borderRadius: 26,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text
                    style={{
                      color: '#ffffff',
                      fontSize: 16,
                      fontWeight: '600',
                      marginLeft: 8,
                    }}
                  >
                    Submitting...
                  </Text>
                </>
              ) : (
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: '600',
                    letterSpacing: 0.3,
                  }}
                >
                  Submit Enquiry
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EnquiryBottomSheet;