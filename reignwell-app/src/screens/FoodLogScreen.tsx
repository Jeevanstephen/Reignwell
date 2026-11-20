import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated,
  Modal, TextInput, FlatList, Alert, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import {
  analyzeFood, saveAnalysisToLog, getApiKey, saveApiKey,
  AnalysisResult, LoggedMeal as AiMeal,
} from '../lib/aiCamera';

const FOOD_DB = [
  { id: 'f1',  emoji: '🍗', name: 'Grilled Chicken Breast',   kcal: 165, protein: 31, carbs: 0,  fat: 3  },
  { id: 'f2',  emoji: '🥚', name: 'Boiled Egg',               kcal: 78,  protein: 6,  carbs: 1,  fat: 5  },
  { id: 'f3',  emoji: '🍌', name: 'Banana',                   kcal: 89,  protein: 1,  carbs: 23, fat: 0  },
  { id: 'f4',  emoji: '🥗', name: 'Greek Salad',              kcal: 120, protein: 4,  carbs: 8,  fat: 8  },
  { id: 'f5',  emoji: '🍚', name: 'White Rice (1 cup)',        kcal: 206, protein: 4,  carbs: 45, fat: 0  },
  { id: 'f6',  emoji: '🥦', name: 'Broccoli (1 cup)',          kcal: 55,  protein: 4,  carbs: 11, fat: 1  },
  { id: 'f7',  emoji: '🍳', name: 'Scrambled Eggs (2)',        kcal: 182, protein: 12, carbs: 2,  fat: 14 },
  { id: 'f8',  emoji: '🥛', name: 'Whole Milk (1 cup)',        kcal: 149, protein: 8,  carbs: 12, fat: 8  },
  { id: 'f9',  emoji: '🫐', name: 'Blueberries (1 cup)',       kcal: 84,  protein: 1,  carbs: 21, fat: 0  },
  { id: 'f10', emoji: '🍞', name: 'Whole Wheat Bread (1 sl)',  kcal: 69,  protein: 4,  carbs: 12, fat: 1  },
  { id: 'f11', emoji: '🥑', name: 'Avocado (half)',            kcal: 120, protein: 2,  carbs: 6,  fat: 11 },
  { id: 'f12', emoji: '🍎', name: 'Apple',                    kcal: 95,  protein: 0,  carbs: 25, fat: 0  },
  { id: 'f13', emoji: '🧀', name: 'Cheddar Cheese (1 oz)',     kcal: 113, protein: 7,  carbs: 0,  fat: 9  },
  { id: 'f14', emoji: '🥜', name: 'Peanut Butter (2 tbsp)',    kcal: 191, protein: 7,  carbs: 7,  fat: 16 },
  { id: 'f15', emoji: '🍠', name: 'Sweet Potato (medium)',     kcal: 103, protein: 2,  carbs: 24, fat: 0  },
  { id: 'f16', emoji: '🐟', name: 'Salmon (3 oz)',             kcal: 177, protein: 17, carbs: 0,  fat: 11 },
  { id: 'f17', emoji: '🫘', name: 'Black Beans (½ cup)',       kcal: 114, protein: 8,  carbs: 20, fat: 1  },
  { id: 'f18', emoji: '🌾', name: 'Oats (½ cup dry)',          kcal: 150, protein: 5,  carbs: 27, fat: 3  },
  { id: 'f19', emoji: '🧋', name: 'Greek Yogurt (plain)',      kcal: 100, protein: 17, carbs: 6,  fat: 0  },
  { id: 'f20', emoji: '🫓', name: 'Roti (1 piece)',             kcal: 104, protein: 3,  carbs: 18, fat: 3  },
  { id: 'f21', emoji: '🍛', name: 'Chicken Biryani (1 cup)',   kcal: 290, protein: 16, carbs: 40, fat: 7  },
  { id: 'f22', emoji: '🥘', name: 'Dal (½ cup)',               kcal: 116, protein: 8,  carbs: 20, fat: 1  },
  { id: 'f23', emoji: '🫔', name: 'Paneer (100g)',              kcal: 265, protein: 18, carbs: 2,  fat: 20 },
  { id: 'f24', emoji: '🥞', name: 'Idli (2 pieces)',           kcal: 130, protein: 4,  carbs: 26, fat: 1  },
  { id: 'f25', emoji: '🫛', name: 'Dosa (1 plain)',             kcal: 133, protein: 3,  carbs: 25, fat: 3  },
  { id: 'f26', emoji: '🍔', name: 'Cheeseburger',              kcal: 535, protein: 28, carbs: 40, fat: 29 },
  { id: 'f27', emoji: '🍕', name: 'Pizza Slice',               kcal: 285, protein: 12, carbs: 36, fat: 10 },
  { id: 'f28', emoji: '☕', name: 'Latte (medium)',             kcal: 190, protein: 7,  carbs: 24, fat: 7  },
  { id: 'f29', emoji: '🍦', name: 'Vanilla Ice Cream (½ cup)', kcal: 137, protein: 2,  carbs: 16, fat: 7  },
  { id: 'f30', emoji: '🥩', name: 'Beef Steak (3 oz)',         kcal: 213, protein: 22, carbs: 0,  fat: 14 },
];

