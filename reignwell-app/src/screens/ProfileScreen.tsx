import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Platform, ToastAndroid, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  calcCalories, UserProfile, DEFAULT_PROFILE,
  Gender, ActivityLevel, Goal, Locale,
} from '../lib/userProfile';

function showToast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
  else Alert.alert('Saved', msg);
}

function PillGroup<T extends string>({
  options, value, onChange, label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <View style={pill.wrapper}>
      <Text style={pill.label}>{label}</Text>
      <View style={pill.row}>
        {options.map(o => (
          <TouchableOpacity
            key={o.value}
            style={[pill.chip, value === o.value && pill.chipActive]}
            onPress={() => onChange(o.value)}
          >
            <Text style={[pill.chipText, value === o.value && pill.chipTextActive]}>
              {o.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const calories = calcCalories(profile);

  const set = <K extends keyof UserProfile>(key: K, val: UserProfile[K]) =>
    setProfile(p => ({ ...p, [key]: val }));

  const handleSave = () => {
    showToast('Profile saved!');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>My Profile</Text>
      <Text style={styles.sub}>Personalise your health targets</Text>

      {/* Calorie target banner */}
      <View style={styles.calorieBanner}>
        <Text style={styles.calorieLabel}>Daily Calorie Target</Text>
        <Text style={styles.calorieValue}>{calories} kcal</Text>
        <Text style={styles.calorieNote}>Based on your profile · updates live</Text>
      </View>

      {/* Name */}
      <Text style={styles.fieldLabel}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Your name"
        placeholderTextColor="#999"
        value={profile.name}
        onChangeText={v => set('name', v)}
      />

      {/* Age + Weight + Height row */}
      <View style={styles.triRow}>
        <View style={styles.triField}>
          <Text style={styles.fieldLabel}>Age</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={String(profile.age)}
            onChangeText={v => set('age', parseInt(v) || 0)}
          />
        </View>
        <View style={styles.triField}>
          <Text style={styles.fieldLabel}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            value={String(profile.weightKg)}
            onChangeText={v => set('weightKg', parseFloat(v) || 0)}
          />
        </View>
        <View style={styles.triField}>
          <Text style={styles.fieldLabel}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={String(profile.heightCm)}
            onChangeText={v => set('heightCm', parseInt(v) || 0)}
          />
        </View>
      </View>

      <PillGroup<Gender>
        label="Gender"
        value={profile.gender}
        onChange={v => set('gender', v)}
        options={[{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }, { value: 'Other', label: 'Other' }]}
      />

      <PillGroup<ActivityLevel>
        label="Activity Level"
        value={profile.activityLevel}
        onChange={v => set('activityLevel', v)}
        options={[
          { value: 'sedentary', label: 'Sedentary' },
          { value: 'light', label: 'Light' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'active', label: 'Active' },
          { value: 'very_active', label: 'Very Active' },
        ]}
      />

      <PillGroup<Goal>
        label="Goal"
        value={profile.goal}
        onChange={v => set('goal', v)}
        options={[
          { value: 'lose', label: 'Lose Weight' },
          { value: 'maintain', label: 'Maintain' },
          { value: 'gain', label: 'Gain Muscle' },
        ]}
      />

      <PillGroup<Locale>
        label="Locale (Currency & Units)"
        value={profile.locale}
        onChange={v => set('locale', v)}
        options={[
          { value: 'UK', label: '🇬🇧 UK' },
          { value: 'DE', label: '🇩🇪 DE' },
          { value: 'FR', label: '🇫🇷 FR' },
          { value: 'ES', label: '🇪🇸 ES' },
          { value: 'IT', label: '🇮🇹 IT' },
        ]}
      />

      {/* Blood Markers link */}
      <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('BloodMarkers')}>
        <Text style={styles.linkText}>🩸 Blood Markers</Text>
        <Text style={styles.linkArrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const pill = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#555555', marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#F5F5F5', borderRadius: 20, borderWidth: 1,
    borderColor: '#E0E0E0', paddingHorizontal: 14, paddingVertical: 8,
  },
  chipActive: { borderColor: '#C9A84C', backgroundColor: '#FBF6EC' },
  chipText: { fontSize: 13, color: '#555555', fontWeight: '500' },
  chipTextActive: { color: '#C9A84C', fontWeight: '700' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 32 },
  heading: { fontSize: 28, fontWeight: '700', color: '#111111' },
  sub: { fontSize: 14, color: '#999999', marginBottom: 20 },
  calorieBanner: {
    backgroundColor: '#111111', borderRadius: 16, padding: 20,
    alignItems: 'center', marginBottom: 24,
  },
  calorieLabel: { fontSize: 11, fontWeight: '700', color: '#888888', letterSpacing: 1, marginBottom: 6 },
  calorieValue: { fontSize: 36, fontWeight: '700', color: '#C9A84C' },
  calorieNote: { fontSize: 11, color: '#666666', marginTop: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555555', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    color: '#111111', backgroundColor: '#FAFAFA', marginBottom: 16,
  },
  triRow: { flexDirection: 'row', gap: 10 },
  triField: { flex: 1 },
  linkRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#F7F7F7', borderRadius: 12, marginBottom: 16,
  },
  linkText: { fontSize: 15, fontWeight: '600', color: '#111111' },
  linkArrow: { fontSize: 16, color: '#C9A84C' },
  saveBtn: {
    backgroundColor: '#C9A84C', borderRadius: 14,
    paddingVertical: 18, alignItems: 'center',
  },
  saveBtnText: { fontSize: 17, fontWeight: '700', color: '#111111' },
});
