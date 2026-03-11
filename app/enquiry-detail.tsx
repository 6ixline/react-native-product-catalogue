import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useEnquiryDetail } from '@/hooks/useEnquiries';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Icons from '@/components/icons';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

function EnquiryDetailContent() {
  const params = useLocalSearchParams<{ id: string }>();
  const enquiryId = params.id ? parseInt(params.id) : 0;

  const { data: enquiry, isLoading, isError, error, refetch } = useEnquiryDetail(enquiryId);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/enquiries');
    }
  }, []);

  const handleProductPress = useCallback(() => {
    if (enquiry?.product) {
      router.push({
        pathname: '/product',
        params: {
          id: enquiry.product.id.toString(),
        },
      });
    }
  }, [enquiry]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '#b45309' };
      case 'in_progress':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: '#1d4ed8' };
      case 'resolved':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: '#15803d' };
      case 'closed':
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: '#374151' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: '#6b7280' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'in_progress':
        return 'reload-outline';
      case 'resolved':
        return 'checkmark-circle-outline';
      case 'closed':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: '#ef4444' };
      case 'high':
        return { bg: 'bg-orange-100', text: 'text-orange-700', icon: '#f97316' };
      case 'medium':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: '#3b82f6' };
      case 'low':
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: '#6b7280' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: '#6b7280' };
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0b55b3" />
        <Text className="mt-4 text-gray-600">Loading enquiry details...</Text>
      </View>
    );
  }

  if (isError || !enquiry) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <SafeAreaView className="flex-1 px-6">
          <TouchableOpacity onPress={handleBack} className="py-4">
            <Icons.BackButtonIcon width={28} height={22} />
          </TouchableOpacity>

          <View className="flex-1 items-center justify-center">
            <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
            <Text className="text-lg font-semibold text-gray-800 mb-2 mt-4">
              Enquiry Not Found
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-4">
              {error?.message || 'Unable to load enquiry details'}
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="bg-[#0b55b3] px-6 py-3 rounded-full"
            >
              <Text className="text-white font-semibold">Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const statusColors = getStatusColor(enquiry.status);
  const priorityColors = getPriorityColor(enquiry.priority);

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 py-4 border-b border-gray-100">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={handleBack} className="pr-2">
              <Icons.BackButtonIcon width={28} height={22} />
            </TouchableOpacity>
            <Text className="text-[18px] font-bold text-black ml-2 flex-1">
              Enquiry Details
            </Text>
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Status and Priority Card */}
          <View className="bg-white mx-6 mt-4 rounded-2xl p-4 border border-gray-200">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-xs text-gray-500 mb-2">STATUS</Text>
                <View className={`px-3 py-2 rounded-full flex-row items-center ${statusColors.bg}`}>
                  <Ionicons 
                    name={getStatusIcon(enquiry.status) as any} 
                    size={16} 
                    color={statusColors.icon} 
                  />
                  <Text className={`ml-2 text-sm font-bold capitalize ${statusColors.text}`}>
                    {enquiry.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <Text className="text-xs text-gray-500 mb-1">CREATED</Text>
                  <Text className="text-sm font-semibold text-gray-800">
                    {format(new Date(enquiry.createdAt), 'MMM dd, yyyy')}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {format(new Date(enquiry.createdAt), 'hh:mm a')}
                  </Text>
              </View>
            </View>

            {/* Date Info */}
            {/* <View className="mt-4 pt-4 border-t border-gray-100">
              <View className="flex-row justify-between">
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 mb-1">CREATED</Text>
                  <Text className="text-sm font-semibold text-gray-800">
                    {format(new Date(enquiry.createdAt), 'MMM dd, yyyy')}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {format(new Date(enquiry.createdAt), 'hh:mm a')}
                  </Text>
                </View>

                {enquiry.resolved_at && (
                  <View className="flex-1 items-end">
                    <Text className="text-xs text-gray-500 mb-1">RESOLVED</Text>
                    <Text className="text-sm font-semibold text-gray-800">
                      {format(new Date(enquiry.resolved_at), 'MMM dd, yyyy')}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {format(new Date(enquiry.resolved_at), 'hh:mm a')}
                    </Text>
                  </View>
                )}
              </View>
            </View> */}
          </View>

          {/* Product Info (if exists) */}
          {enquiry.product && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleProductPress}
              className="bg-blue-50 mx-6 mt-4 rounded-2xl p-4 border border-blue-200"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-xs text-blue-600 font-bold mb-2">PRODUCT ENQUIRY</Text>
                  <Text className="text-base font-bold text-blue-900 mb-1" numberOfLines={2}>
                    {enquiry.product.name}
                  </Text>
                  <Text className="text-sm text-blue-700 mb-1">
                    {enquiry.product.product_code}
                  </Text>
                  <View className="flex-row mt-1">
                    <Text className="text-xs text-blue-600">
                      {enquiry.product.make.title}
                    </Text>
                    <Text className="text-xs text-blue-600 mx-2">•</Text>
                    <Text className="text-xs text-blue-600">
                      {enquiry.product.category.title}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#2563eb" />
              </View>
            </TouchableOpacity>
          )}

          {/* Subject */}
          <View className="bg-white mx-6 mt-4 rounded-2xl p-4 border border-gray-200">
            <Text className="text-xs text-gray-500 mb-2">SUBJECT</Text>
            <Text className="text-base font-bold text-gray-900">
              {enquiry.subject}
            </Text>
          </View>

          {/* Message */}
          <View className="bg-white mx-6 mt-4 rounded-2xl p-4 border border-gray-200">
            <Text className="text-xs text-gray-500 mb-2">YOUR MESSAGE</Text>
            <Text className="text-base text-gray-800 leading-6">
              {enquiry.message}
            </Text>
          </View>

          {/* Admin Reply */}
          {enquiry.admin_reply && (
            <View className="bg-green-50 mx-6 mt-4 rounded-2xl p-4 border border-green-200">
              <View className="flex-row items-center mb-3">
                <Ionicons name="chatbox-ellipses" size={20} color="#15803d" />
                <Text className="text-xs text-green-700 font-bold ml-2">ADMIN REPLY</Text>
              </View>
              <Text className="text-base text-green-900 leading-6">
                {enquiry.admin_reply}
              </Text>
            </View>
          )}

          {/* Assigned Admin Info */}
          {enquiry.assignedAdmin && (
            <View className="bg-white mx-6 mt-4 rounded-2xl p-4 border border-gray-200">
              <Text className="text-xs text-gray-500 mb-3">ASSIGNED TO</Text>
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-[#0b55b3] items-center justify-center">
                  <Text className="text-white font-bold text-base">
                    {enquiry.assignedAdmin.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="ml-3">
                  <Text className="text-sm font-bold text-gray-900">
                    {enquiry.assignedAdmin.name}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {enquiry.assignedAdmin.email}
                  </Text>
                </View>
              </View>
            </View>
          )}


          {/* Internal Remarks (if any - usually not visible to users, but including for completeness) */}
          {enquiry.remarks && (
            <View className="bg-gray-100 mx-6 mt-4 rounded-2xl p-4 border border-gray-200">
              <View className="flex-row items-center mb-2">
                <Ionicons name="document-text-outline" size={18} color="#6b7280" />
                <Text className="text-xs text-gray-600 font-bold ml-2">ADMIN NOTES</Text>
              </View>
              <Text className="text-sm text-gray-700 leading-5">
                {enquiry.remarks}
              </Text>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export default function EnquiryDetailScreen() {
  return (
    <ProtectedRoute>
      <EnquiryDetailContent />
    </ProtectedRoute>
  );
}