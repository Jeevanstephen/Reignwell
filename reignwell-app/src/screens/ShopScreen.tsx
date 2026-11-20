import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  SHOP_CATEGORIES, SHOP_PRODUCTS, getFeaturedProducts,
  getProductsByCategory, openAffiliateLink,
  ShopCategory, ShopProduct,
} from '../lib/amazonLinks';

function ProductCard({ product, compact }: { product: ShopProduct; compact?: boolean }) {
  return (
    <TouchableOpacity
      style={compact ? styles.compactCard : styles.productCard}
      onPress={() => openAffiliateLink(product.url)}
      activeOpacity={0.8}
    >
      <Text style={compact ? styles.compactEmoji : styles.productEmoji}>{product.emoji}</Text>
      <View style={styles.productInfo}>
        <Text style={compact ? styles.compactName : styles.productName} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={compact ? styles.compactTagline : styles.productTagline} numberOfLines={1}>
          {product.tagline}
        </Text>
      </View>
      <View style={styles.buyBadge}>
        <Text style={styles.buyBadgeText}>Buy</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ShopScreen() {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState<ShopCategory>('Protein');

  const featured = getFeaturedProducts();
  const categoryProducts = getProductsByCategory(activeCategory);

  return (
    <View style={styles.container}>
      {/* Dark header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.heading}>Shop</Text>
          <Text style={styles.headingSub}>Supplements & nutrition</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Disclosure */}
        <View style={styles.disclosureBanner}>
          <Text style={styles.disclosureText}>
            🛒 Amazon affiliate links · ReignWell earns a small commission at no extra cost to you
          </Text>
        </View>

        {/* Featured */}
        <Text style={styles.sectionTitle}>Featured</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredRow}
        >
          {featured.map(p => (
            <TouchableOpacity
              key={p.id}
              style={styles.featuredCard}
              onPress={() => openAffiliateLink(p.url)}
              activeOpacity={0.85}
            >
              <Text style={styles.featuredEmoji}>{p.emoji}</Text>
              <Text style={styles.featuredCategory}>{p.category.toUpperCase()}</Text>
              <Text style={styles.featuredName}>{p.name}</Text>
              <Text style={styles.featuredTagline}>{p.tagline}</Text>
              <View style={styles.featuredBuyBtn}>
                <Text style={styles.featuredBuyText}>Shop on Amazon →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category tabs */}
        <Text style={styles.sectionTitle}>Browse by Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabs}
        >
          {SHOP_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryTab, activeCategory === cat && styles.categoryTabActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryTabText, activeCategory === cat && styles.categoryTabTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category products */}
        <View style={styles.productList}>
          {categoryProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </View>

        {/* All products compact list */}
        <Text style={styles.sectionTitle}>All Products</Text>
        <View style={styles.compactList}>
          {SHOP_PRODUCTS.map(p => (
            <ProductCard key={p.id} product={p} compact />
          ))}
        </View>

        <View style={styles.bottomPadding} />
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
  headerCenter: { alignItems: 'center' },
  heading: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  headingSub: { fontSize: 11, color: '#888888', marginTop: 2 },

  content: { padding: 20 },

  disclosureBanner: {
    backgroundColor: '#FBF6EC', borderRadius: 10, padding: 10, marginBottom: 24,
    borderWidth: 1, borderColor: '#E8D5A0',
  },
  disclosureText: { fontSize: 11, color: '#8a6a1a', textAlign: 'center', lineHeight: 16 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111111', marginBottom: 14 },

  // Featured horizontal scroll
  featuredRow: { gap: 12, paddingBottom: 4, marginBottom: 28 },
  featuredCard: {
    width: 180, backgroundColor: '#111111', borderRadius: 16, padding: 18,
  },
  featuredEmoji: { fontSize: 36, marginBottom: 8 },
  featuredCategory: { fontSize: 9, color: '#C9A84C', fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  featuredName: { fontSize: 14, fontWeight: '700', color: '#F0EBE0', marginBottom: 4, lineHeight: 19 },
  featuredTagline: { fontSize: 11, color: '#888888', lineHeight: 16, marginBottom: 14 },
  featuredBuyBtn: {
    backgroundColor: '#C9A84C', borderRadius: 8, paddingVertical: 8, alignItems: 'center',
  },
  featuredBuyText: { fontSize: 12, fontWeight: '700', color: '#111111' },

  // Category tabs
  categoryTabs: { gap: 8, paddingBottom: 4, marginBottom: 16 },
  categoryTab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: 'transparent',
  },
  categoryTabActive: { borderColor: '#C9A84C', backgroundColor: '#FBF6EC' },
  categoryTabText: { fontSize: 13, fontWeight: '600', color: '#888888' },
  categoryTabTextActive: { color: '#C9A84C' },

  // Product card (category view)
  productList: { gap: 10, marginBottom: 32 },
  productCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F7F7',
    borderRadius: 14, padding: 16, gap: 14,
  },
  productEmoji: { fontSize: 32 },
  productInfo: { flex: 1 },
  productName: { fontSize: 15, fontWeight: '700', color: '#111111', marginBottom: 3 },
  productTagline: { fontSize: 12, color: '#777777', lineHeight: 17 },
  buyBadge: {
    backgroundColor: '#C9A84C', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
  },
  buyBadgeText: { fontSize: 12, fontWeight: '700', color: '#111111' },

  // Compact card (all products list)
  compactList: { gap: 8, marginBottom: 12 },
  compactCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 12, padding: 12, gap: 12,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  compactEmoji: { fontSize: 24 },
  compactName: { fontSize: 14, fontWeight: '600', color: '#111111', marginBottom: 2 },
  compactTagline: { fontSize: 11, color: '#999999' },

  bottomPadding: { height: 40 },
});
