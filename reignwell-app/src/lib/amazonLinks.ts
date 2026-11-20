import { Linking } from 'react-native';

export interface AffiliateLink {
  label: string;
  url: string;
}

// Maps food/nutrient keywords → Amazon search links
// tag=reignwell-20 is a placeholder affiliate tag; replace with real one from Amazon Associates
const TAG = 'reignwell-20';

function amazonSearch(query: string): string {
  const encoded = encodeURIComponent(query);
  return `https://www.amazon.com/s?k=${encoded}&tag=${TAG}`;
}

const FOOD_LINKS: Record<string, AffiliateLink[]> = {
  protein: [
    { label: 'Whey Protein', url: amazonSearch('whey protein powder') },
    { label: 'Protein Bars', url: amazonSearch('protein bars') },
  ],
  omega: [
    { label: 'Omega-3 Fish Oil', url: amazonSearch('omega-3 fish oil capsules') },
  ],
  vitamin_d: [
    { label: 'Vitamin D3', url: amazonSearch('vitamin d3 supplement 5000iu') },
  ],
  b12: [
    { label: 'Vitamin B12', url: amazonSearch('vitamin b12 supplement methylcobalamin') },
  ],
  iron: [
    { label: 'Iron Supplement', url: amazonSearch('iron supplement gentle') },
  ],
  calcium: [
    { label: 'Calcium + D3', url: amazonSearch('calcium vitamin d supplement') },
  ],
  zinc: [
    { label: 'Zinc Supplement', url: amazonSearch('zinc supplement 25mg') },
  ],
  magnesium: [
    { label: 'Magnesium', url: amazonSearch('magnesium glycinate supplement') },
  ],
};

// Returns 1-2 affiliate chips relevant to a meal name
export function getLinksForMeal(mealName: string): AffiliateLink[] {
  const name = mealName.toLowerCase();
  const results: AffiliateLink[] = [];

  if (name.includes('chicken') || name.includes('egg') || name.includes('beef') ||
      name.includes('salmon') || name.includes('paneer') || name.includes('yogurt')) {
    results.push(...FOOD_LINKS.protein.slice(0, 1));
  }
  if (name.includes('salmon') || name.includes('fish')) {
    results.push(...FOOD_LINKS.omega);
  }

  return results.slice(0, 2);
}

// Fixed supplement discovery links shown at the bottom of Food Log
export const SUPPLEMENT_EXPLORE_LINKS: AffiliateLink[] = [
  { label: '🧬 Multivitamin', url: amazonSearch('multivitamin daily') },
  { label: '🐟 Omega-3',      url: amazonSearch('omega-3 fish oil capsules') },
  { label: '☀️ Vitamin D3',   url: amazonSearch('vitamin d3 supplement') },
  { label: '💪 Protein',      url: amazonSearch('whey protein powder') },
];

export async function openAffiliateLink(url: string): Promise<void> {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  }
}
