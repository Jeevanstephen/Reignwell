import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';

const INITIAL_SUPPLEMENTS = [
  { id: '1', name: 'Vitamin D3', dose: '2000 IU', timing: 'Morning with food', taken: false, emoji: '☀️' },
  { id: '2', name: 'Omega-3', dose: '1000 mg', timing: 'Morning with food', taken: true, emoji: '🐟' },
  { id: '3', name: 'Magnesium Glycinate', dose: '400 mg', timing: 'Evening', taken: false, emoji: '💊' },
  { id: '4', name: 'Zinc', dose: '15 mg', timing: 'With dinner', taken: true, emoji: '⚡' },
  { id: '5', name: 'B12', dose: '1000 mcg', timing: 'Morning', taken: false, emoji: '🔋' },
  { id: '6', name: 'Iron', dose: '18 mg', timing: 'Morning, empty stomach', taken: false, emoji: '🩸' },
];

export default function SupplementsScreen() {
  const [supplements, setSupplements] = useState(INITIAL_SUPPLEMENTS);

  const toggle = (id: string) => {
    setSupplements(prev =>
      prev.map(s => s.id === id ? { ...s, taken: !s.taken } : s)
    );
  };

  const takenCount = supplements.filter(s => s.taken).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Supplements</Text>
          <Text style={styles.sub}>{takenCount} of {supplements.length} taken today</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(takenCount / supplements.length) * 100}%` as any }]} />
      </View>

      <Text style={styles.sectionTitle}>Today's Stack</Text>
      {supplements.map((s) => (
        <View key={s.id} style={[styles.row, s.taken && styles.rowTaken]}>
          <Text style={styles.emoji}>{s.emoji}</Text>
          <View style={styles.info}>
            <Text style={[styles.name, s.taken && styles.nameTaken]}>{s.name}</Text>
            <Text style={styles.detail}>{s.dose} · {s.timing}</Text>
          </View>
          <Switch
            value={s.taken}
            onValueChange={() => toggle(s.id)}
            trackColor={{ false: '#E0E0E0', true: '#C9A84C' }}
            thumbColor={s.taken ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  heading: { fontSize: 28, fontWeight: '700', color: '#111111' },
  sub: { fontSize: 13, color: '#999999', marginTop: 2 },
  addBtn: { backgroundColor: '#C9A84C', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
  addBtnText: { color: '#111111', fontSize: 13, fontWeight: '700' },
  progressTrack: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, marginBottom: 24 },
  progressFill: { height: 6, backgroundColor: '#C9A84C', borderRadius: 3 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111111', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  rowTaken: { opacity: 0.6 },
  emoji: { fontSize: 26, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#111111' },
  nameTaken: { textDecorationLine: 'line-through', color: '#999999' },
  detail: { fontSize: 12, color: '#999999', marginTop: 2 },
});
