import { useState, useEffect, useCallback } from 'react';
import {
  getHabitList, getHabitsToday, toggleHabit, getAllStreaks, addCustomHabit,
  Habit, HabitDay,
} from '../lib/habitTracking';

export interface HabitWithState extends Habit {
  done: boolean;
  streak: number;
}

export interface HabitsState {
  habits: HabitWithState[];
  completedCount: number;
  totalCount: number;
  pct: number;          // 0–1 completion fraction
  loading: boolean;
  toggle: (id: string) => Promise<void>;
  addHabit: (label: string, emoji?: string) => Promise<void>;
}

export function useHabits(): HabitsState {
  const [habits, setHabits] = useState<HabitWithState[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [list, days, streaks] = await Promise.all([
      getHabitList(),
      getHabitsToday(),
      getAllStreaks(),
    ]);
    const dayMap: Record<string, boolean> = {};
    days.forEach(d => { dayMap[d.habitId] = d.done; });

    setHabits(list.map(h => ({
      ...h,
      done: dayMap[h.id] ?? false,
      streak: streaks[h.id] ?? 0,
    })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = useCallback(async (id: string) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, done: !h.done } : h));
    const current = habits.find(h => h.id === id);
    if (!current) return;
    await toggleHabit(id, !current.done);
    // Reload streaks after toggle so streak count stays accurate
    const streaks = await getAllStreaks();
    setHabits(prev => prev.map(h => ({ ...h, streak: streaks[h.id] ?? h.streak })));
  }, [habits]);

  const addHabit = useCallback(async (label: string, emoji?: string) => {
    const newHabit = await addCustomHabit(label, emoji);
    setHabits(prev => [...prev, { ...newHabit, done: false, streak: 0 }]);
  }, []);

  const completedCount = habits.filter(h => h.done).length;
  const totalCount = habits.length;
  const pct = totalCount > 0 ? completedCount / totalCount : 0;

  return { habits, completedCount, totalCount, pct, loading, toggle, addHabit };
}
