import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import ScoreRing from '../components/ScoreRing';

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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const name = user?.user_metadata?.full_name?.split(' ')[0] ?? 'there';

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

      {/* Priority Action */}
      <View style={styles.priorityCard}>
        <Text style={styles.priorityLabel}>Today's Priority</Text>
        <Text style={styles.priorityTitle}>☀️ Boost your Vitamin D</Text>
        <Text style={styles.priorityText}>
          Your Vitamin D is at 38% — below optimal range. Consider 15 mins of sun exposure or a D3 supplement.
        </Text>
        <TouchableOpacity style={styles.priorityBtn}>
          <Text style={styles.priorityBtnText}>Learn more</Text>
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
