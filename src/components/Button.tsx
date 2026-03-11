import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors } from '@/constants/color';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false,
  variant = 'primary',
  fullWidth = false,
  style,
}: ButtonProps) {
  const variants = {
    primary: Colors.primary,
    secondary: Colors.secondary,
    danger: Colors.danger,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: variants[variant],
          paddingVertical: 18,
          paddingHorizontal: 28,
          borderRadius: 999,
          alignItems: 'center',
          opacity: disabled || loading ? 0.6 : 1,
          alignSelf: 'center',
        },
        fullWidth ? { width: '100%', maxWidth: 360 } : undefined,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="text-white font-semibold text-[18px]">{title}</Text>
      )}
    </TouchableOpacity>
  );
}