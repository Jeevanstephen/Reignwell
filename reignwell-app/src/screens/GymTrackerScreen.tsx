import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { exercises, Exercise } from '../lib/exerciseDatabase';
import {
  startWorkout, logSet, finishWorkout,
} from '../lib/workoutTracking';

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

interface LocalSet { reps: number; kg: number }
interface LocalExercise { exerciseId: string; sets: LocalSet[] }

export default function GymTrackerScreen() {
  const navigation = useNavigation();
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [search, setSearch] = useState('');
  const [loggedExercises, setLoggedExercises] = useState<LocalExercise[]>([]);

  // Set logger modal
  const [setModalEx, setSetModalEx] = useState<Exercise | null>(null);
  const [reps, setReps] = useState('');
  const [kg, setKg] = useState('');

  // Summary modal
  const [summary, setSummary] = useState<{
    sets: number; muscles: string[]; duration: number; volume: number;
  } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleStart = () => {
    const id = startWorkout();
    setWorkoutId(id);
    setElapsed(0);
    setLoggedExercises([]);
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  };

  const handleFinish = async () => {
    if (!workoutId) return;
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const result = await finishWorkout(workoutId);
      const muscleIds = loggedExercises.map(e => e.exerciseId);
      const muscles = [...new Set(
        muscleIds.map(id => exercises.find(ex => ex.id === id)?.muscle ?? '').filter(Boolean)
      )];
      setSummary({ sets: result.totalSets, muscles, duration: elapsed, volume: result.totalVolume });
      setWorkoutId(null);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not finish workout.');
    }
  };

  const handleAddSet = () => {
    if (!setModalEx || !workoutId || !reps.trim() || !kg.trim()) return;
    const repsNum = parseInt(reps);
    const kgNum = parseFloat(kg);
    logSet(workoutId, setModalEx.id, 1, repsNum, kgNum);
    setLoggedExercises(prev => {
      const existing = prev.find(e => e.exerciseId === setModalEx.id);
      if (existing) {
        return prev.map(e => e.exerciseId === setModalEx.id
          ? { ...e, sets: [...e.sets, { reps: repsNum, kg: kgNum }] }
          : e
        );
      }
      return [...prev, { exerciseId: setModalEx.id, sets: [{ reps: repsNum, kg: kgNum }] }];
    });
    setReps('');
    setKg('');
  };

  const filtered = search.trim()
    ? exercises.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.muscle.toLowerCase().includes(search.toLowerCase())
      )
    : exercises;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.heading}>Today's Workout</Text>
          {workoutId && <Text style={styles.timer}>⏱ {formatDuration(elapsed)}</Text>}
        </View>
        {workoutId ? (
          <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
            <Text style={styles.finishBtnText}>Finish</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
            <Text style={styles.startBtnText}>Start</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Active sets */}
        {loggedExercises.length > 0 && (
          <View style={styles.activeSection}>
            <Text style={styles.sectionLabel}>LOGGED</Text>
            {loggedExercises.map(le => {
              const ex = exercises.find(e => e.id === le.exerciseId);
              if (!ex) return null;
              return (
                <View key={le.exerciseId} style={styles.loggedCard}>
                  <Text style={styles.loggedExName}>{ex.emoji} {ex.name}</Text>
                  {le.sets.map((s, i) => (
                    <Text key={i} style={styles.setRow}>Set {i + 1}: {s.reps} reps × {s.kg} kg</Text>
                  ))}
                </View>
              );
            })}
          </View>
        )}

        {/* Exercise list */}
        <Text style={styles.sectionLabel}>EXERCISES</Text>
        <TextInput
          style={styles.search}
          placeholder="Search by name or muscle…"
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />

        {filtered.map(ex => (
          <TouchableOpacity
            key={ex.id}
            style={styles.exRow}
            onPress={() => {
              if (!workoutId) {
                Alert.alert('Start workout first', 'Tap "Start" to begin your session.');
                return;
              }
              setSetModalEx(ex);
            }}
          >
            <Text style={styles.exEmoji}>{ex.emoji}</Text>
            <View style={styles.exInfo}>
              <Text style={styles.exName}>{ex.name}</Text>
              <Text style={styles.exMuscle}>{ex.muscle}</Text>
            </View>
            <Text style={styles.exAdd}>+ Add</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Set Logger Modal */}
      <Modal visible={!!setModalEx} animationType="slide" presentationStyle="pageSheet">
        <View style={setModal.container}>
          <View style={setModal.header}>
            <Text style={setModal.title}>{setModalEx?.emoji} {setModalEx?.name}</Text>
            <TouchableOpacity onPress={() => { setSetModalEx(null); setReps(''); setKg(''); }}>
              <Text style={setModal.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={setModal.body}>
            <Text style={setModal.label}>Reps</Text>
            <TextInput
              style={setModal.input}
              keyboardType="number-pad"
              placeholder="e.g. 10"
              placeholderTextColor="#999"
              value={reps}
              onChangeText={setReps}
            />
            <Text style={setModal.label}>Weight (kg)</Text>
            <TextInput
              style={setModal.input}
              keyboardType="decimal-pad"
              placeholder="e.g. 60"
              placeholderTextColor="#999"
              value={kg}
              onChangeText={setKg}
            />
            <TouchableOpacity
              style={[setModal.addBtn, (!reps.trim() || !kg.trim()) && setModal.addBtnDisabled]}
              onPress={handleAddSet}
              disabled={!reps.trim() || !kg.trim()}
            >
              <Text style={setModal.addBtnText}>+ Add Set</Text>
            </TouchableOpacity>

            {loggedExercises.find(e => e.exerciseId === setModalEx?.id)?.sets.map((s, i) => (
              <Text key={i} style={setModal.setRow}>Set {i + 1}: {s.reps} reps × {s.kg} kg ✓</Text>
            ))}
          </View>
        </View>
      </Modal>

      {/* Summary Modal */}
      <Modal visible={!!summary} animationType="fade" transparent>
        <View style={summaryModal.overlay}>
          <View style={summaryModal.card}>
            <Text style={summaryModal.title}>Workout Complete 🎉</Text>
            <Text style={summaryModal.stat}>⏱ Duration: {summary ? formatDuration(summary.duration) : ''}</Text>
            <Text style={summaryModal.stat}>💪 Total Sets: {summary?.sets}</Text>
            <Text style={summaryModal.stat}>🏋️ Volume: {summary?.volume} kg</Text>
            <Text style={summaryModal.stat}>
              🎯 Muscles: {summary?.muscles.join(', ') || 'None'}
            </Text>
            <TouchableOpacity style={summaryModal.btn} onPress={() => { setSummary(null); navigation.goBack(); }}>
              <Text style={summaryModal.btnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#111111', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 24, color: '#FFFFFF' },
  heading: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  timer: { fontSize: 13, color: '#C9A84C', marginTop: 2 },
  startBtn: { backgroundColor: '#C9A84C', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  startBtnText: { fontSize: 14, fontWeight: '700', color: '#111111' },
  finishBtn: { backgroundColor: '#EF4444', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  finishBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  content: { padding: 20, paddingBottom: 32 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: '#999999', letterSpacing: 1.5, marginBottom: 10, marginTop: 8 },
  activeSection: { marginBottom: 20 },
  loggedCard: { backgroundColor: '#F7F7F7', borderRadius: 12, padding: 14, marginBottom: 10 },
  loggedExName: { fontSize: 15, fontWeight: '700', color: '#111111', marginBottom: 6 },
  setRow: { fontSize: 13, color: '#555555', marginBottom: 2 },
  search: {
    borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    color: '#111111', backgroundColor: '#FAFAFA', marginBottom: 12,
  },
  exRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  exEmoji: { fontSize: 24, marginRight: 12 },
  exInfo: { flex: 1 },
  exName: { fontSize: 15, fontWeight: '600', color: '#111111' },
  exMuscle: { fontSize: 12, color: '#999999', marginTop: 2 },
  exAdd: { fontSize: 13, color: '#C9A84C', fontWeight: '700' },
});

const setModal = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingTop: 24, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111111' },
  close: { fontSize: 18, color: '#999999' },
  body: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#555555', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16,
    color: '#111111', backgroundColor: '#FAFAFA',
  },
  addBtn: {
    backgroundColor: '#111111', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 24,
  },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  setRow: { fontSize: 14, color: '#22C55E', marginTop: 10, fontWeight: '600' },
});

const summaryModal = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, width: '100%' },
  title: { fontSize: 22, fontWeight: '700', color: '#111111', marginBottom: 20, textAlign: 'center' },
  stat: { fontSize: 16, color: '#333333', marginBottom: 10 },
  btn: {
    backgroundColor: '#C9A84C', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 24,
  },
  btnText: { color: '#111111', fontSize: 16, fontWeight: '700' },
});
