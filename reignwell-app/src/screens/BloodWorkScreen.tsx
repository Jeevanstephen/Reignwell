import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const BIOMARKERS = [
  { id: '1', name: 'Glucose', value: '94', unit: 'mg/dL', date: 'Nov 18', status: 'green', range: '70–99' },
  { id: '2', name: 'HbA1c', value: '5.4', unit: '%', date: 'Nov 18', status: 'green', range: '<5.7' },
  { id: '3', name: 'Total Cholesterol', value: '218', unit: 'mg/dL', date: 'Nov 10', status: 'amber', range: '<200' },
  { id: '4', name: 'LDL', value: '142', unit: 'mg/dL', date: 'Nov 10', status: 'red', range: '<100' },
  { id: '5', name: 'HDL', value: '58', unit: 'mg/dL', date: 'Nov 10', status: 'green', range: '>40' },
  { id: '6', name: 'Triglycerides', value: '88', unit: 'mg/dL', date: 'Nov 10', status: 'green', range: '<150' },
  { id: '7', name: 'Vitamin D', value: '22', unit: 'ng/mL', date: 'Oct 30', status: 'red', range: '30–100' },
  { id: '8', name: 'Iron', value: '78', unit: 'µg/dL', date: 'Oct 30', status: 'green', range: '60–170' },
];

const STATUS_COLORS: Record<string, string> = {
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
};

const STATUS_BG: Record<string, string> = {
  green: '#F0FDF4',
  amber: '#FFFBEB',
  red: '#FEF2F2',
};

const STATUS_LABELS: Record<string, string> = {
  green: 'Normal',
  amber: 'Borderline',
  red: 'High',
};

export default function BloodWorkScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Blood Work</Text>
          <Text style={styles.sub}>Last updated Nov 18, 2026</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add Entry</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        {[['3', 'Normal'], ['2', 'Borderline'], ['3', 'High']].map(([count, label], i) => (
          <View key={label} style={[styles.summaryTile, { borderColor: [STATUS_COLORS.green, STATUS_COLORS.amber, STATUS_COLORS.red][i] }]}>
            <Text style={[styles.summaryCount, { color: [STATUS_COLORS.green, STATUS_COLORS.amber, STATUS_COLORS.red][i] }]}>{count}</Text>
            <Text style={styles.summaryLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Recent Results</Text>
      {BIOMARKERS.map((b) => (
        <View key={b.id} style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.markerName}>{b.name}</Text>
            <Text style={styles.markerDate}>{b.date} · Range: {b.range} {b.unit}</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.markerValue}>{b.value} <Text style={styles.markerUnit}>{b.unit}</Text></Text>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[b.status] }]}>
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[b.status] }]} />
              <Text style={[styles.statusText, { color: STATUS_COLORS[b.status] }]}>{STATUS_LABELS[b.status]}</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  heading: { fontSize: 28, fontWeight: '700', color: '#111111' },
  sub: { fontSize: 13, color: '#999999', marginTop: 2 },
  addBtn: { backgroundColor: '#C9A84C', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
  addBtnText: { color: '#111111', fontSize: 13, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  summaryTile: { flex: 1, borderWidth: 1.5, borderRadius: 12, padding: 12, alignItems: 'center' },
  summaryCount: { fontSize: 24, fontWeight: '700' },
  summaryLabel: { fontSize: 11, color: '#666666', marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111111', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  rowLeft: { flex: 1 },
  markerName: { fontSize: 15, fontWeight: '600', color: '#111111' },
  markerDate: { fontSize: 12, color: '#999999', marginTop: 2 },
  rowRight: { alignItems: 'flex-end', gap: 6 },
  markerValue: { fontSize: 16, fontWeight: '700', color: '#111111' },
  markerUnit: { fontSize: 12, fontWeight: '400', color: '#666666' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
});
