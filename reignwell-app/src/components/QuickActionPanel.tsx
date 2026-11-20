import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Modal, Pressable, ToastAndroid, Platform, Alert,
} from 'react-native';

function comingSoon(feature: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(`${feature} — coming soon!`, ToastAndroid.SHORT);
  } else {
    Alert.alert(feature, 'Coming soon!');
  }
}

interface Props {
  onNavigate: (screen: string) => void;
}

interface ActionItem {
  icon: string;
  label: string;
  onPress: () => void;
}

export default function QuickActionPanel({ onNavigate }: Props) {
  const [open, setOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const show = () => {
    setOpen(true);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, friction: 8, tension: 100 }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(rotateAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const hide = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 300, duration: 220, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(rotateAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setOpen(false));
  };

  const press = (fn: () => void) => {
    hide();
    setTimeout(fn, 220);
  };

  const FOOD_WATER: ActionItem[][] = [
    [
      { icon: '📝', label: 'Describe Food', onPress: () => onNavigate('FoodLog') },
      { icon: '⚡', label: 'Quick Add',     onPress: () => onNavigate('FoodLog') },
      { icon: '📷', label: 'Scan',          onPress: () => onNavigate('FoodLog') },
    ],
    [
      { icon: '🎙️', label: 'Voice Log', onPress: () => comingSoon('Voice Log') },
      { icon: '🍽️', label: 'Custom Add', onPress: () => onNavigate('FoodLog') },
      { icon: '💧', label: 'Water',      onPress: () => onNavigate('Dashboard') },
    ],
  ];

  const MY_DAY: ActionItem[] = [
    { icon: '🏋️', label: 'Workout',   onPress: () => onNavigate('GymTracker') },
    { icon: '🍴', label: 'Meal Ideas', onPress: () => onNavigate('MealSuggestions') },
    { icon: '💊', label: 'Regimens',  onPress: () => onNavigate('Regimens') },
    { icon: '📖', label: 'Journal',   onPress: () => comingSoon('Journal') },
  ];

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  return (
    <>
      {/* Floating button */}
      <Animated.View style={[styles.fab, { transform: [{ rotate: spin }] }]}>
        <TouchableOpacity style={styles.fabInner} onPress={open ? hide : show} activeOpacity={0.85}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom sheet */}
      <Modal visible={open} transparent animationType="none">
        <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={hide} />
        </Animated.View>

        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.handle} />

          {/* FOOD & WATER */}
          <Text style={styles.sectionLabel}>FOOD & WATER</Text>
          {FOOD_WATER.map((row, ri) => (
            <View key={ri} style={styles.actionRow}>
              {row.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.actionBtn}
                  onPress={() => press(item.onPress)}
                >
                  <View style={styles.actionIcon}>
                    <Text style={styles.actionEmoji}>{item.icon}</Text>
                  </View>
                  <Text style={styles.actionLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* MY DAY */}
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>MY DAY</Text>
          {[MY_DAY.slice(0, 3), MY_DAY.slice(3)].filter(r => r.length > 0).map((row, ri) => (
            <View key={ri} style={styles.actionRow}>
              {row.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.actionBtn}
                  onPress={() => press(item.onPress)}
                >
                  <View style={styles.actionIcon}>
                    <Text style={styles.actionEmoji}>{item.icon}</Text>
                  </View>
                  <Text style={styles.actionLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <View style={styles.safeBottom} />
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 78,
    alignSelf: 'center',
    // need left: 0 right: 0 for alignSelf to work inside a relative container
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  fabInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#C9A84C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  fabIcon: { fontSize: 28, color: '#111111', fontWeight: '300', lineHeight: 32 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 20,
  },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: '#999999', letterSpacing: 1.5, marginBottom: 12 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  actionBtn: { alignItems: 'center', width: 72 },
  actionIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  actionEmoji: { fontSize: 22 },
  actionLabel: { fontSize: 11, color: '#333333', fontWeight: '600', textAlign: 'center' },
  safeBottom: { height: 20 },
});
