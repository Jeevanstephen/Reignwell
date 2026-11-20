import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import CrownLogo from '../components/CrownLogo';

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(onFinish, 500);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <CrownLogo crownSize={80} fontSize={26} color="#111111" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
