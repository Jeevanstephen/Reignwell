import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { markers } from '../lib/bloodMarkers';

// Mock weekly data — Achu wires up real persistence
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CALORIES = [1850, 2100, 1980, 2200, 1750, 2050, 1900];
const WATER_GOAL_HIT = [true, true, false, true, true, false, true]; // 5/7
const HABITS_PCT = [60, 80, 40, 100, 80, 60, 80];
const WORKOUTS = 3;
const CAL_GOAL = 2100;

function CalBar({ day, kcal, goal }: { day: string; kcal: number; goal: number }) {
  const pct = Math.min(kcal / goal, 1.2);
  const over = kcal > goal;
  return (
    <View style={bar.wrapper}>
      <View style={bar.track}>
        <View style={[
          bar.fill,
          { height: `${Math.min(pct, 1) * 100}%` as any },
          over ? bar.fillOver : bar.fillNormal,
        ]} />
        <View style={bar.goalLine} />
      </View>
      <Text style={bar.label}>{day}</Text>
      <Text style={bar.value}>{(kcal / 1000).toFixed(1)}k</Text>
    </View>
  );
}

function WaterDot({ hit }: { hit: boolean }) {
  return (
    <View style={[waterStyle.dot, hit ? waterStyle.dotFilled : waterStyle.dotEmpty]}>
      {hit && <Text style={waterStyle.check}>✓</Text>}
    </View>
  );
}

export default function ProgressScreen() {
  const avgCal = Math.round(CALORIES.reduce((a, b) => a + b) / CALORIES.length);
  const waterDays = WATER_GOAL_HIT.filter(Boolean).length;
  const avgHabits = Math.round(HABITS_PCT.reduce((a, b) => a + b) / HABITS_PCT.length);

  // Last 3 readings for first 3 markers as mini-trend
  const trendMarkers = markers.slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Dark header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Weekly Progress</Text>
        <Text style={styles.sub}>Last 7 days</Text>
      </View>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{avgCal}</Text>
          <Text style={styles.summaryLabel}>Avg Calories</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{waterDays}/7</Text>
          <Text style={styles.summaryLabel}>Water Goal Days</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{avgHabits}%</Text>
          <Text style={styles.summaryLabel}>Habits Done</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{WORKOUTS}</Text>
          <Text style={styles.summaryLabel}>Workouts</Text>
        </View>
      </View>

      {/* Calorie bar chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Calories (7-day)</Text>
        <Text style={styles.cardSub}>Goal: {CAL_GOAL} kcal · Avg: {avgCal} kcal</Text>
        <View style={styles.chartArea}>
          {CALORIES.map((c, i) => (
            <CalBar key={i} day={DAYS[i]} kcal={c} goal={CAL_GOAL} />
          ))}
        </View>
        <View style={styles.chartLegend}>
          <View style={[styles.legendDot, { backgroundColor: '#C9A84C' }]} />
          <Text style={styles.legendText}>On target</Text>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Over goal</Text>
        </View>
      </View>

      {/* Water streak */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Water Streak</Text>
        <Text style={styles.cardSub}>{waterDays} of 7 days hit 2.5L goal</Text>
        <View style={styles.waterRow}>
          {DAYS.map((d, i) => (
            <View key={d} style={waterStyle.cell}>
              <WaterDot hit={WATER_GOAL_HIT[i]} />
              <Text style={waterStyle.dayLabel}>{d.slice(0, 2)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Blood marker mini-trends */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Blood Marker Trends</Text>
        <Text style={styles.cardSub}>Last 3 readings per marker</Text>
        {trendMarkers.map(m => (
          <View key={m.id} style={trendStyle.row}>
            <Text style={trendStyle.name}>{m.name}</Text>
            <View style={trendStyle.readings}>
              {m.readings.slice(0, 3).map((r, i) => (
                <View key={i} style={trendStyle.reading}>
                  <Text style={trendStyle.value}>{r.value}</Text>
                  <Text style={trendStyle.date}>{r.date.slice(5)}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const bar = StyleSheet.create({
  wrapper: { flex: 1, alignItems: 'center', paddingHorizontal: 2 },
  track: {
    width: '80%', height: 100, backgroundColor: '#F0F0F0', borderRadius: 4,
    justifyContent: 'flex-end', overflow: 'hidden', position: 'relative',
  },
  fill: { width: '100%', borderRadius: 4 },
  fillNormal: { backgroundColor: '#C9A84C' },
  fillOver: { backgroundColor: '#EF4444' },
  goalLine: {
    position: 'absolute', left: 0, right: 0,
    height: 1.5, backgroundColor: '#111111',
    top: '17%', // 100% - (goal/goal)*83% ≈ at goal line
  },
  label: { fontSize: 10, color: '#999999', marginTop: 4, fontWeight: '600' },
  value: { fontSize: 9, color: '#777777' },
});

const waterStyle = StyleSheet.create({
  cell: { flex: 1, alignItems: 'center', gap: 4 },
  dot: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  dotFilled: { backgroundColor: '#3BAFDA' },
  dotEmpty: { backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: '#E0E0E0' },
  check: { fontSize: 14, color: '#FFFFFF', fontWeight: '700' },
  dayLabel: { fontSize: 10, color: '#999999', fontWeight: '600' },
});

const trendStyle = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  name: { width: 90, fontSize: 13, fontWeight: '600', color: '#111111' },
  readings: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  reading: { alignItems: 'center' },
  value: { fontSize: 13, fontWeight: '700', color: '#333333' },
  date: { fontSize: 10, color: '#999999', marginTop: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingBottom: 32 },
  header: {
    backgroundColor: '#111111', paddingHorizontal: 20,
    paddingTop: 60, paddingBottom: 24,
  },
  heading: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  sub: { fontSize: 14, color: '#888888', marginTop: 4 },
  summaryRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    padding: 20, paddingBottom: 4,
  },
  summaryCard: {
    flex: 1, minWidth: '45%', backgroundColor: '#F7F7F7',
    borderRadius: 14, padding: 16, alignItems: 'center',
  },
  summaryValue: { fontSize: 22, fontWeight: '700', color: '#111111' },
  summaryLabel: { fontSize: 11, color: '#999999', marginTop: 4, textAlign: 'center' },
  card: {
    margin: 20, marginBottom: 0, backgroundColor: '#FFFFFF',
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F0F0F0',
    marginTop: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111111', marginBottom: 2 },
  cardSub: { fontSize: 12, color: '#999999', marginBottom: 16 },
  chartArea: { flexDirection: 'row', alignItems: 'flex-end', height: 130 },
  chartLegend: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: '#777777', marginRight: 10 },
  waterRow: { flexDirection: 'row', justifyContent: 'space-between' },
});
