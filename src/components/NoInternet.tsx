import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export const NoInternet = () => {
  const handleRetry = () => {
    NetInfo.refresh().then(state => {
    });
  };

  return (
    <View className="flex-1 bg-white justify-center items-center px-10">
      <Image
        source={require('@/assets/images/logo.png')}
        className="w-40 h-12 mb-10 opacity-50"
        resizeMode="contain"
      />
      <Text className="text-xl font-bold text-gray-900 mb-2">No Connection</Text>
      <Text className="text-gray-500 text-center mb-8">
        Please check your settings. Your app will resume as soon as you are back online or restart the app.
      </Text>
      
      <TouchableOpacity 
        onPress={handleRetry}
        className="bg-black px-8 py-3 rounded-full"
      >
        <Text className="text-white font-semibold">Retry Connection</Text>
      </TouchableOpacity>
    </View>
  );
};