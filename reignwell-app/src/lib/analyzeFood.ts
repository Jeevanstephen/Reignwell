export interface FoodAnalysisResult {
  items: { name: string; calories: number }[];
  totalCalories: number;
}

export async function analyzeFood(
  base64: string,
  apiKey: string,
): Promise<FoodAnalysisResult> {
  // TODO: Achu wires up real Google AI call
  return {
    items: [
      { name: 'Grilled chicken', calories: 228 },
      { name: 'Brown rice', calories: 180 },
    ],
    totalCalories: 408,
  };
}
