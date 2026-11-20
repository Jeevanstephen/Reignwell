import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';

const MEALS = [
  { id: '1', emoji: '🥗', name: 'Greek Salad', kcal: 320, time: '8:30 AM' },
  { id: '2', emoji: '🍌', name: 'Banana & Almond Butter', kcal: 210, time: '10:15 AM' },
  { id: '3', emoji: '🍗', name: 'Grilled Chicken Bowl', kcal: 540, time: '12:45 PM' },
  { id: '4', emoji: '🫐', name: 'Blueberry Smoothie', kcal: 185, time: '3:00 PM' },
];

const MACROS = { protein: 68, carbs: 142, fat: 48 };
const GOALS = { protein: 120, carbs: 200, fat: 65 };

function MacroBar({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const pct = Math.min(value / goal, 1);
  return (
    <View style={macroStyles.wrapper}>
      <View style={macroStyles.labelRow}>
        <Text style={macroStyles.label}>{label}</Text>
        <Text style={macroStyles.values}>{value}g / {goal}g</Text>
      </View>
      <View style={macroStyles.track}>
        <View style={[macroStyles.fill, { width: `${pct * 100}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function FoodLogScreen() {
  const totalKcal = MEALS.reduce((sum, m) => sum + m.kcal, 0);
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Food Log</Text>
      <Text style={styles.sub}>Today · {totalKcal} kcal</Text>

      {/* Macro Summary */}
      <View style={styles.macroCard}>
        <Text style={styles.macroTitle}>Macros</Text>
        <MacroBar label="Protein" value={MACROS.protein} goal={GOALS.protein} color="#22C55E" />
        <MacroBar label="Carbs" value={MACROS.carbs} goal={GOALS.carbs} color="#3B82F6" />
        <MacroBar label="Fat" value={MACROS.fat} goal={GOALS.fat} color="#F59E0B" />
      </View>

      {/* AI Camera Button */}
      <Animated.View style={[styles.cameraBtn, { opacity: glowOpacity }]}>
        <TouchableOpacity style={styles.cameraBtnInner}>
          <Text style={styles.cameraIcon}>📸</Text>
          <Text style={styles.cameraBtnText}>Log with AI Camera</Text>
          <Text style={styles.cameraBtnSub}>Snap a photo to auto-log nutrients</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Meals List */}
      <Text style={styles.sectionTitle}>Today's Meals</Text>
      {MEALS.map((meal) => (
        <View key={meal.id} style={styles.mealRow}>
          <Text style={styles.mealEmoji}>{meal.emoji}</Text>
          <View style={styles.mealInfo}>
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.mealTime}>{meal.time}</Text>
          </View>
          <Text style={styles.mealKcal}>{meal.kcal} kcal</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.addBtn}>
        <Text style={styles.addBtnText}>+ Add manually</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const macroStyles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: 13, color: '#555555', fontWeight: '500' },
  values: { fontSize: 12, color: '#999999' },
  track: { height: 6, backgroundColor: '#E8E8E8', borderRadius: 3 },
  fill: { height: 6, borderRadius: 3 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 32 },
  heading: { fontSize: 28, fontWeight: '700', color: '#111111' },
  sub: { fontSize: 14, color: '#999999', marginBottom: 20 },
  macroCard: { backgroundColor: '#F7F7F7', borderRadius: 16, padding: 16, marginBottom: 20 },
  macroTitle: { fontSize: 13, fontWeight: '700', color: '#111111', marginBottom: 14, letterSpacing: 0.5 },
  cameraBtn: {
    backgroundColor: '#C9A84C',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  cameraBtnInner: { padding: 20, alignItems: 'center' },
  cameraIcon: { fontSize: 32, marginBottom: 8 },
  cameraBtnText: { fontSize: 17, fontWeight: '700', color: '#111111' },
  cameraBtnSub: { fontSize: 12, color: '#5a4a1a', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111111', marginBottom: 12 },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    marginBottom: 10,
  },
  mealEmoji: { fontSize: 28, marginRight: 12 },
  mealInfo: { flex: 1 },
  mealName: { fontSize: 15, fontWeight: '600', color: '#111111' },
  mealTime: { fontSize: 12, color: '#999999', marginTop: 2 },
  mealKcal: { fontSize: 14, fontWeight: '600', color: '#555555' },
  addBtn: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnText: { color: '#666666', fontSize: 14, fontWeight: '500' },
});
