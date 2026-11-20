import AsyncStorage from '@react-native-async-storage/async-storage';

const JOURNAL_KEY = 'rw_journal';

export type Mood = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

export const MOOD_EMOJI: Record<Mood, string> = {
  great:    '😄',
  good:     '🙂',
  okay:     '😐',
  bad:      '😔',
  terrible: '😢',
};

export const MOOD_LABEL: Record<Mood, string> = {
  great:    'Great',
  good:     'Good',
  okay:     'Okay',
  bad:      'Bad',
  terrible: 'Terrible',
};

export interface JournalEntry {
  id: string;
  date: string;      // YYYY-MM-DD
  mood: Mood;
  text: string;
  createdAt: string; // ISO timestamp
}

async function readAll(): Promise<JournalEntry[]> {
  const raw = await AsyncStorage.getItem(JOURNAL_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function writeAll(entries: JournalEntry[]): Promise<void> {
  await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
}

export async function saveJournalEntry(mood: Mood, text: string): Promise<JournalEntry> {
  const entry: JournalEntry = {
    id: `j_${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    mood,
    text,
    createdAt: new Date().toISOString(),
  };
  const all = await readAll();
  all.unshift(entry);
  await writeAll(all);
  return entry;
}

export async function getJournalEntries(limit = 30): Promise<JournalEntry[]> {
  const all = await readAll();
  return all.slice(0, limit);
}
