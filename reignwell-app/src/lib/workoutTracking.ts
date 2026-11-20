import AsyncStorage from '@react-native-async-storage/async-storage';

const WORKOUT_LOG_KEY = 'rw_workout_log';

export interface SetEntry {
  sets: number;
  reps: number;
  weightKg: number;
}

export interface CardioEntry {
  durationMin: number;
  distanceKm?: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  type: 'strength' | 'cardio';
  sets?: SetEntry;
  cardio?: CardioEntry;
}

export interface WorkoutSession {
  id: string;
  startedAt: string;   // ISO timestamp
  finishedAt?: string;
  durationMin?: number;
  exercises: WorkoutExercise[];
}

export interface WorkoutSummary {
  id: string;
  durationMin: number;
  exerciseCount: number;
  totalSets: number;
  totalVolume: number;  // sum of sets × reps × weight (kg)
  cardioMin: number;
}

// --- In-memory active workouts ---
const _active: Record<string, WorkoutSession> = {};

// --- Persistence helpers ---

async function readLog(): Promise<WorkoutSession[]> {
  const raw = await AsyncStorage.getItem(WORKOUT_LOG_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function writeLog(sessions: WorkoutSession[]): Promise<void> {
  await AsyncStorage.setItem(WORKOUT_LOG_KEY, JSON.stringify(sessions));
}

// --- Public API ---

export function startWorkout(): string {
  const id = `wkt_${Date.now()}`;
  _active[id] = {
    id,
    startedAt: new Date().toISOString(),
    exercises: [],
  };
  return id;
}

export function logSet(
  workoutId: string,
  exerciseId: string,
  sets: number,
  reps: number,
  weightKg: number,
): void {
  const session = _active[workoutId];
  if (!session) throw new Error(`No active workout with id ${workoutId}`);
  session.exercises.push({
    exerciseId,
    type: 'strength',
    sets: { sets, reps, weightKg },
  });
}

export function logCardio(
  workoutId: string,
  exerciseId: string,
  durationMin: number,
  distanceKm?: number,
): void {
  const session = _active[workoutId];
  if (!session) throw new Error(`No active workout with id ${workoutId}`);
  session.exercises.push({
    exerciseId,
    type: 'cardio',
    cardio: { durationMin, distanceKm },
  });
}

export async function finishWorkout(workoutId: string): Promise<WorkoutSummary> {
  const session = _active[workoutId];
  if (!session) throw new Error(`No active workout with id ${workoutId}`);

  const finishedAt = new Date().toISOString();
  const startMs = new Date(session.startedAt).getTime();
  const durationMin = Math.round((Date.now() - startMs) / 60000);

  session.finishedAt = finishedAt;
  session.durationMin = durationMin;

  const strengthEntries = session.exercises.filter(e => e.type === 'strength');
  const cardioEntries   = session.exercises.filter(e => e.type === 'cardio');

  const totalSets   = strengthEntries.reduce((s, e) => s + (e.sets?.sets ?? 0), 0);
  const totalVolume = strengthEntries.reduce(
    (s, e) => s + (e.sets ? e.sets.sets * e.sets.reps * e.sets.weightKg : 0), 0,
  );
  const cardioMin = cardioEntries.reduce((s, e) => s + (e.cardio?.durationMin ?? 0), 0);

  // Persist
  const history = await readLog();
  history.unshift(session);
  await writeLog(history);
  delete _active[workoutId];

  return {
    id: workoutId,
    durationMin,
    exerciseCount: new Set(session.exercises.map(e => e.exerciseId)).size,
    totalSets,
    totalVolume: Math.round(totalVolume),
    cardioMin,
  };
}

export async function getWorkoutHistory(limit = 20): Promise<WorkoutSession[]> {
  const history = await readLog();
  return history.slice(0, limit);
}

export async function getTodayWorkout(): Promise<WorkoutSession | null> {
  const today = new Date().toISOString().slice(0, 10);
  const history = await readLog();
  return history.find(s => s.startedAt.startsWith(today)) ?? null;
}
