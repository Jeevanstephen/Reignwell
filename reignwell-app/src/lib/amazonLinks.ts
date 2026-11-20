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

// ---- Shop catalogue ----

export interface ShopProduct {
  id: string;
  emoji: string;
  name: string;
  tagline: string;
  url: string;
  category: ShopCategory;
  featured?: boolean;
}

export type ShopCategory = 'Protein' | 'Vitamins' | 'Minerals' | 'Recovery' | 'Weight';

export const SHOP_CATEGORIES: ShopCategory[] = ['Protein', 'Vitamins', 'Minerals', 'Recovery', 'Weight'];

export const SHOP_PRODUCTS: ShopProduct[] = [
  // Protein
  { id: 'sp1', emoji: '🥤', name: 'Whey Protein Powder',   tagline: 'High-quality post-workout protein',         url: amazonSearch('whey protein powder isolate'),              category: 'Protein',  featured: true },
  { id: 'sp2', emoji: '🍫', name: 'Protein Bars (12-pack)', tagline: 'Convenient on-the-go protein snack',         url: amazonSearch('protein bars high protein'),                category: 'Protein' },
  { id: 'sp3', emoji: '🌱', name: 'Plant Protein Powder',   tagline: 'Vegan-friendly, pea & rice blend',           url: amazonSearch('plant based protein powder vegan'),         category: 'Protein' },
  { id: 'sp4', emoji: '🧃', name: 'Collagen Peptides',      tagline: 'Joint, skin & gut support',                  url: amazonSearch('collagen peptides powder'),                  category: 'Protein' },
  // Vitamins
  { id: 'sv1', emoji: '☀️', name: 'Vitamin D3 (5000 IU)',  tagline: 'Bone, immune & mood support',                url: amazonSearch('vitamin d3 5000iu supplement'),             category: 'Vitamins', featured: true },
  { id: 'sv2', emoji: '🧬', name: 'Daily Multivitamin',     tagline: 'Complete A–Z micronutrient cover',           url: amazonSearch('daily multivitamin men women'),             category: 'Vitamins' },
  { id: 'sv3', emoji: '🩸', name: 'Vitamin B12',            tagline: 'Energy metabolism & nerve function',          url: amazonSearch('vitamin b12 methylcobalamin supplement'),   category: 'Vitamins' },
  { id: 'sv4', emoji: '🍊', name: 'Vitamin C 1000 mg',      tagline: 'Antioxidant & immune defense',               url: amazonSearch('vitamin c 1000mg supplement'),              category: 'Vitamins' },
  { id: 'sv5', emoji: '🫐', name: 'Vitamin K2 + D3',        tagline: 'Bone density & arterial health combo',        url: amazonSearch('vitamin k2 d3 supplement'),                 category: 'Vitamins' },
  // Minerals
  { id: 'sm1', emoji: '⚡', name: 'Magnesium Glycinate',    tagline: 'Sleep, muscle & stress support',             url: amazonSearch('magnesium glycinate 400mg supplement'),     category: 'Minerals', featured: true },
  { id: 'sm2', emoji: '🦴', name: 'Calcium + D3',           tagline: 'Bone strength & density',                    url: amazonSearch('calcium vitamin d3 supplement'),            category: 'Minerals' },
  { id: 'sm3', emoji: '🩸', name: 'Iron Supplement',        tagline: 'Gentle formula for deficiency support',      url: amazonSearch('iron supplement gentle non constipating'),  category: 'Minerals' },
  { id: 'sm4', emoji: '🛡️', name: 'Zinc 25 mg',             tagline: 'Immune function & testosterone support',     url: amazonSearch('zinc 25mg supplement'),                     category: 'Minerals' },
  // Recovery
  { id: 'sr1', emoji: '🐟', name: 'Omega-3 Fish Oil',       tagline: 'Inflammation & heart health',                url: amazonSearch('omega-3 fish oil 1000mg'),                  category: 'Recovery', featured: true },
  { id: 'sr2', emoji: '🏃', name: 'Creatine Monohydrate',   tagline: 'Strength, power & muscle endurance',         url: amazonSearch('creatine monohydrate powder micronized'),   category: 'Recovery' },
  { id: 'sr3', emoji: '💤', name: 'Melatonin 5 mg',         tagline: 'Natural sleep cycle support',                url: amazonSearch('melatonin 5mg sleep supplement'),           category: 'Recovery' },
  { id: 'sr4', emoji: '🫙', name: 'BCAA Powder',            tagline: 'Muscle repair & reduce soreness',            url: amazonSearch('bcaa amino acid supplement powder'),        category: 'Recovery' },
  // Weight
  { id: 'sw1', emoji: '🍵', name: 'Green Tea Extract',      tagline: 'Metabolism boost & antioxidant',             url: amazonSearch('green tea extract supplement egcg'),        category: 'Weight',   featured: true },
  { id: 'sw2', emoji: '🌶️', name: 'Garcinia Cambogia',      tagline: 'Appetite & carb metabolism support',         url: amazonSearch('garcinia cambogia extract supplement'),     category: 'Weight' },
  { id: 'sw3', emoji: '☕', name: 'CLA Supplement',         tagline: 'Lean body mass support',                     url: amazonSearch('cla conjugated linoleic acid supplement'),  category: 'Weight' },
];

export function getProductsByCategory(category: ShopCategory): ShopProduct[] {
  return SHOP_PRODUCTS.filter(p => p.category === category);
}

export function getFeaturedProducts(): ShopProduct[] {
  return SHOP_PRODUCTS.filter(p => p.featured);
}

export async function openAffiliateLink(url: string): Promise<void> {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  }
}
