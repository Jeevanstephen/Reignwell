import AsyncStorage from '@react-native-async-storage/async-storage';

const HABIT_LIST_KEY = 'rw_habit_list';
const HABIT_LOG_KEY  = 'rw_habit_log';

export interface Habit {
  id: string;
  label: string;
  emoji: string;
  builtIn: boolean;
}

export interface HabitDay {
  habitId: string;
  done: boolean;
}

const DEFAULT_HABITS: Habit[] = [
  { id: 'h1', label: 'Drank enough water',  emoji: '💧', builtIn: true },
  { id: 'h2', label: 'Got some daylight',   emoji: '☀️', builtIn: true },
  { id: 'h3', label: 'No phone in bed',     emoji: '📵', builtIn: true },
  { id: 'h4', label: 'Took a walk',         emoji: '🚶', builtIn: true },
  { id: 'h5', label: 'Mindful moment',      emoji: '🧘', builtIn: true },
];

function isoDate(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function prevDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return isoDate(d);
}

// --- Habit list ---

export async function getHabitList(): Promise<Habit[]> {
  const raw = await AsyncStorage.getItem(HABIT_LIST_KEY);
  return raw ? JSON.parse(raw) : DEFAULT_HABITS;
}

export async function addCustomHabit(label: string, emoji = '✅'): Promise<Habit> {
  const list = await getHabitList();
  const habit: Habit = {
    id: `ch_${Date.now()}`,
    label: label.trim(),
    emoji,
    builtIn: false,
  };
  await AsyncStorage.setItem(HABIT_LIST_KEY, JSON.stringify([...list, habit]));
  return habit;
}

// --- Daily log ---

type DayLog = Record<string, boolean>; // habitId → done
type FullLog = Record<string, DayLog>; // date → DayLog

async function readLog(): Promise<FullLog> {
  const raw = await AsyncStorage.getItem(HABIT_LOG_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function writeLog(log: FullLog): Promise<void> {
  await AsyncStorage.setItem(HABIT_LOG_KEY, JSON.stringify(log));
}

export async function getHabitsToday(): Promise<HabitDay[]> {
  const [list, log] = await Promise.all([getHabitList(), readLog()]);
  const today = isoDate();
  const dayLog = log[today] ?? {};
  return list.map(h => ({ habitId: h.id, done: dayLog[h.id] ?? false }));
}

export async function toggleHabit(id: string, done: boolean): Promise<void> {
  const log = await readLog();
  const today = isoDate();
  log[today] = { ...(log[today] ?? {}), [id]: done };
  await writeLog(log);
}

// --- Streak ---

export async function getStreak(id: string): Promise<number> {
  const log = await readLog();
  let streak = 0;
  let day = isoDate();

  // Don't penalise if today isn't done yet — start checking from yesterday
  if (!(log[day]?.[id])) {
    day = prevDay(day);
  }

  while (log[day]?.[id]) {
    streak++;
    day = prevDay(day);
    if (streak > 365) break; // safety cap
  }
  return streak;
}

export async function getAllStreaks(): Promise<Record<string, number>> {
  const list = await getHabitList();
  const entries = await Promise.all(
    list.map(async h => [h.id, await getStreak(h.id)] as [string, number])
  );
  return Object.fromEntries(entries);
}
