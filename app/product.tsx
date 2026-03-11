import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import ImageView from 'react-native-image-viewing';
import { useProductDetail } from '@/hooks/useProducts';
import { useCheckFavorite, useToggleFavorite } from '@/hooks/useFavorites';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RelatedProduct } from '@/types/product';
import Icons from '@/components/icons';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '@/constants/config';
import EnquiryBottomSheet from '@/components/EnquiryBottomSheet';

const FALLBACK_IMAGE = require('@/assets/images/no-image.png');
const { width: SCREEN_WIDTH } = Dimensions.get('window');

function ProductDetailContent() {
  const params = useLocalSearchParams<{ id: string; productCode?: string; refCode?: string }>();
  const productId = params.id ? parseInt(params.id) : 0;

  const [isZoomVisible, setIsZoomVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [imageRenderKey, setImageRenderKey] = useState(0);
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: number]: boolean }>({});
  const [imageErrorStates, setImageErrorStates] = useState<{ [key: number]: boolean }>({});
  const [relatedImageLoadingStates, setRelatedImageLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [relatedImageErrorStates, setRelatedImageErrorStates] = useState<{ [key: string]: boolean }>({});
  const [isEnquirySheetVisible, setIsEnquirySheetVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const { data: product, isLoading, isError, error, refetch } = useProductDetail(productId);
  const { data: favoriteStatus } = useCheckFavorite(productId);
  const { toggleFavorite, isLoading: isTogglingFavorite } = useToggleFavorite();

  const isFavorite = favoriteStatus?.data?.isFavorite || false;

  // Reset image indices when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setActiveSlideIndex(0);
    setIsZoomVisible(false);
    setIsEnquirySheetVisible(false);
    setImageRenderKey(prev => prev + 1);
    setImageLoadingStates({});
    setImageErrorStates({});
    setRelatedImageLoadingStates({});
    setRelatedImageErrorStates({});
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      }, 0);
    }
  }, [productId]);

  // ALL CALLBACKS MUST BE DEFINED BEFORE ANY CONDITIONAL RETURNS
  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/search');
    }
  }, []);

  const handleSearchButtonClick = useCallback(() => {
    router.replace('/search');
  }, []);

  const handleFavoriteToggle = useCallback(() => {
    if (!isTogglingFavorite) {
      toggleFavorite(productId, isFavorite);
    }
  }, [productId, isFavorite, isTogglingFavorite, toggleFavorite]);

  const handleImagePress = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setIsZoomVisible(true);
  }, []);

  const handleZoomClose = useCallback(() => {
    setIsZoomVisible(false);
    setTimeout(() => {
      setImageRenderKey(prev => prev + 1);
    }, 100);
  }, []);

  const handleRelatedProductPress = useCallback((relatedProduct: RelatedProduct) => {
    if (isZoomVisible) {
      setIsZoomVisible(false);
      setTimeout(() => {
        router.push({
          pathname: '/product',
          params: {
            id: relatedProduct.id.toString(),
          },
        });
      }, 200);
    } else {
      router.push({
        pathname: '/product',
        params: {
          id: relatedProduct.id.toString(),
        },
      });
    }
  }, [isZoomVisible]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = SCREEN_WIDTH;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveSlideIndex(index);
  }, []);

  const handleImageLoadStart = useCallback((index: number) => {
    setImageLoadingStates(prev => ({ ...prev, [index]: true }));
    setImageErrorStates(prev => ({ ...prev, [index]: false }));
    
    // Failsafe: clear loading state after 10 seconds
    setTimeout(() => {
      setImageLoadingStates(prev => ({ ...prev, [index]: false }));
    }, 10000);
  }, []);

  const handleImageLoadEnd = useCallback((index: number) => {
    setTimeout(() => {
      setImageLoadingStates(prev => ({ ...prev, [index]: false }));
    }, 100);
  }, []);

  const handleImageError = useCallback((index: number) => {
    setImageLoadingStates(prev => ({ ...prev, [index]: false }));
    setImageErrorStates(prev => ({ ...prev, [index]: true }));
  }, []);

  const handleRelatedImageLoadStart = useCallback((itemId: string) => {
    setRelatedImageLoadingStates(prev => ({ ...prev, [itemId]: true }));
    setRelatedImageErrorStates(prev => ({ ...prev, [itemId]: false }));
    
    // Failsafe: clear loading state after 10 seconds
    setTimeout(() => {
      setRelatedImageLoadingStates(prev => ({ ...prev, [itemId]: false }));
    }, 10000);
  }, []);

  const handleRelatedImageLoadEnd = useCallback((itemId: string) => {
    setTimeout(() => {
      setRelatedImageLoadingStates(prev => ({ ...prev, [itemId]: false }));
    }, 100);
  }, []);

  const handleRelatedImageError = useCallback((itemId: string) => {
    setRelatedImageLoadingStates(prev => ({ ...prev, [itemId]: false }));
    setRelatedImageErrorStates(prev => ({ ...prev, [itemId]: true }));
  }, []);

  const handleRaiseEnquiry = useCallback(() => {
    setIsEnquirySheetVisible(true);
  }, []);

  const handleCloseEnquirySheet = useCallback(() => {
    setIsEnquirySheetVisible(false);
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0b55b3" />
        <Text className="mt-4 text-gray-600">Loading product details...</Text>
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <SafeAreaView className="flex-1 px-6">
          <TouchableOpacity onPress={handleBack} className="py-4">
            <Icons.BackButtonIcon width={28} height={22} />
          </TouchableOpacity>

          <View className="flex-1 items-center justify-center">
            <Text className="text-lg font-semibold text-gray-800 mb-2">Product Not Found</Text>
            <Text className="text-sm text-gray-500 text-center mb-4">
              {error?.message || 'Unable to load product details'}
            </Text>
            <TouchableOpacity onPress={() => refetch()} className="bg-[#0b55b3] px-6 py-3 rounded-full">
              <Text className="text-white font-semibold">Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const productImages =
    product.images && product.images.length > 0
      ? product.images.map((img) => ({ uri: BASE_URL + img.url }))
      : [Image.resolveAssetSource(FALLBACK_IMAGE)];

  const renderImageSlide = ({ item, index }: { item: any; index: number }) => {
    const isLoading = imageLoadingStates[index] || false;
    const hasError = imageErrorStates[index] || false;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleImagePress(index)}
        style={{ width: SCREEN_WIDTH }}
        className="items-center justify-center"
      >
        <View style={{ width: '85%', height: 288, position: 'relative' }}>
          {/* Actual Image - Always render */}
          <Image 
            key={`img-${productId}-${index}-${imageRenderKey}`}
            source={hasError ? FALLBACK_IMAGE : item} 
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
            onLoadStart={() => handleImageLoadStart(index)}
            onLoad={() => handleImageLoadEnd(index)}
            onError={() => handleImageError(index)}
          />

          {/* Loading Indicator Overlay */}
          {isLoading && (
            <View 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                zIndex: 1
              }}
              pointerEvents="none"
            >
              <ActivityIndicator size="large" color="#0b55b3" />
              <Text className="mt-2 text-gray-500 text-sm">Loading image...</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderPaginationDots = () => {
    if (productImages.length <= 1) return null;

    return (
      <View className="flex-row justify-center items-center mt-4">
        {productImages.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full mx-1 ${
              index === activeSlideIndex ? 'w-8 bg-[#0b55b3]' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </View>
    );
  };

  const renderRelatedItem = ({ item }: { item: RelatedProduct }) => {
    const itemKey = item.id.toString();
    const isRelatedImageLoading = relatedImageLoadingStates[itemKey] || false;
    const hasRelatedImageError = relatedImageErrorStates[itemKey] || false;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleRelatedProductPress(item)}
        className="w-[125px] mr-4 rounded-[20px] border border-[#0b55b3] overflow-hidden bg-white"
      >
        <View className="h-28 items-center justify-center p-3 bg-white relative">
          {/* Loading Indicator for Related Products */}
          {isRelatedImageLoading && !hasRelatedImageError && (
            <View 
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f9fafb'
              }}
            >
              <ActivityIndicator size="small" color="#0b55b3" />
            </View>
          )}

          <Image
            source={item.thumbnail ? { uri: BASE_URL + item.thumbnail } : FALLBACK_IMAGE}
            className="w-full h-full"
            resizeMode="contain"
            onLoadStart={() => handleRelatedImageLoadStart(itemKey)}
            onLoad={() => handleRelatedImageLoadEnd(itemKey)}
            onError={() => handleRelatedImageError(itemKey)}
          />
        </View>

        <View className="bg-[#0b55b3] py-3 px-2 items-center">
          <Text className="text-white text-[11px] font-bold uppercase" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-white text-[10px] text-center mt-0.5" numberOfLines={1}>
            {item.product_code}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {isZoomVisible && (
        <ImageView
          images={productImages}
          imageIndex={currentImageIndex}
          visible={isZoomVisible}
          onRequestClose={handleZoomClose}
          presentationStyle="overFullScreen"
          swipeToCloseEnabled={true}
          doubleTapToZoomEnabled={true}
          HeaderComponent={({ imageIndex }) => (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                paddingTop: StatusBar.currentHeight || 50,
                backgroundColor: 'transparent',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 15,
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                  {imageIndex + 1} / {productImages.length}
                </Text>
                <TouchableOpacity
                  onPress={handleZoomClose}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          FooterComponent={() => (
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                paddingBottom: 30,
                backgroundColor: 'transparent',
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 14, opacity: 0.8 }}>
                  Pinch to zoom • Swipe up to close
                </Text>
              </View>
            </View>
          )}
        />
      )}

      {/* Enquiry Bottom Sheet */}
      <EnquiryBottomSheet
        visible={isEnquirySheetVisible}
        onClose={handleCloseEnquirySheet}
        productId={productId}
        productName={product.name}
        productCode={product.product_code}
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header Navigation */}
        <View className="flex-row justify-between">
          <View className="px-4 pt-4">
            <TouchableOpacity onPress={handleBack} style={{ width: 40, height: 40 }}>
              <Icons.BackButtonIcon width={28} height={22} fill="#0b55b3" />
            </TouchableOpacity>
          </View>
          <View className="px-4 pt-4">
            <TouchableOpacity onPress={handleSearchButtonClick} style={{ width: 40, height: 40 }}>
              <Icons.SearchIcon width={28} height={22} fill="#0b55b3" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Image Slider */}
          <View>
            <FlatList
              key={`product-images-${productId}`}
              ref={flatListRef}
              data={productImages}
              renderItem={renderImageSlide}
              keyExtractor={(_, index) => `${productId}-image-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              removeClippedSubviews={false}
            />
            {renderPaginationDots()}
          </View>

          <View className="px-6 mt-6">
            {/* Title, Description & Favorite Button */}
            <View className="flex-row flex-1 justify-between items-start">
              <View className="flex-1 mr-3">
                <Text className="text-[24px] font-bold text-black">{product.name}</Text>
                <Text className="text-[16px] text-gray-600 mt-1">{product.product_code}</Text>
              </View>
              <TouchableOpacity
                onPress={handleFavoriteToggle}
                disabled={isTogglingFavorite}
                style={{ width: 40, height: 40 }}
                className="items-center justify-center"
              >
                {isTogglingFavorite ? (
                  <ActivityIndicator size="small" color="#0b55b3" />
                ) : (
                  <Icons.SavedIcon 
                    width={30} 
                    height={28} 
                    fill={isFavorite ? '#ef4444' : '#d1d5db'} 
                    isFilled={isFavorite}
                  />
                )}
              </TouchableOpacity>
            </View>

            {/* Price */}
            {product.mrp && (
              <View className='mt-3'>
                <Text className='text-sm text-gray-600 uppercase tracking-wider mb-1'>
                  MRP
                </Text>
                <Text className="text-[38px] font-black text-black leading-none">
                  ₹{Math.round(parseInt(product.mrp))}/-
                </Text>
              </View>
            )}

            {/* Specification Table */}
            <View className="mt-6">
              <View className="flex-row justify-between py-3 border-b border-gray-200">
                <Text className="text-gray-500 text-[15px]">Make</Text>
                <Text className="text-black font-semibold text-[15px]">{product.make.title}</Text>
              </View>
              <View className="flex-row justify-between py-3 border-b border-gray-200">
                <Text className="text-gray-500 text-[15px]">Standard Package</Text>
                <Text className="text-black font-semibold text-[15px]">{product.std_pkg}</Text>
              </View>
              <View className="flex-row justify-between py-3 border-b border-gray-200">
                <Text className="text-gray-500 text-[15px]">Master Package</Text>
                <Text className="text-black font-semibold text-[15px]">{product.mast_pkg}</Text>
              </View>
            </View>
          </View>

          {/* Raise Enquiry Button */}
          <View className='mt-8 px-6'>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleRaiseEnquiry}
              style={{
                backgroundColor: '#0b55b3',
                height: 52,
                borderRadius: 26,
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 5,
                shadowColor: '#0b55b3',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
            >
              <Text
                style={{
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: '600',
                  letterSpacing: 0.3,
                }}
              >
                Raise Enquiry
              </Text>
            </TouchableOpacity>
          </View>

          {/* Related Products Section */}
          {product.relatedProducts && product.relatedProducts.length > 0 && (
            <View className="pl-6 mt-12">
              <Text className="text-[18px] font-bold text-black mb-5">You may also like</Text>
              <FlatList
                horizontal
                data={product.relatedProducts}
                renderItem={renderRelatedItem}
                keyExtractor={(item) => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                snapToInterval={141}
                decelerationRate="fast"
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export default function ProductDetailScreen() {
  return (
    <ProtectedRoute>
      <ProductDetailContent />
    </ProtectedRoute>
  );
}