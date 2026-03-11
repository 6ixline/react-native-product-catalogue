import { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { ONBOARDING_SLIDES, type OnboardingSlide } from '@/constants/onboarding';

export default function OnboardingScreen() {
  const flatListRef = useRef<FlatList<OnboardingSlide> | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { width } = useWindowDimensions();

  const horizontalScreenPadding = 24; // px-6 on the container
  const slideWidth = width - horizontalScreenPadding * 2;
  const cardSize = useMemo(
    () => Math.min(slideWidth * 0.92, 340),
    [slideWidth]
  );
  const imageSize = useMemo(() => cardSize * 0.82, [cardSize]);

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const handleGetStarted = () => {
    if (activeIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = activeIndex + 1;
      setActiveIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      return;
    }

    router.replace('/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ 
          flexGrow: 1, 
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingVertical: 20,
        }}
      >
        {/* Brand / Logo */}
        <View className="items-center mb-8">
          <Image
            source={require('@/assets/images/logo.png')}
            resizeMode="contain"
            style={{ width: 200, height: 56 }}
          />
        </View>

        {/* Slider */}
        <View className="mb-8">
          <FlatList
            ref={flatListRef}
            data={ONBOARDING_SLIDES}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            onMomentumScrollEnd={handleMomentumEnd}
            snapToInterval={slideWidth}
            snapToAlignment="start"
            decelerationRate="fast"
            renderItem={({ item }: { item: OnboardingSlide }) => (
              <View style={{ width: slideWidth }} className="items-center px-2">
                <View className="w-full items-center">
                  <View
                    style={{
                      width: cardSize,
                      height: cardSize,
                      borderRadius: 32,
                      shadowColor: '#000000',
                      shadowOpacity: 0.12,
                      shadowOffset: { width: 0, height: 16 },
                      shadowRadius: 20,
                    }}
                    className="bg-white items-center justify-center overflow-hidden"
                  >
                    <Image
                      source={item.image}
                      resizeMode="contain"
                      style={{ width: imageSize, height: imageSize }}
                    />
                  </View>
                </View>

                <View className="text-center mt-6">
                  <Text className="text-center text-[28px] leading-8 font-extrabold text-gray-900 mb-3">
                    {item.title}
                  </Text>
                  <Text className="text-center text-[15px] text-gray-600 leading-6">
                    {item.description}
                  </Text>
                </View>
              </View>
            )}
          />
        </View>

        {/* Pagination dots */}
        <View className="items-center mb-8">
          <View 
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {ONBOARDING_SLIDES.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <View
                  key={slide.id}
                  style={{
                    height: 8,
                    width: isActive ? 32 : 8,
                    borderRadius: 4,
                    backgroundColor: isActive ? '#0b55b3' : '#e5e7eb',
                  }}
                />
              );
            })}
          </View>
        </View>

        {/* Primary CTA */}
        <Button
          title="Get Started"
          onPress={handleGetStarted}
          variant="primary"
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}