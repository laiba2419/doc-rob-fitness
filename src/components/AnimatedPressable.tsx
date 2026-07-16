import { useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleSheet } from 'react-native';

// A drop-in replacement for TouchableOpacity that adds:
// 1) a soft "press down" scale animation
// 2) a light blue highlight overlay while pressed
// Usage is identical to TouchableOpacity: <AnimatedPressable style={...} onPress={...}>
type Props = PressableProps & {
  children: React.ReactNode;
  style?: any;
  highlightColor?: string;
};

export default function AnimatedPressable({
  children,
  style,
  onPressIn,
  onPressOut,
  highlightColor = '#3B82F6', // blue -- change if your theme's primary color differs
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const highlight = useRef(new Animated.Value(0)).current;

  const handlePressIn = (e: any) => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 40, bounciness: 6 }),
      Animated.timing(highlight, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }),
      Animated.timing(highlight, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
    onPressOut?.(e);
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} {...rest}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: highlightColor,
              opacity: highlight.interpolate({ inputRange: [0, 1], outputRange: [0, 0.14] }),
              borderRadius: (style && style.borderRadius) || 12,
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
