import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import ScoreRing from '../components/ScoreRing';
import WaterRing from '../components/WaterRing';
import HabitRow from '../components/HabitRow';
import { addWater, undoWater, getWaterToday, GOAL_ML } from '../lib/waterTracker';
import { useHabits } from '../hooks/useHabits';
import { MainTabParamList } from '../navigation/MainNavigator';

const NUTRIENTS = [
  { name: 'Iron', value: 72, unit: '%', status: 'green' },
  { name: 'Vitamin D', value: 38, unit: '%', status: 'red' },
  { name: 'B12', value: 65, unit: '%', status: 'amber' },
  { name: 'Calcium', value: 85, unit: '%', status: 'green' },
  { name: 'Omega-3', value: 44, unit: '%', status: 'amber' },
  { name: 'Zinc', value: 91, unit: '%', status: 'green' },
];

const STATUS_COLORS: Record<string, string> = {
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
};

const QUICK_ACTIONS = [
  { icon: '🍽️', label: 'Log Food', tab: 'FoodLog' as const },
  { icon: '🩸', label: 'Blood', tab: 'BloodWork' as const },
  { icon: '💊', label: 'Supps', tab: 'Supplements' as const },
  { icon: '✦', label: 'Coach', tab: 'Coach' as const },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const name = (user as any)?.user_metadata?.full_name?.split(' ')[0] ?? 'there';
  const [waterMl, setWaterMl] = useState(getWaterToday());

  const handleAddWater = useCallback((ml: number) => {
    addWater(ml);
    setWaterMl(getWaterToday());
  }, []);

  const handleUndoWater = useCallback(() => {
    undoWater();
    setWaterMl(getWaterToday());
  }, []);

  const { habits: habitList, toggle: toggleHabit } = useHabits();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{name} 👋</Text>
        </View>
        <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {QUICK_ACTIONS.map((a) => (
          <TouchableOpacity
            key={a.tab}
            style={styles.quickAction}
            onPress={() => navigation.navigate(a.tab)}
          >
            <Text style={styles.quickActionIcon}>{a.icon}</Text>
            <Text style={styles.quickActionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Daily Score */}
      <View style={styles.scoreCard}>
        <Text style={styles.cardLabel}>Daily Health Score</Text>
        <View style={styles.scoreRow}>
          <ScoreRing score={74} />
          <View style={styles.scoreDetails}>
            <Text style={styles.scoreTitle}>Looking good!</Text>
            <Text style={styles.scoreSubtitle}>Your score improved 6 pts from yesterday. Keep it up.</Text>
          </View>
        </View>
      </View>

      {/* Nutrient Grid */}
      <Text style={styles.sectionTitle}>Nutrient Status</Text>
      <View style={styles.nutrientGrid}>
        {NUTRIENTS.map((n) => (
          <View key={n.name} style={styles.nutrientTile}>
            <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[n.status] }]} />
            <Text style={styles.nutrientValue}>{n.value}{n.unit}</Text>
            <Text style={styles.nutrientName}>{n.name}</Text>
          </View>
        ))}
      </View>

      {/* Water Tracker */}
      <View style={styles.waterCard}>
        <Text style={styles.cardLabel}>HYDRATION</Text>
        <View style={styles.waterRow}>
          <WaterRing ml={waterMl} goalMl={GOAL_ML} />
          <View style={styles.waterControls}>
            <Text style={styles.waterHint}>Quick add</Text>
            <TouchableOpacity style={styles.waterPill} onPress={() => handleAddWater(250)}>
              <Text style={styles.waterPillText}>+ 250 ml</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.waterPill} onPress={() => handleAddWater(500)}>
              <Text style={styles.waterPillText}>+ 500 ml</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.undoBtn} onPress={handleUndoWater}>
              <Text style={styles.undoBtnText}>− Undo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Today's Habits */}
      <View style={styles.habitsCard}>
        <View style={styles.habitsHeader}>
          <Text style={styles.cardLabel}>TODAY'S HABITS</Text>
          <Text style={styles.habitsDone}>
            {habitList.filter((h: any) => h.done).length}/{habitList.length} done
          </Text>
        </View>
        {habitList.map((h: any) => (
          <HabitRow
            key={h.id}
            icon={h.emoji}
            name={h.label}
            streak={h.streak}
            checked={h.done}
            onToggle={() => toggleHabit(h.id)}
          />
        ))}
      </View>

      {/* Priority Action */}
      <View style={styles.priorityCard}>
        <Text style={styles.priorityLabel}>Today's Priority</Text>
        <Text style={styles.priorityTitle}>☀️ Boost your Vitamin D</Text>
        <Text style={styles.priorityText}>
          Your Vitamin D is at 38% — below optimal range. Consider 15 mins of sun exposure or a D3 supplement.
        </Text>
        <TouchableOpacity style={styles.priorityBtn} onPress={() => navigation.navigate('Supplements')}>
          <Text style={styles.priorityBtnText}>View Supplements</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { fontSize: 14, color: '#666666' },
  name: { fontSize: 24, fontWeight: '700', color: '#111111' },
  signOutBtn: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8 },
  signOutText: { fontSize: 12, color: '#666666' },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  quickAction: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  quickActionIcon: { fontSize: 22, marginBottom: 6 },
  quickActionLabel: { fontSize: 11, fontWeight: '600', color: '#333333' },
  scoreCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  cardLabel: { fontSize: 12, color: '#999999', fontWeight: '600', letterSpacing: 1, marginBottom: 16 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  scoreDetails: { flex: 1 },
  scoreTitle: { fontSize: 18, fontWeight: '700', color: '#111111', marginBottom: 6 },
  scoreSubtitle: { fontSize: 13, color: '#666666', lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111111', marginBottom: 12 },
  nutrientGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  nutrientTile: {
    width: '30%',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 8 },
  nutrientValue: { fontSize: 18, fontWeight: '700', color: '#111111' },
  nutrientName: { fontSize: 11, color: '#666666', marginTop: 2, textAlign: 'center' },
  habitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 20,
    marginBottom: 24,
  },
  habitsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  habitsDone: { fontSize: 12, color: '#999999', fontWeight: '600' },
  waterCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  waterRow: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  waterControls: { flex: 1, gap: 8 },
  waterHint: { fontSize: 11, color: '#999999', fontWeight: '600', marginBottom: 2 },
  waterPill: {
    backgroundColor: '#EAF7FC',
    borderRadius: 20,
    paddingVertical: 9,
    alignItems: 'center',
  },
  waterPillText: { fontSize: 14, fontWeight: '700', color: '#1a7fa0' },
  undoBtn: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingVertical: 7,
    alignItems: 'center',
  },
  undoBtnText: { fontSize: 13, color: '#999999', fontWeight: '500' },
  priorityCard: {
    borderWidth: 1.5,
    borderColor: '#C9A84C',
    borderRadius: 16,
    padding: 20,
  },
  priorityLabel: { fontSize: 11, color: '#C9A84C', fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  priorityTitle: { fontSize: 17, fontWeight: '700', color: '#111111', marginBottom: 8 },
  priorityText: { fontSize: 13, color: '#555555', lineHeight: 20, marginBottom: 16 },
  priorityBtn: {
    backgroundColor: '#C9A84C',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  priorityBtnText: { color: '#111111', fontSize: 13, fontWeight: '700' },
});
