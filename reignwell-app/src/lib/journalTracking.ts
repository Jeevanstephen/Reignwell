import AsyncStorage from '@react-native-async-storage/async-storage';

const JOURNAL_KEY = 'rw_journal';

export type Mood = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

export interface JournalEntry {
  id: string;
  text: string;
  mood: Mood;
  timestamp: string; // ISO
  date: string;      // YYYY-MM-DD
}

async function readAll(): Promise<JournalEntry[]> {
  const raw = await AsyncStorage.getItem(JOURNAL_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function writeAll(entries: JournalEntry[]): Promise<void> {
  await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
}

export async function addJournalEntry(text: string, mood: Mood): Promise<JournalEntry> {
  const now = new Date();
  const entry: JournalEntry = {
    id: `j_${Date.now()}`,
    text: text.trim(),
    mood,
    timestamp: now.toISOString(),
    date: now.toISOString().slice(0, 10),
  };
  const all = await readAll();
  await writeAll([entry, ...all]);
  return entry;
}

export async function getJournalEntries(limit = 50): Promise<JournalEntry[]> {
  const all = await readAll();
  return all.slice(0, limit);
}

export async function getTodayEntry(): Promise<JournalEntry | null> {
  const today = new Date().toISOString().slice(0, 10);
  const all = await readAll();
  return all.find(e => e.date === today) ?? null;
}

export async function updateJournalEntry(
  id: string,
  updates: Partial<Pick<JournalEntry, 'text' | 'mood'>>,
): Promise<JournalEntry | null> {
  const all = await readAll();
  const idx = all.findIndex(e => e.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates };
  await writeAll(all);
  return all[idx];
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const all = await readAll();
  await writeAll(all.filter(e => e.id !== id));
}
