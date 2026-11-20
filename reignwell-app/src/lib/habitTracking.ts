// TODO: Achu replaces with real AsyncStorage persistence

export interface Habit {
  id: string;
  label: string;
  emoji: string;
}

export interface HabitDay {
  habitId: string;
  done: boolean;
  date: string; // YYYY-MM-DD
}

const DEFAULT_HABITS: Habit[] = [
  { id: '1', emoji: '💧', label: 'Drank enough water' },
  { id: '2', emoji: '☀️', label: 'Got some daylight' },
  { id: '3', emoji: '📵', label: 'No phone in bed' },
  { id: '4', emoji: '🚶', label: 'Took a walk' },
  { id: '5', emoji: '🧘', label: 'Mindful moment' },
];

const DEFAULT_STREAKS: Record<string, number> = {
  '1': 3, '2': 7, '3': 1, '4': 5, '5': 2,
};

let _habits: Habit[] = [...DEFAULT_HABITS];
let _today: Record<string, boolean> = {};
let _streaks: Record<string, number> = { ...DEFAULT_STREAKS };

const todayKey = () => new Date().toISOString().slice(0, 10);

export async function getHabitList(): Promise<Habit[]> {
  return _habits;
}

export async function getHabitsToday(): Promise<HabitDay[]> {
  return _habits.map(h => ({ habitId: h.id, done: _today[h.id] ?? false, date: todayKey() }));
}

export async function toggleHabit(id: string, done: boolean): Promise<void> {
  _today[id] = done;
  if (done) {
    _streaks[id] = (_streaks[id] ?? 0) + 1;
  } else {
    _streaks[id] = Math.max(0, (_streaks[id] ?? 1) - 1);
  }
}

export async function getAllStreaks(): Promise<Record<string, number>> {
  return { ..._streaks };
}

export async function addCustomHabit(label: string, emoji = '✅'): Promise<Habit> {
  const habit: Habit = { id: Date.now().toString(), label, emoji };
  _habits.push(habit);
  return habit;
}
