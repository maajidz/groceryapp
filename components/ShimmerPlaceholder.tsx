import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, Easing, StyleSheet, View, ViewStyle } from 'react-native';

interface ShimmerPlaceholderProps {
  width: number;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
  duration?: number;
  delay?: number;
}

const ShimmerPlaceholder: React.FC<ShimmerPlaceholderProps> = ({
  width,
  height,
  borderRadius = 4,
  style,
  duration = 1000,
  delay = 0,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
        delay: delay,
      })
    );
    animation.start();
    return () => {
      animation.stop();
      animatedValue.setValue(0);
    };
  }, [animatedValue, duration, delay]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 2, width * 2],
  });

  return (
    <View
      style={[
        styles.container,
        { width: width as DimensionValue, height: height as DimensionValue, borderRadius },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
            width: '200%',
            left: '-50%',
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f0f0f0',
    opacity: 0.5,
  },
});

export default ShimmerPlaceholder; 