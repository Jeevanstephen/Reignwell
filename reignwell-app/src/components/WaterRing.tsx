import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

const WATER_COLOR = '#3BAFDA';
const TRACK_COLOR = '#EAF7FC';
const GOAL_COLOR = '#C9A84C';
const SIZE = 148;
const STROKE = 11;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface Props {
  ml: number;
  goalMl: number;
}

function mlLabel(ml: number) {
  return ml >= 1000 ? `${(ml / 1000).toFixed(1)} L` : `${ml} ml`;
}

// Animated SVG circle wrapper
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function WaterRing({ ml, goalMl }: Props) {
  const animVal = useRef(new Animated.Value(ml)).current;

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: ml,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [ml]);

  const pct = Math.min(ml / goalMl, 1);
  const goalAngleDeg = -90; // goal marker always at top
  const goalRad = (goalAngleDeg * Math.PI) / 180;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const markerX = cx + RADIUS * Math.cos(goalRad);
  const markerY = cy + RADIUS * Math.sin(goalRad);

  const strokeDashoffset = animVal.interpolate({
    inputRange: [0, goalMl],
    outputRange: [CIRCUMFERENCE, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        {/* Track */}
        <Circle
          cx={cx} cy={cy} r={RADIUS}
          stroke={TRACK_COLOR} strokeWidth={STROKE} fill="transparent"
        />
        {/* Fill — animated */}
        <AnimatedCircle
          cx={cx} cy={cy} r={RADIUS}
          stroke={WATER_COLOR} strokeWidth={STROKE} fill="transparent"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {/* Goal marker dot */}
        <Circle cx={markerX} cy={markerY} r={5} fill={GOAL_COLOR} />
      </Svg>
      <View style={styles.label}>
        <Text style={styles.value}>{mlLabel(ml)}</Text>
        <Text style={styles.goal}>of {mlLabel(goalMl)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  svg: { position: 'absolute' },
  label: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 22, fontWeight: '700', color: '#111111' },
  goal: { fontSize: 11, color: '#999999', marginTop: 2 },
});
