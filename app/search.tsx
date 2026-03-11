import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useProductsInfinite } from '@/hooks/useProducts';
import { Product } from '@/types/product';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Icons from '@/components/icons';
import { BASE_URL } from '@/constants/config';

const FALLBACK_IMAGE = require('@/assets/images/no-image.png');

function SearchScreenContent() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,      
    hasNextPage,        
    isFetchingNextPage, 
  } = useProductsInfinite({ 
    search: debouncedSearch,
    limit: 10,
  });

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
        text1: 'Search Error',
        text2: error.message,
        position: 'top',
        visibilityTime: 3000,
      });
    }
  }, [isError, error]);

  const handleBack = () => {
    // if (navigation.canGoBack()) {
    //   router.back();
    // } else {
      router.replace('/dashboard');
    // }
  };

  const handleProductPress = useCallback((product: Product) => {
    router.push({
      pathname: "/product",
      params: { 
        id: product.id.toString(),
        productCode: product.product_code,
        refCode: product.ref_code,
      }
    });
  }, []);

  const products = data?.pages.flatMap(page => page.data) ?? [];
  
  const totalItems = data?.pages[0]?.pagination.totalItems ?? 0;

  const renderProduct = useCallback(({ item }: { item: Product }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => handleProductPress(item)}
      className="flex-row items-center justify-between py-4 border-b border-gray-100"
    >
      <View className="flex-row items-center flex-1">
        <View className="w-16 h-12 items-center justify-center mr-4">
          <Image 
            source={item.thumbnail ? { uri: BASE_URL + item.thumbnail } : FALLBACK_IMAGE}
            className="w-full h-full"
            resizeMode="contain" 
          />
        </View>
        <View className="flex-1 mr-2">
          <Text className="text-[16px] font-bold text-[#1a1a1a]" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-[13px] text-gray-600 mt-1" numberOfLines={1}>
            {item.product_code}
          </Text>
          <Text className="text-[12px] text-gray-500 mt-0.5">
            {item.make.title} • {item.category.title}
          </Text>
        </View>
      </View>
      <Icons.RightCaretIcon width={16} height={16} />
    </TouchableOpacity>
  ), [handleProductPress]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    if (!debouncedSearch) return null;
    
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-lg font-semibold text-gray-800 mb-2">
          No products found
        </Text>
        <Text className="text-sm text-gray-500 text-center px-8">
          No results for "{debouncedSearch}"
        </Text>
      </View>
    );
  }, [isLoading, debouncedSearch]);

  const renderHeader = useCallback(() => {
    if (products.length === 0 || isLoading || !debouncedSearch) return null;
    
    return (
      <View className="py-2 px-1 mb-2">
        <Text className="text-sm text-gray-600">
          Showing {products.length} of {totalItems} {totalItems === 1 ? 'product' : 'products'}
        </Text>
      </View>
    );
  }, [products.length, totalItems, isLoading, debouncedSearch]);

  // Loading Footer for Infinite Scroll
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#0b55b3" />
      </View>
    );
  };

  const renderContent = () => {
    if (!debouncedSearch && !isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Start searching
          </Text>
          <Text className="text-sm text-gray-500 text-center px-8">
            Enter a product code or name to search
          </Text>
        </View>
      );
    }

    if (isError) {
      // Reuse your existing error render logic here...
      return (
        <View className="flex-1 items-center justify-center py-20">
           {/* ... existing error UI ... */}
           <TouchableOpacity onPress={() => refetch()} className="bg-[#0b55b3] px-6 py-3 rounded-full mt-4">
              <Text className="text-white font-semibold">Try Again</Text>
           </TouchableOpacity>
        </View>
      );
    }

    // Show loading for initial load only
    if (isLoading && products.length === 0) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#0b55b3" />
          <Text className="mt-4 text-gray-600">Searching products...</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        className="mt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter} // Added Footer
        refreshing={isLoading}
        onRefresh={refetch}
        keyboardDismissMode="on-drag"
        // Add Infinite Scroll triggers
        onEndReached={() => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5} // Load more when scrolled 50% from bottom
      />
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView className="flex-1 px-6">
        <View className="flex-row items-center h-[54px] border border-[#0b55b3] rounded-full px-5 mt-4">
          <TouchableOpacity onPress={handleBack} className="pr-2">
            <Icons.BackButtonIcon width={28} height={22} />
          </TouchableOpacity>
          
          <TextInput
            className="flex-1 h-full text-[17px] text-gray-800 ml-2"
            value={search}
            onChangeText={setSearch}
            placeholder="Search products..."
            placeholderTextColor="#9ca3af"
            autoFocus
            returnKeyType="search"
          />

          {(isLoading && !isFetchingNextPage) && search.length > 0 && (
            <ActivityIndicator size="small" color="#0b55b3" />
          )}

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} className="ml-2">
              <Text className="text-gray-400 text-xl">×</Text>
            </TouchableOpacity>
          )}
        </View>

        {renderContent()}

        <View className="absolute bottom-0 left-0 right-0 items-center bg-white pb-8">
          <Image
            source={require('@/assets/images/logo.png')}
            className="w-40 h-10"
            resizeMode="contain"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

export default function SearchScreen() {
  return (
    <ProtectedRoute>
      <SearchScreenContent />
    </ProtectedRoute>
  );
}