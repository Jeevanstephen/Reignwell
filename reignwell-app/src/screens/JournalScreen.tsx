import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Platform, ToastAndroid, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  saveJournalEntry, getJournalEntries, JournalEntry,
  Mood, MOOD_EMOJI, MOOD_LABEL,
} from '../lib/journalTracking';

const MOODS: Mood[] = ['great', 'good', 'okay', 'bad', 'terrible'];

function showToast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
  else Alert.alert('', msg);
}

export default function JournalScreen() {
  const navigation = useNavigation();
  const [mood, setMood] = useState<Mood>('good');
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    const list = await getJournalEntries();
    setEntries(list);
    setLoading(false);
  }, []);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    await saveJournalEntry(mood, text.trim());
    setSaving(false);
    showToast('Entry saved!');
    setText('');
    setMood('good');
    loadEntries();
  };

  return (
    <View style={styles.container}>
      {/* Dark header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Journal</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Mood picker */}
        <Text style={styles.label}>How are you feeling?</Text>
        <View style={styles.moodRow}>
          {MOODS.map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.moodBtn, mood === m && styles.moodBtnActive]}
              onPress={() => setMood(m)}
            >
              <Text style={styles.moodEmoji}>{MOOD_EMOJI[m]}</Text>
              <Text style={[styles.moodLabel, mood === m && styles.moodLabelActive]}>
                {MOOD_LABEL[m]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Text area */}
        <Text style={styles.label}>How was your day?</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Write freely…"
          placeholderTextColor="#BBBBBB"
          value={text}
          onChangeText={setText}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.saveBtn, (!text.trim() || saving) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!text.trim() || saving}
        >
          {saving
            ? <ActivityIndicator color="#111111" />
            : <Text style={styles.saveBtnText}>Save Entry</Text>
          }
        </TouchableOpacity>

        {/* Past entries */}
        {loading ? (
          <ActivityIndicator color="#C9A84C" style={{ marginTop: 32 }} />
        ) : entries.length === 0 ? (
          <Text style={styles.empty}>No entries yet. Write your first one above.</Text>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Past Entries</Text>
            {entries.map(e => (
              <View key={e.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryMood}>{MOOD_EMOJI[e.mood]}</Text>
                  <Text style={styles.entryDate}>{e.date}</Text>
                </View>
                <Text style={styles.entryText} numberOfLines={2}>
                  {e.text.slice(0, 80)}{e.text.length > 80 ? '…' : ''}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
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
  content: { padding: 20, paddingBottom: 48 },
  label: { fontSize: 13, fontWeight: '700', color: '#555555', marginBottom: 10, marginTop: 20 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  moodBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12,
    marginHorizontal: 2, backgroundColor: '#F7F7F7',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  moodBtnActive: { borderColor: '#C9A84C', backgroundColor: '#FDFAF3' },
  moodEmoji: { fontSize: 24, marginBottom: 4 },
  moodLabel: { fontSize: 10, color: '#999999', fontWeight: '600' },
  moodLabelActive: { color: '#C9A84C' },
  textarea: {
    borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 14,
    padding: 16, fontSize: 16, color: '#111111',
    backgroundColor: '#FAFAFA', minHeight: 160, lineHeight: 24,
  },
  saveBtn: {
    backgroundColor: '#C9A84C', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 16,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#111111' },
  empty: { fontSize: 14, color: '#999999', textAlign: 'center', paddingVertical: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111111', marginTop: 32, marginBottom: 12 },
  entryCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  entryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  entryMood: { fontSize: 20 },
  entryDate: { fontSize: 12, color: '#999999', fontWeight: '600' },
  entryText: { fontSize: 14, color: '#444444', lineHeight: 20 },
});
