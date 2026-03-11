import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useUserEnquiries } from '@/hooks/useEnquiries';
import { Enquiry } from '@/types/enquiry';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Icons from '@/components/icons';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

function EnquiriesScreenContent() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const statusFilters = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Resolved', value: 'resolved' },
  ];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useUserEnquiries({
    page: 1,
    limit: 10,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (isError && error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
        position: 'top',
        visibilityTime: 3000,
      });
    }
  }, [isError, error]);

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

  const handleBack = () => {
    router.replace('/dashboard');
  };

  const handleEnquiryPress = useCallback((enquiry: Enquiry) => {
    router.push({
      pathname: '/enquiry-detail',
      params: {
        id: enquiry.id.toString(),
      },
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#3b82f6';
      case 'low':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const enquiries = data?.data || [];
  const totalItems = data?.pagination?.totalItems ?? 0;

  // Filter enquiries based on search
  const filteredEnquiries = enquiries.filter((enquiry) => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    return (
      enquiry.subject.toLowerCase().includes(searchLower) ||
      enquiry.message.toLowerCase().includes(searchLower) ||
      enquiry.product?.name.toLowerCase().includes(searchLower) ||
      enquiry.product?.product_code.toLowerCase().includes(searchLower)
    );
  });

  const renderEnquiry = useCallback(
    ({ item }: { item: Enquiry }) => (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleEnquiryPress(item)}
        className="bg-white border border-gray-200 rounded-2xl p-4 mb-3"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        {/* Status Badge and Time */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <View className={`px-3 py-1 rounded-full flex-row items-center ${getStatusColor(item.status)}`}>
              <Ionicons name={getStatusIcon(item.status) as any} size={14} color={
                item.status === 'pending' ? '#b45309' :
                item.status === 'in_progress' ? '#1d4ed8' :
                item.status === 'resolved' ? '#15803d' :
                '#374151'
              } />
              <Text className={`ml-1 text-xs font-semibold capitalize ${
                item.status === 'pending' ? 'text-yellow-700' :
                item.status === 'in_progress' ? 'text-blue-700' :
                item.status === 'resolved' ? 'text-green-700' :
                'text-gray-700'
              }`}>
                {item.status.replace('_', ' ')}
              </Text>
            </View>
            
            {/* Priority Indicator */}
            {(item.priority === 'high' || item.priority === 'urgent') && (
              <View className="ml-2 flex-row items-center">
                <Ionicons name="flag" size={14} color={getPriorityColor(item.priority)} />
                <Text style={{ color: getPriorityColor(item.priority), fontSize: 11, fontWeight: '600', marginLeft: 2 }}>
                  {item.priority}
                </Text>
              </View>
            )}
          </View>
          
          <Text className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </Text>
        </View>

        {/* Subject */}
        <Text className="text-base font-bold text-gray-900 mb-2" numberOfLines={1}>
          {item.subject}
        </Text>

        {/* Message Preview */}
        <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
          {item.message}
        </Text>

        {/* Product Info (if exists) */}
        {item.product && (
          <View className="bg-blue-50 rounded-lg p-2 mb-3">
            <Text className="text-xs text-blue-600 font-semibold mb-1">PRODUCT ENQUIRY</Text>
            <Text className="text-sm text-blue-900 font-semibold" numberOfLines={1}>
              {item.product.name}
            </Text>
            <Text className="text-xs text-blue-700" numberOfLines={1}>
              {item.product.product_code}
            </Text>
          </View>
        )}

        {/* Admin Reply Indicator */}
        {item.admin_reply && (
          <View className="flex-row items-center bg-green-50 rounded-lg p-2">
            <Ionicons name="chatbox-ellipses" size={16} color="#15803d" />
            <Text className="text-xs text-green-700 font-semibold ml-2">Admin has replied</Text>
          </View>
        )}

        {/* View Details Arrow */}
        <View className="absolute right-4 top-1/2 -mt-3">
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      </TouchableOpacity>
    ),
    [handleEnquiryPress]
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;

    return (
      <View className="flex-1 items-center justify-center py-20">
        <Ionicons name="chatbox-outline" size={64} color="#d1d5db" />
        <Text className="text-lg font-semibold text-gray-800 mb-2 mt-4">
          {debouncedSearch ? 'No enquiries found' : 'No enquiries yet'}
        </Text>
        <Text className="text-sm text-gray-500 text-center px-8">
          {debouncedSearch
            ? `No results for "${debouncedSearch}"`
            : 'Your enquiries will appear here'}
        </Text>
      </View>
    );
  }, [isLoading, debouncedSearch]);

  const renderHeader = useCallback(() => {
    return (
      <>
        {/* Status Filter Pills */}
        <View className="mb-4">
          <View className="flex-row flex-wrap">
            {statusFilters.map((filter) => (
              <TouchableOpacity
                key={filter.value}
                onPress={() => setSelectedStatus(filter.value)}
                className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                  selectedStatus === filter.value
                    ? 'bg-[#0b55b3]'
                    : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedStatus === filter.value
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Count */}
        {filteredEnquiries.length > 0 && (
          <View className="py-2 mb-2">
            <Text className="text-sm text-gray-600">
              {filteredEnquiries.length} {filteredEnquiries.length === 1 ? 'enquiry' : 'enquiries'}
              {selectedStatus !== 'all' && ` (${statusFilters.find(f => f.value === selectedStatus)?.label})`}
            </Text>
          </View>
        )}
      </>
    );
  }, [filteredEnquiries.length, selectedStatus]);

  const renderContent = () => {
    if (isError) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="text-lg font-semibold text-gray-800 mb-2 mt-4">
            Something went wrong
          </Text>
          <Text className="text-sm text-gray-500 text-center px-8 mb-4">
            {error?.message || 'Unable to load enquiries'}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-[#0b55b3] px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#0b55b3" />
          <Text className="mt-4 text-gray-600">Loading enquiries...</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredEnquiries}
        renderItem={renderEnquiry}
        keyExtractor={(item) => item.id.toString()}
        className="mt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshing={isLoading}
        onRefresh={refetch}
      />
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 border-b border-gray-100">
          <View className="flex-row items-center justify-between py-4">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity onPress={handleBack} className="pr-2">
                <Icons.BackButtonIcon width={28} height={22} />
              </TouchableOpacity>
              <Text className="text-[18px] font-bold text-black ml-2">
                My Enquiries
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <View className="mb-4">
            <View className="flex-row items-center h-[54px] border border-[#0b55b3] rounded-full px-5">
              <Icons.SearchIcon width={20} height={20} fill="#9ca3af" />

              <TextInput
                className="flex-1 h-full text-[17px] text-gray-800 ml-2"
                value={search}
                onChangeText={setSearch}
                placeholder="Search enquiries..."
                placeholderTextColor="#9ca3af"
                returnKeyType="search"
              />

              {isLoading && search.length > 0 && (
                <ActivityIndicator size="small" color="#0b55b3" />
              )}

              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')} className="ml-2">
                  <Text className="text-gray-400 text-xl">×</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View className="flex-1 px-6 pt-4">
          {renderContent()}
        </View>
      </SafeAreaView>
    </View>
  );
}

export default function EnquiriesScreen() {
  return (
    <ProtectedRoute>
      <EnquiriesScreenContent />
    </ProtectedRoute>
  );
}