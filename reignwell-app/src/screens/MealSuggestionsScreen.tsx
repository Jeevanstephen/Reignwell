import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { suggestMeals, SuggestedMeal } from '../lib/mealSuggestions';
import { getTodayMacros, GOALS } from '../lib/foodLog';

export default function MealSuggestionsScreen() {
  const navigation = useNavigation();
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState<SuggestedMeal[]>([]);
  const [searched, setSearched] = useState(false);

  const macros = getTodayMacros();
  const proteinGap = Math.max(GOALS.protein - macros.protein, 0);

  const handleSuggest = async () => {
    setLoading(true);
    setSearched(true);
    const list = ingredients.trim().split(',').map(s => s.trim()).filter(Boolean);
    const results = await suggestMeals(list);
    setMeals(results);
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.heading}>Meal Suggestions</Text>
      <Text style={styles.sub}>Tell us what's in your kitchen</Text>

      {proteinGap > 0 && (
        <View style={styles.gapBadge}>
          <Text style={styles.gapText}>💪 Filling your macro gap: +{proteinGap}g protein needed today</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="e.g. chicken, broccoli, rice, eggs…"
        placeholderTextColor="#999"
        value={ingredients}
        onChangeText={setIngredients}
        multiline
        returnKeyType="done"
      />

      <TouchableOpacity
        style={[styles.suggestBtn, !ingredients.trim() && styles.suggestBtnDisabled]}
        onPress={handleSuggest}
        disabled={!ingredients.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator color="#111111" />
        ) : (
          <Text style={styles.suggestBtnText}>✨ Suggest Meals</Text>
        )}
      </TouchableOpacity>

      {searched && !loading && meals.length === 0 && (
        <Text style={styles.empty}>No suggestions found. Try different ingredients.</Text>
      )}

      {meals.map(meal => (
        <View key={meal.id} style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealEmoji}>{meal.emoji}</Text>
            <View style={styles.mealTitleBlock}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealPrep}>⏱ {meal.prepTime} · {meal.kcal} kcal</Text>
            </View>
          </View>
          <Text style={styles.ingredientList}>
            {meal.ingredients.join(' · ')}
          </Text>
          <View style={styles.macroRow}>
            <View style={styles.macroPill}>
              <Text style={styles.macroPillText}>P {meal.protein}g</Text>
            </View>
            <View style={styles.macroPill}>
              <Text style={styles.macroPillText}>C {meal.carbs}g</Text>
            </View>
            <View style={styles.macroPill}>
              <Text style={styles.macroPillText}>F {meal.fat}g</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 32 },
  backBtn: { marginBottom: 8 },
  backText: { fontSize: 16, color: '#C9A84C', fontWeight: '600' },
  heading: { fontSize: 28, fontWeight: '700', color: '#111111' },
  sub: { fontSize: 14, color: '#999999', marginBottom: 20 },
  gapBadge: {
    backgroundColor: '#FBF6EC', borderRadius: 12, borderWidth: 1,
    borderColor: '#C9A84C', padding: 12, marginBottom: 16,
  },
  gapText: { fontSize: 13, color: '#8a6a1a', fontWeight: '600' },
  input: {
    borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    color: '#111111', backgroundColor: '#FAFAFA', minHeight: 80,
    textAlignVertical: 'top', marginBottom: 14,
  },
  suggestBtn: {
    backgroundColor: '#C9A84C', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginBottom: 24,
  },
  suggestBtnDisabled: { opacity: 0.4 },
  suggestBtnText: { fontSize: 16, fontWeight: '700', color: '#111111' },
  empty: { fontSize: 14, color: '#999999', textAlign: 'center', paddingVertical: 24 },
  mealCard: {
    backgroundColor: '#F7F7F7', borderRadius: 16, padding: 16, marginBottom: 14,
  },
  mealHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  mealEmoji: { fontSize: 32, marginRight: 12 },
  mealTitleBlock: { flex: 1 },
  mealName: { fontSize: 17, fontWeight: '700', color: '#111111' },
  mealPrep: { fontSize: 12, color: '#999999', marginTop: 2 },
  ingredientList: { fontSize: 12, color: '#777777', marginBottom: 12, lineHeight: 18 },
  macroRow: { flexDirection: 'row', gap: 8 },
  macroPill: {
    backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1,
    borderColor: '#E0E0E0', paddingHorizontal: 10, paddingVertical: 4,
  },
  macroPillText: { fontSize: 12, fontWeight: '600', color: '#333333' },
});
