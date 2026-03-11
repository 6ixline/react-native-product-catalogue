import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from '@/components/icons'; 
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { BASE_URL } from '@/constants/config';
import { Dimensions } from 'react-native';

interface DashboardCardProps {
  title: string;
  Icon: React.FC<any>;
  onPress: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DashboardCard = ({ title, Icon, onPress }: DashboardCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="w-[44%] aspect-[0.85] bg-white rounded-[32px] justify-center items-center mb-6 shadow-xl shadow-gray-300"
      style={{ 
        shadowOpacity: 0.15,
        shadowRadius: 20, 
        elevation: 10 
      }}
    >
      <View className="mb-5">
        <Icon width={60} height={40} />
      </View>
      
      <Text className="text-[#1a1a1a] text-[15px] font-semibold text-center leading-5">
        {title.replace(' ', '\n')}
      </Text>
    </TouchableOpacity>
  );
};

function DashboardContent() {
  const { user, logout, profile } = useAuth();

  const userData = profile || user;

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

  return (
    <ScrollView style={{flex: 1}} contentContainerClassName='flex-1 bg-white relative'>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent 
      />

      <ImageBackground
        source={require('@/assets/images/bg_pattern_dashboard.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
        imageStyle={{ 
          transform: [{ scale: 2 }],
          top: 0,
          left: SCREEN_WIDTH * 0.3,
          right: 0,
          bottom: SCREEN_HEIGHT * 0.3 
        }}
      >
        <SafeAreaView className="flex-1 z-10">
          {/* Header */}
          <View className="flex-row justify-between items-center px-8 pt-6 pb-4">
            <Image
              source={require('@/assets/images/logo.png')}
              className="w-40 h-12"
              resizeMode="contain"
            />
            <TouchableOpacity 
              className="w-12 h-12 bg-gray-50 border-[1px] border-gray-300 border-solid rounded-full justify-center items-center"
              activeOpacity={0.7}
              onPress={() => { router.replace("/profile") }}
            >
              {profileImageUrl ? (
                <View className="w-14 h-14 rounded-full items-center justify-center overflow-hidden">
                  <Image 
                    source={{ uri: profileImageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <Icons.ProfileIcon width={22} height={22} />
              )}
            </TouchableOpacity>
          </View>

          {/* Grid Container */}
          <View className="flex-1 px-8 pt-12">
            {/* Row 1 */}
            <View className="flex-row justify-between">
              <DashboardCard
                title="Search Product"
                Icon={Icons.SearchIcon}
                onPress={() => { router.replace("/search") }}
              />
              <DashboardCard
                title="My Favorite Product"
                Icon={Icons.SavedIcon}
                onPress={() => { router.replace("/favorites") }}
              />
            </View>

            {/* Row 2 */}
            <View className="flex-row justify-between">
              <DashboardCard
                title="Help & Support"
                Icon={Icons.HelpSupportIcon}
                onPress={() => { router.replace("/help") }}
              />
              <DashboardCard
                title="Enquiry History"
                Icon={Icons.RaisedQueryIcon}
                onPress={() => { router.replace("/enquiries") }}
              />
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </ScrollView>
  );
}

export default function DashboardScreen() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}