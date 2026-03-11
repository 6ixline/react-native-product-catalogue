import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Icons from '@/components/icons';
import { BASE_URL } from '@/constants/config';

const LOGO = require('@/assets/images/logo.png');

function ProfileContent() {
  const { user, profile, logout, isLoading, refetchProfile } = useAuth();

  // Use profile data first, fallback to user from auth store
  const userData = profile || user;

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
    // if (router.canGoBack()) {
    //   router.back();
    // } else {
      router.replace('/dashboard');
    // }
  }, []);

  const handleLogout = useCallback(() => {
    logout()
  }, [logout]);

  const handleRefresh = useCallback(() => {
    refetchProfile();
  }, [refetchProfile]);

  // const formatDate = (dateString?: string) => {
  //   if (!dateString) return 'N/A';
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString('en-IN', {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric',
  //   });
  // };

  useEffect(()=>{
    handleRefresh();
  }, [])

  // Get profile image URL with proper handling
  const getProfileImageUrl = () => {
    if (userData?.profileImage?.url) {
      
      const imageUrl = userData.profileImage.url;
      if (imageUrl.startsWith('/')) {
        return BASE_URL + imageUrl; 
      }
      return imageUrl;
    }
    return userData?.avatar || null;
  };

  const profileImageUrl = getProfileImageUrl();

  if (isLoading && !userData) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0b55b3" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-4 py-4 flex-row items-center justify-between border-b border-gray-50">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={handleBack} className="w-10 h-10 items-center justify-center">
              <Icons.BackButtonIcon width={28} height={22} fill="#0b55b3" />
            </TouchableOpacity>
            <Text className="text-[18px] font-bold text-black ml-2">My Profile</Text>
          </View>
          
          {/* <TouchableOpacity 
            onPress={handleRefresh}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="refresh" size={22} color="#0b55b3" />
          </TouchableOpacity> */}
        </View>

        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header Section */}
          <View className="items-center mt-8 mb-6">
            {/* Avatar */}
            <View className="w-24 h-24 bg-blue-50 rounded-full items-center justify-center mb-4 border-2 border-[#0b55b3] overflow-hidden">
              {profileImageUrl ? (
                <Image 
                  source={{ uri: profileImageUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Feather name="user" size={40} color="#0b55b3" />
              )}
            </View>
            
            {/* Name */}
            <Text className="text-[24px] font-bold text-black">
              {userData?.name || 'Dealer Name'}
            </Text>
            
            {/* Username */}
            {userData?.username && (
              <Text className="text-[14px] text-gray-500 mt-1">
                @{userData.username}
              </Text>
            )}
            
            {/* Status Badge */}
            {/* <View className={`mt-3 px-4 py-1.5 rounded-full ${
              userData?.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Text className={`text-xs font-semibold capitalize ${
                userData?.status === 'active' ? 'text-green-700' : 'text-gray-700'
              }`}>
                {userData?.status || 'Active'}
              </Text>
            </View> */}
          </View>

          {/* Profile Information Cards */}
          <View className="px-6 space-y-4 gap-2">
            
            {/* Email */}
            <View className="flex-row items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center">
                <Ionicons name="mail-outline" size={24} color="#0b55b3" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-gray-400 text-[11px] uppercase font-bold tracking-widest">
                  Email Address
                </Text>
                <Text className="text-black text-[15px] font-semibold mt-0.5" numberOfLines={1}>
                  {userData?.email || 'N/A'}
                </Text>
              </View>
            </View>

            {/* Mobile */}
            {userData?.mobile && (
              <View className="flex-row items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center">
                  <Feather name="phone" size={22} color="#0b55b3" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-gray-400 text-[11px] uppercase font-bold tracking-widest">
                    Mobile Number
                  </Text>
                  <Text className="text-black text-[16px] font-semibold mt-0.5">
                    {userData.mobile}
                  </Text>
                </View>
              </View>
            )}

            {/* Role */}
            {/* {userData?.role && (
              <View className="flex-row items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center">
                  <MaterialCommunityIcons name="account-badge-outline" size={24} color="#0b55b3" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-gray-400 text-[11px] uppercase font-bold tracking-widest">
                    Role
                  </Text>
                  <Text className="text-black text-[16px] font-semibold mt-0.5 capitalize">
                    {userData.role}
                  </Text>
                </View>
              </View>
            )} */}

            {/* Member Since */}
            {/* {userData?.createdAt && (
              <View className="flex-row items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center">
                  <Feather name="calendar" size={22} color="#0b55b3" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-gray-400 text-[11px] uppercase font-bold tracking-widest">
                    Member Since
                  </Text>
                  <Text className="text-black text-[16px] font-semibold mt-0.5">
                    {formatDate(userData.createdAt)}
                  </Text>
                </View>
              </View>
            )} */}

            {/* Account ID */}
            {/* <View className="flex-row items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center">
                <MaterialCommunityIcons name="identifier" size={24} color="#0b55b3" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-gray-400 text-[11px] uppercase font-bold tracking-widest">
                  Account ID
                </Text>
                <Text className="text-black text-[16px] font-semibold mt-0.5">
                  #{userData?.id || 'N/A'}
                </Text>
              </View>
            </View> */}

          </View>

          {/* Logout Button */}
          <View className="px-6 mt-8">
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.8}
              className="bg-red-500 h-14 rounded-full items-center justify-center flex-row"
            >
              <Feather name="log-out" size={20} color="#ffffff" />
              <Text className="text-white text-[16px] font-bold ml-2">
                Logout
              </Text>
            </TouchableOpacity>
          </View>

          {/* Logo & Footer */}
          <View className="mt-auto pt-10 items-center">
            <Image 
              source={LOGO} 
              className="w-40 h-20 mb-4" 
              resizeMode="contain" 
            />
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

export default function ProfileScreen() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}