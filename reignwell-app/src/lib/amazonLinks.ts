// Locale → { domain, tag }
const LOCALE_MAP: Record<string, { domain: string; tag: string }> = {
  'GB': { domain: 'amazon.co.uk', tag: 'reignwell-uk-21' },
  'DE': { domain: 'amazon.de',    tag: 'reignwell-de-21' },
  'FR': { domain: 'amazon.fr',    tag: 'reignwell-fr-21' },
  'ES': { domain: 'amazon.es',    tag: 'reignwell-es-21' },
  'IT': { domain: 'amazon.it',    tag: 'reignwell-it-21' },
};

const DEFAULT_STORE = { domain: 'amazon.com', tag: 'reignwell-20' };

/** Returns the BCP-47 locale string from the JS runtime (e.g. "en-GB", "de-DE"). */
export function getLocale(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale ?? 'en-US';
  } catch {
    return 'en-US';
  }
}

function countryFromLocale(locale: string): string {
  // BCP-47: language[-script]-REGION, e.g. "en-GB", "de-DE", "zh-Hans-CN"
  const parts = locale.split('-');
  // Last part that is exactly 2 uppercase letters is the region
  for (let i = parts.length - 1; i >= 0; i--) {
    if (/^[A-Z]{2}$/.test(parts[i])) return parts[i];
  }
  return '';
}

function getStore(locale: string): { domain: string; tag: string } {
  const region = countryFromLocale(locale);
  return LOCALE_MAP[region] ?? DEFAULT_STORE;
}

/**
 * Returns a full Amazon search URL for `query`, affiliate-tagged for the
 * user's detected locale.
 *
 * Example: getAmazonLink("whey protein")
 *   → "https://www.amazon.co.uk/s?k=whey+protein&tag=reignwell-uk-21" (for UK)
 */
export function getAmazonLink(query: string): string {
  const locale = getLocale();
  const store = getStore(locale);
  const encoded = encodeURIComponent(query.trim()).replace(/%20/g, '+');
  return `https://www.${store.domain}/s?k=${encoded}&tag=${store.tag}`;
}

export interface ProductSuggestion {
  label: string;
  query: string;
}

/**
 * Maps a food name (from the food log) to relevant supplement suggestions.
 * Returns up to 2 suggestions.
 */
export function getSuggestedProducts(foodName: string): ProductSuggestion[] {
  const name = foodName.toLowerCase();

  // Protein-rich foods → protein supps
  if (/chicken|beef|egg|salmon|tuna|steak|turkey|pork|protein/.test(name)) {
    return [
      { label: 'Whey Protein Powder', query: 'whey protein powder' },
      { label: 'Protein Bars',        query: 'high protein bars' },
    ];
  }

  // Iron-rich / iron-deficient foods
  if (/spinach|lentil|dal|bean|tofu|broccoli|iron/.test(name)) {
    return [
      { label: 'Iron Supplement',   query: 'iron supplement tablets' },
      { label: 'Vitamin C (boosts iron absorption)', query: 'vitamin c supplement' },
    ];
  }

  // Fatty fish → omega-3
  if (/salmon|tuna|mackerel|sardine|fish/.test(name)) {
    return [
      { label: 'Omega-3 Fish Oil', query: 'omega 3 fish oil capsules' },
    ];
  }

  // Dairy / calcium
  if (/milk|cheese|yogurt|yoghurt|paneer/.test(name)) {
    return [
      { label: 'Calcium + Vitamin D3', query: 'calcium vitamin d3 supplement' },
      { label: 'Vitamin D3',           query: 'vitamin d3 supplement 4000iu' },
    ];
  }

  // Greens / veg → multivitamin
  if (/salad|broccoli|kale|spinach|vegetable|veg|green/.test(name)) {
    return [
      { label: 'Multivitamin',         query: 'multivitamin supplement daily' },
      { label: 'Vitamin D3',           query: 'vitamin d3 supplement 4000iu' },
    ];
  }

  // Carb-heavy / energy foods → B vitamins
  if (/rice|bread|oat|pasta|roti|idli|dosa|noodle/.test(name)) {
    return [
      { label: 'B-Complex Vitamins', query: 'vitamin b complex supplement' },
      { label: 'Magnesium',          query: 'magnesium glycinate supplement' },
    ];
  }

  // Nuts / seeds → magnesium
  if (/almond|walnut|peanut|cashew|seed|nut/.test(name)) {
    return [
      { label: 'Magnesium Glycinate', query: 'magnesium glycinate supplement' },
      { label: 'Zinc Supplement',     query: 'zinc supplement tablets' },
    ];
  }

  // Fruit → general antioxidants
  if (/apple|banana|berry|blueberry|orange|mango|fruit/.test(name)) {
    return [
      { label: 'Vitamin C',   query: 'vitamin c 1000mg supplement' },
      { label: 'Multivitamin', query: 'multivitamin supplement daily' },
    ];
  }

  // Default fallback
  return [
    { label: 'Health Supplements', query: 'health supplements bundle' },
    { label: 'Multivitamin',       query: 'multivitamin supplement daily' },
  ];
}
