import React, { useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  StatusBar,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Icons from '@/components/icons';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const LOGO = require('@/assets/images/logo.png');

function HelpSupportContent() {

  // Handle Android hardware back button and iOS gesture
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace('/dashboard');
        return true; // Prevent default behavior
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );

  const handleBack = useCallback(() => {
    router.replace('/');
  }, []);

  const makePhoneCall = async (phoneNumber: string) => {
    try {
      const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
      const url = `tel:${cleanNumber}`;
      
      // Skip canOpenURL — it requires the manifest query to resolve
      // Just attempt to open directly; it will fail gracefully if unsupported
      await Linking.openURL(url);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Cannot Make Call',
        text2: `Please dial manually: ${phoneNumber}`,
        position: 'top',
        visibilityTime: 4000,
      });
    }
  };
  
  const sendEmail = async (email: string) => {
    try {
      await Linking.openURL(`mailto:${email}`);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Cannot Open Email',
        text2: `Please email us at: ${email}`,
        position: 'top',
        visibilityTime: 4000,
      });
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-4 py-4 flex-row items-center border-b border-gray-50">
          <TouchableOpacity onPress={handleBack} className="w-10 h-10 items-center justify-center">
            <Icons.BackButtonIcon width={28} height={22} fill="#0b55b3" />
          </TouchableOpacity>
          <Text className="text-[18px] font-bold text-black ml-2">Help & Support</Text>
        </View>

        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View className="items-center mt-10 mb-8">
            <Image 
              source={LOGO} 
              className="w-48 h-24" 
              resizeMode="contain" 
            />
            <View className="mt-6 px-8">
              <Text className="text-center text-gray-500 text-[15px] leading-6">
                We are here to help you. If you have any queries regarding our products or services, please feel free to reach out to us.
              </Text>
            </View>
          </View>

          {/* Contact Information Cards */}
          <View className="px-6 space-y-4 gap-2">
            
            {/* Call Support */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => makePhoneCall('+918826192384')}
              className="flex-row items-center p-5 bg-gray-50 rounded-2xl border border-gray-100"
            >
              <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center">
                <Feather name="phone-call" size={22} color="#0b55b3" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-gray-400 text-[11px] uppercase font-bold tracking-widest">Customer Care</Text>
                <Text className="text-black text-[17px] font-semibold mt-0.5">+91 88261 92384</Text>
              </View>
            </TouchableOpacity>

            {/* Call Support - Second Number */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => makePhoneCall('+918368709230')}
              className="flex-row items-center p-5 bg-gray-50 rounded-2xl border border-gray-100"
            >
              <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center">
                <Feather name="phone-call" size={22} color="#0b55b3" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-gray-400 text-[11px] uppercase font-bold tracking-widest">Customer Care</Text>
                <Text className="text-black text-[17px] font-semibold mt-0.5">+91 83687 09230</Text>
              </View>
            </TouchableOpacity>

            {/* Email Support */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => sendEmail('support@example.co.in')}
              className="flex-row items-center p-5 bg-gray-50 rounded-2xl border border-gray-100"
            >
              <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center">
                <Ionicons name="mail-outline" size={24} color="#0b55b3" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-gray-400 text-[11px] uppercase font-bold tracking-widest">Email Us</Text>
                <Text className="text-black text-[17px] font-semibold mt-0.5">support@example.co.in</Text>
              </View>
            </TouchableOpacity>

            {/* Office Address */}
            {/* <View className="flex-row items-start p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center">
                <Ionicons name="location-outline" size={24} color="#0b55b3" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-gray-400 text-[11px] uppercase font-bold tracking-widest">Head Office</Text>
                <Text className="text-black text-[15px] font-medium leading-6 mt-1">
                  123 Business Park, Sector 62,{"\n"}
                  Industrial Area, Phase-II,{"\n"} Mumbai, Maharashtra - 400001
                </Text>
              </View>
            </View> */}

          </View>

          {/* Footer Version Info */}
          <View className="mt-auto pt-10 items-center">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="copyright" size={14} color="#9ca3af" />
              <Text className="text-gray-400 text-xs ml-1">
                {new Date().getFullYear()} - example. All Rights Reserved.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export default function HelpSupportScreen() {
  return (
    <ProtectedRoute>
      <HelpSupportContent />
    </ProtectedRoute>
  );
}