import type { ImageSourcePropType } from 'react-native';

export type OnboardingSlide = {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'discover',
    title: 'Discover Parts Easily',
    description:
      'Browse a complete digital catalogue of genuine spare parts-organized, searchable, and always up to date.',
    image: require('../assets/images/onboarding_1.png'),
  },
  {
    id: 'speed',
    title: 'Built for Speed & Simplicity',
    description:
      'Save time with quick navigation, clear visuals, and detailed part information-everything you need, right at your fingertips.',
    image: require('../assets/images/onboarding_3.png'),
  },
  {
    id: 'search',
    title: 'Smart Keyword Search',
    description:
      'Simply type relevant keywords to discover the right parts instantly-quick, accurate, and hassle-free.',
    image: require('../assets/images/onboarding_2.png'),
  },
];