const GOALS = { kcal: 2100, protein: 120, carbs: 200, fat: 65 };
const FOOD_LOG_STORAGE = 'rw_food_log';
const todayKey = () => new Date().toISOString().slice(0, 10);

interface ManualMeal {
  id: string;
  source: 'manual';
  emoji: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

type LoggedMeal = ManualMeal | AiMeal;

function MacroBar({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const pct = Math.min(value / goal, 1);
  return (
    <View style={macroStyles.wrapper}>
      <View style={macroStyles.labelRow}>
        <Text style={macroStyles.label}>{label}</Text>
        <Text style={macroStyles.values}>{value}g / {goal}g</Text>
      </View>
      <View style={macroStyles.track}>
        <View style={[macroStyles.fill, { width: `${pct * 100}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function FoodLogScreen() {
  const [meals, setMeals] = useState<LoggedMeal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AnalysisResult | null>(null);
  const [apiKeyModalVisible, setApiKeyModalVisible] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      const raw = await AsyncStorage.getItem(FOOD_LOG_STORAGE);
      const all: Record<string, LoggedMeal[]> = raw ? JSON.parse(raw) : {};
      setMeals(all[todayKey()] ?? []);
    } catch {}
  };

  const persistMeals = async (updated: LoggedMeal[]) => {
    try {
      const raw = await AsyncStorage.getItem(FOOD_LOG_STORAGE);
      const all: Record<string, LoggedMeal[]> = raw ? JSON.parse(raw) : {};
      all[todayKey()] = updated;
      await AsyncStorage.setItem(FOOD_LOG_STORAGE, JSON.stringify(all));
    } catch {}
  };

  const addManualFood = useCallback((food: typeof FOOD_DB[0]) => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const meal: ManualMeal = {
      id: Date.now().toString(),
      source: 'manual',
      emoji: food.emoji,
      name: food.name,
      kcal: food.kcal,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      time,
    };
    const updated = [...meals, meal];
    setMeals(updated);
    persistMeals(updated);
    setModalVisible(false);
    setSearch('');
  }, [meals]);

  const removeFood = useCallback((id: string) => {
    Alert.alert('Remove?', "Remove this item from today's log?", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: () => {
          const updated = meals.filter(m => m.id !== id);
          setMeals(updated);
          persistMeals(updated);
        },
      },
    ]);
  }, [meals]);

  // --- AI Camera ---

  const handleCameraPress = async () => {
    const apiKey = await getApiKey();
    if (!apiKey) {
      setApiKeyModalVisible(true);
      return;
    }
    launchCamera(apiKey);
  };

  const launchCamera = async (apiKey: string) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to log food with AI.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]?.base64) return;
    const base64 = result.assets[0].base64!;
    setAnalyzing(true);
    try {
      const analysis = await analyzeFood(base64, apiKey);
      const saved = await saveAnalysisToLog(analysis);
      setMeals(prev => [...prev, saved]);
      setAiResult(analysis);
    } catch (err: any) {
      Alert.alert('Analysis failed', err.message ?? 'Could not analyze the photo. Try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const saveApiKeyAndProceed = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) return;
    await saveApiKey(trimmed);
    setApiKeyModalVisible(false);
    setApiKeyInput('');
    launchCamera(trimmed);
  };

  // --- Totals ---

  const totalKcal    = meals.reduce((s, m) => s + m.kcal,    0);
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs   = meals.reduce((s, m) => s + m.carbs,   0);
  const totalFat     = meals.reduce((s, m) => s + m.fat,     0);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const filtered = search.trim()
    ? FOOD_DB.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : FOOD_DB;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Food Log</Text>
      <Text style={styles.sub}>Today · {totalKcal} / {GOALS.kcal} kcal</Text>

      {/* Macro Summary */}
      <View style={styles.macroCard}>
        <Text style={styles.macroTitle}>Macros</Text>
        <MacroBar label="Protein" value={totalProtein} goal={GOALS.protein} color="#22C55E" />
        <MacroBar label="Carbs"   value={totalCarbs}   goal={GOALS.carbs}   color="#3B82F6" />
        <MacroBar label="Fat"     value={totalFat}     goal={GOALS.fat}     color="#F59E0B" />
      </View>

      {/* AI Camera Button */}
      <Animated.View style={[styles.cameraBtn, { opacity: glowOpacity }]}>
        <TouchableOpacity style={styles.cameraBtnInner} onPress={handleCameraPress} disabled={analyzing}>
          {analyzing ? (
            <>
              <ActivityIndicator color="#111111" style={{ marginBottom: 8 }} />
              <Text style={styles.cameraBtnText}>Analyzing photo…</Text>
            </>
          ) : (
            <>
              <Text style={styles.cameraIcon}>📸</Text>
              <Text style={styles.cameraBtnText}>Log with AI Camera</Text>
              <Text style={styles.cameraBtnSub}>Snap a photo to auto-log nutrients</Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Meals List */}
      <Text style={styles.sectionTitle}>Today's Meals</Text>
      {meals.length === 0 ? (
        <Text style={styles.emptyText}>No meals logged yet. Tap the button above to add your first meal.</Text>
      ) : (
        meals.map((meal) => (
          <TouchableOpacity key={meal.id} style={styles.mealRow} onLongPress={() => removeFood(meal.id)}>
            <Text style={styles.mealEmoji}>{meal.emoji}</Text>
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealTime}>
                {meal.time}{meal.source === 'ai_camera' ? ' · AI' : ''}
              </Text>
            </View>
            <Text style={styles.mealKcal}>{meal.kcal} kcal</Text>
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.addBtnText}>+ Add manually</Text>
      </TouchableOpacity>

      {/* Food Search Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={modal.container}>
          <View style={modal.header}>
            <Text style={modal.title}>Add Food</Text>
            <TouchableOpacity onPress={() => { setModalVisible(false); setSearch(''); }}>
              <Text style={modal.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={modal.search}
            placeholder="Search foods…"
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={modal.row} onPress={() => addManualFood(item)}>
                <Text style={modal.emoji}>{item.emoji}</Text>
                <View style={modal.info}>
                  <Text style={modal.name}>{item.name}</Text>
                  <Text style={modal.macros}>P {item.protein}g · C {item.carbs}g · F {item.fat}g</Text>
                </View>
                <Text style={modal.kcal}>{item.kcal} kcal</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </Modal>

      {/* API Key Setup Modal */}
      <Modal visible={apiKeyModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={modal.container}>
          <View style={modal.header}>
            <Text style={modal.title}>Google AI API Key</Text>
            <TouchableOpacity onPress={() => { setApiKeyModalVisible(false); setApiKeyInput(''); }}>
              <Text style={modal.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={{ padding: 20 }}>
            <Text style={keyModal.desc}>
              The AI Camera uses Google Gemini to identify food from photos.
              Enter your Google AI Studio API key once — it's stored locally on your device.
            </Text>
            <TextInput
              style={keyModal.input}
              placeholder="AIza…"
              placeholderTextColor="#999"
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
            <TouchableOpacity
              style={[keyModal.btn, !apiKeyInput.trim() && keyModal.btnDisabled]}
              onPress={saveApiKeyAndProceed}
              disabled={!apiKeyInput.trim()}
            >
              <Text style={keyModal.btnText}>Save & Continue</Text>
            </TouchableOpacity>
            <Text style={keyModal.hint}>Get a free key at aistudio.google.com → Get API Key</Text>
          </View>
        </View>
      </Modal>

      {/* AI Result Sheet — minimal confirm; Neha enhances the UI */}
      <Modal visible={!!aiResult} animationType="slide" presentationStyle="pageSheet">
        <View style={modal.container}>
          <View style={modal.header}>
            <Text style={modal.title}>AI Analysis</Text>
          </View>
          {aiResult && (
            <ScrollView style={{ padding: 20 }}>
              <Text style={result.total}>{aiResult.total_calories} kcal detected</Text>
              {aiResult.breakdown.map((b, i) => (
                <View key={i} style={result.row}>
                  <Text style={result.name}>{b.name}</Text>
                  <Text style={result.kcal}>{b.calories} kcal</Text>
                </View>
              ))}
              <TouchableOpacity style={result.btn} onPress={() => setAiResult(null)}>
                <Text style={result.btnText}>Added to log ✓</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

// ---- Styles ----

const macroStyles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: 13, color: '#555555', fontWeight: '500' },
  values: { fontSize: 12, color: '#999999' },
  track: { height: 6, backgroundColor: '#E8E8E8', borderRadius: 3 },
  fill: { height: 6, borderRadius: 3 },
});

const modal = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingTop: 24, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111111' },
  close: { fontSize: 18, color: '#999999', paddingHorizontal: 4 },
  search: {
    margin: 16, borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#111111', backgroundColor: '#FAFAFA',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  emoji: { fontSize: 26, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#111111' },
  macros: { fontSize: 11, color: '#999999', marginTop: 2 },
  kcal: { fontSize: 14, fontWeight: '600', color: '#555555' },
});

const keyModal = StyleSheet.create({
  desc: { fontSize: 14, color: '#555555', lineHeight: 22, marginBottom: 20 },
  input: {
    borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111111',
    backgroundColor: '#FAFAFA', marginBottom: 16,
  },
  btn: { backgroundColor: '#C9A84C', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#111111', fontSize: 16, fontWeight: '700' },
  hint: { textAlign: 'center', fontSize: 12, color: '#999999', marginTop: 16 },
});

const result = StyleSheet.create({
  total: { fontSize: 28, fontWeight: '700', color: '#111111', marginBottom: 20 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  name: { fontSize: 15, color: '#333333' },
  kcal: { fontSize: 15, fontWeight: '600', color: '#555555' },
  btn: { backgroundColor: '#C9A84C', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 32 },
  btnText: { color: '#111111', fontSize: 16, fontWeight: '700' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 32 },
  heading: { fontSize: 28, fontWeight: '700', color: '#111111' },
  sub: { fontSize: 14, color: '#999999', marginBottom: 20 },
  macroCard: { backgroundColor: '#F7F7F7', borderRadius: 16, padding: 16, marginBottom: 20 },
  macroTitle: { fontSize: 13, fontWeight: '700', color: '#111111', marginBottom: 14, letterSpacing: 0.5 },
  cameraBtn: {
    backgroundColor: '#C9A84C', borderRadius: 16, marginBottom: 24,
    shadowColor: '#C9A84C', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  cameraBtnInner: { padding: 20, alignItems: 'center' },
  cameraIcon: { fontSize: 32, marginBottom: 8 },
  cameraBtnText: { fontSize: 17, fontWeight: '700', color: '#111111' },
  cameraBtnSub: { fontSize: 12, color: '#5a4a1a', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111111', marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#999999', textAlign: 'center', paddingVertical: 24 },
  mealRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, backgroundColor: '#F7F7F7', borderRadius: 12, marginBottom: 10,
  },
  mealEmoji: { fontSize: 28, marginRight: 12 },
  mealInfo: { flex: 1 },
  mealName: { fontSize: 15, fontWeight: '600', color: '#111111' },
  mealTime: { fontSize: 12, color: '#999999', marginTop: 2 },
  mealKcal: { fontSize: 14, fontWeight: '600', color: '#555555' },
  addBtn: {
    borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 4,
  },
  addBtnText: { color: '#666666', fontSize: 14, fontWeight: '500' },
});
