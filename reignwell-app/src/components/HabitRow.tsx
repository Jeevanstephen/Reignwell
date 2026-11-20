import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface Props {
  icon: string;
  name: string;
  streak: number;
  checked: boolean;
  onToggle: () => void;
}

export default function HabitRow({ icon, name, streak, checked, onToggle }: Props) {
  const scale = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const opacity = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: checked ? 1 : 0,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: checked ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [checked]);

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.circle, checked && styles.circleChecked]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Animated.Text style={[styles.check, { opacity, transform: [{ scale }] }]}>
          ✓
        </Animated.Text>
      </TouchableOpacity>

      <Text style={styles.icon}>{icon}</Text>

      <Text style={[styles.name, checked && styles.nameChecked]} numberOfLines={1}>
        {name}
      </Text>

      {checked && (
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 {streak} days</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: 10,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleChecked: {
    borderColor: '#22C55E',
    backgroundColor: '#22C55E',
  },
  check: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: 16,
  },
  icon: { fontSize: 18 },
  name: { flex: 1, fontSize: 14, color: '#111111', fontWeight: '500' },
  nameChecked: {
    textDecorationLine: 'line-through',
    color: '#AAAAAA',
  },
  streakBadge: {
    backgroundColor: '#FBF6EC',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  streakText: { fontSize: 11, color: '#C9A84C', fontWeight: '700' },
});
