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
import { useFavoritesInfinite, useRemoveFromFavorites } from '@/hooks/useFavorites';
import { FavoriteProduct } from '@/types/favorite';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Icons from '@/components/icons';
import { BASE_URL } from '@/constants/config';

const FALLBACK_IMAGE = require('@/assets/images/no-image.png');

function FavoritesScreenContent() {
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
  } = useFavoritesInfinite({
    search: debouncedSearch,
    limit: 10,
  });

  const removeFromFavorites = useRemoveFromFavorites();

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
        text1: 'Error',
        text2: error.message,
        position: 'top',
        visibilityTime: 3000,
      });
    }
  }, [isError, error]);

  const handleBack = () => {
    router.replace("/dashboard");
  };

  const handleProductPress = useCallback((favorite: FavoriteProduct) => {
    router.push({
      pathname: '/product',
      params: {
        id: favorite.product.id.toString(),
        productCode: favorite.product.product_code,
        refCode: favorite.product.ref_code,
      },
    });
  }, []);

  const handleRemoveFavorite = useCallback((productId: number, e: any) => {
    e.stopPropagation();
    removeFromFavorites.mutate(productId);
  }, [removeFromFavorites]);

  const favorites = data?.pages.flatMap((page) => page.data) ?? [];
  const totalItems = data?.pages[0]?.pagination.totalItems ?? 0;

  const renderFavorite = useCallback(
    ({ item }: { item: FavoriteProduct }) => (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleProductPress(item)}
        className="flex-row items-center justify-between py-4 border-b border-gray-100"
      >
        <View className="flex-row items-center flex-1">
          <View className="w-16 h-12 items-center justify-center mr-4">
            <Image
              source={
                item.product.thumbnail
                  ? { uri: BASE_URL + item.product.thumbnail }
                  : FALLBACK_IMAGE
              }
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
          <View className="flex-1 mr-2">
            <Text className="text-[16px] font-bold text-[#1a1a1a]" numberOfLines={1}>
              {item.product.name}
            </Text>
            <Text className="text-[13px] text-gray-600 mt-1" numberOfLines={1}>
              {item.product.product_code}
            </Text>
            <Text className="text-[12px] text-gray-500 mt-0.5">
              {item.product.make?.title || 'N/A'} • {item.product.category?.title || 'N/A'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={(e) => handleRemoveFavorite(item.product.id, e)}
          className="ml-2 p-2"
          disabled={removeFromFavorites.isPending}
        >
          <Icons.TrashIcon width={20} height={20} fill="#ef4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [handleProductPress, handleRemoveFavorite, removeFromFavorites.isPending]
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;

    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-lg font-semibold text-gray-800 mb-2">
          {debouncedSearch ? 'No favorites found' : 'No favorites yet'}
        </Text>
        <Text className="text-sm text-gray-500 text-center px-8">
          {debouncedSearch
            ? `No results for "${debouncedSearch}"`
            : 'Start adding products to your favorites'}
        </Text>
      </View>
    );
  }, [isLoading, debouncedSearch]);

  const renderHeader = useCallback(() => {
    if (favorites.length === 0 || isLoading) return null;

    return (
      <View className="py-2 px-1 mb-2">
        <Text className="text-sm text-gray-600">
          {totalItems} {totalItems === 1 ? 'favorite' : 'favorites'}
        </Text>
      </View>
    );
  }, [favorites.length, totalItems, isLoading]);

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#0b55b3" />
      </View>
    );
  };

  const renderContent = () => {
    if (isError) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Something went wrong
          </Text>
          <Text className="text-sm text-gray-500 text-center px-8 mb-4">
            {error?.message || 'Unable to load favorites'}
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

    if (isLoading && favorites.length === 0) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#0b55b3" />
          <Text className="mt-4 text-gray-600">Loading favorites...</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={favorites}
        renderItem={renderFavorite}
        keyExtractor={(item) => item.id.toString()}
        className="mt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshing={isLoading}
        onRefresh={refetch}
        onEndReached={() => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
      />
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView className="flex-1 px-6">
        <View className="flex-row mb-4 border-b border-gray-50 py-4">
          <TouchableOpacity onPress={handleBack} className="pr-2">
            <Icons.BackButtonIcon width={28} height={22} />
          </TouchableOpacity>
          <Text className="text-[18px] font-bold text-black ml-2">
            My Favorite Product
          </Text>
          <View className="w-8" />
        </View>

        <View className="flex-row items-center h-[54px] border border-[#0b55b3] rounded-full px-5">
          <Icons.SearchIcon width={20} height={20} fill="#9ca3af" />

          <TextInput
            className="flex-1 h-full text-[17px] text-gray-800 ml-2"
            value={search}
            onChangeText={setSearch}
            placeholder="Search favorites..."
            placeholderTextColor="#9ca3af"
            returnKeyType="search"
          />

          {isLoading && !isFetchingNextPage && search.length > 0 && (
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

export default function FavoritesScreen() {
  return (
    <ProtectedRoute>
      <FavoritesScreenContent />
    </ProtectedRoute>
  );
}