import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal,
} from 'react-native';
import { regimens, Regimen } from '../lib/regimens';
import { getLinksForMeal, openAffiliateLink } from '../lib/amazonLinks';

function getAmazonLink(name: string) {
  // Reuse amazonLinks search helper
  const links = getLinksForMeal(name);
  if (links.length) return links[0].url;
  // Fallback: generic Amazon search
  const encoded = encodeURIComponent(name);
  return `https://www.amazon.com/s?k=${encoded}&tag=reignwell-20`;
}

function EfsaBar({ amount, min, max, unit }: { amount: number; min: number; max: number; unit: string }) {
  const range = max - min || 1;
  const pct = Math.min(Math.max((amount - min) / range, 0), 1);
  return (
    <View style={bar.wrapper}>
      <View style={bar.track}>
        <View style={[bar.fill, { width: `${pct * 100}%` as any }]} />
        <View style={[bar.marker, { left: `${pct * 100}%` as any }]} />
      </View>
      <View style={bar.labels}>
        <Text style={bar.rangeText}>{min}{unit}</Text>
        <Text style={bar.valueText}>{amount}{unit}</Text>
        <Text style={bar.rangeText}>{max}{unit}</Text>
      </View>
    </View>
  );
}

function RegimenDetail({
  regimen, active, onSetActive, onClose,
}: {
  regimen: Regimen; active: boolean; onSetActive: () => void; onClose: () => void;
}) {
  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <ScrollView style={detail.container} contentContainerStyle={detail.content}>
        <View style={detail.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={detail.back}>← Back</Text>
          </TouchableOpacity>
          {active && (
            <View style={detail.activeBadge}>
              <Text style={detail.activeBadgeText}>👑 Active</Text>
            </View>
          )}
        </View>

        <Text style={detail.emoji}>{regimen.emoji}</Text>
        <Text style={detail.title}>{regimen.title}</Text>
        <Text style={detail.goal}>{regimen.goal}</Text>
        <Text style={detail.price}>{regimen.price}</Text>

        <Text style={detail.sectionLabel}>NUTRIENT TARGETS</Text>
        {regimen.nutrients.map(n => (
          <View key={n.name} style={detail.nutrientRow}>
            <View style={detail.nutrientHeader}>
              <Text style={detail.nutrientName}>{n.name}</Text>
              <Text style={detail.nutrientVal}>{n.amount}{n.unit}/day</Text>
            </View>
            <EfsaBar amount={n.amount} min={n.efsaMin} max={n.efsaMax} unit={n.unit} />
            <Text style={detail.efsaNote}>EFSA range: {n.efsaMin}–{n.efsaMax} {n.unit}</Text>
          </View>
        ))}

        <Text style={detail.sectionLabel}>SUPPLEMENTS</Text>
        {regimen.supplements.map(s => (
          <View key={s.name} style={detail.suppRow}>
            <View style={detail.suppInfo}>
              <Text style={detail.suppName}>{s.name}</Text>
              <Text style={detail.suppDose}>{s.dose}</Text>
            </View>
            <TouchableOpacity
              style={detail.buyBtn}
              onPress={() => openAffiliateLink(getAmazonLink(s.name))}
            >
              <Text style={detail.buyBtnText}>🛒 Buy</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={[detail.ctaBtn, active && detail.ctaBtnActive]}
          onPress={onSetActive}
        >
          <Text style={detail.ctaBtnText}>
            {active ? '✓ Current Regimen' : 'Start this Regimen'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
}

export default function RegimensScreen() {
  const [selected, setSelected] = useState<Regimen | null>(null);
  const [activeId, setActiveId] = useState<string | null>('muscle');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Health Regimens</Text>
      <Text style={styles.sub}>Personalised supplement & nutrition plans</Text>

      {regimens.map(r => (
        <TouchableOpacity
          key={r.id}
          style={[styles.card, activeId === r.id && styles.cardActive]}
          onPress={() => setSelected(r)}
        >
          {activeId === r.id && (
            <View style={styles.crownBadge}>
              <Text style={styles.crownText}>👑 Active</Text>
            </View>
          )}
          <Text style={styles.cardEmoji}>{r.emoji}</Text>
          <Text style={styles.cardTitle}>{r.title}</Text>
          <Text style={styles.cardGoal} numberOfLines={2}>{r.goal}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardPrice}>{r.price}</Text>
            <Text style={styles.cardArrow}>View plan →</Text>
          </View>
        </TouchableOpacity>
      ))}

      {selected && (
        <RegimenDetail
          regimen={selected}
          active={activeId === selected.id}
          onSetActive={() => setActiveId(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </ScrollView>
  );
}

const bar = StyleSheet.create({
  wrapper: { marginVertical: 6 },
  track: { height: 6, backgroundColor: '#E8E8E8', borderRadius: 3, overflow: 'visible' },
  fill: { height: 6, backgroundColor: '#C9A84C', borderRadius: 3 },
  marker: {
    position: 'absolute', top: -4,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#C9A84C', borderWidth: 2, borderColor: '#FFFFFF',
    marginLeft: -7,
  },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  rangeText: { fontSize: 10, color: '#BBBBBB' },
  valueText: { fontSize: 10, fontWeight: '700', color: '#C9A84C' },
});

const detail = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingTop: 24, paddingBottom: 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  back: { fontSize: 16, color: '#C9A84C', fontWeight: '600' },
  activeBadge: {
    backgroundColor: '#FBF6EC', borderRadius: 20, borderWidth: 1,
    borderColor: '#C9A84C', paddingHorizontal: 10, paddingVertical: 4,
  },
  activeBadgeText: { fontSize: 12, color: '#C9A84C', fontWeight: '700' },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '700', color: '#111111', textAlign: 'center' },
  goal: { fontSize: 14, color: '#555555', lineHeight: 22, textAlign: 'center', marginVertical: 8 },
  price: { fontSize: 16, color: '#C9A84C', fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: '#999999', letterSpacing: 1.5, marginBottom: 12, marginTop: 8 },
  nutrientRow: { backgroundColor: '#F7F7F7', borderRadius: 12, padding: 14, marginBottom: 10 },
  nutrientHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  nutrientName: { fontSize: 14, fontWeight: '600', color: '#111111' },
  nutrientVal: { fontSize: 14, fontWeight: '700', color: '#C9A84C' },
  efsaNote: { fontSize: 10, color: '#AAAAAA', marginTop: 4 },
  suppRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  suppInfo: { flex: 1 },
  suppName: { fontSize: 14, fontWeight: '600', color: '#111111' },
  suppDose: { fontSize: 12, color: '#999999', marginTop: 2 },
  buyBtn: {
    backgroundColor: '#FBF6EC', borderRadius: 20, borderWidth: 1,
    borderColor: '#C9A84C', paddingHorizontal: 12, paddingVertical: 6,
  },
  buyBtnText: { fontSize: 12, color: '#8a6a1a', fontWeight: '700' },
  ctaBtn: {
    backgroundColor: '#C9A84C', borderRadius: 14, paddingVertical: 18,
    alignItems: 'center', marginTop: 32,
  },
  ctaBtnActive: { backgroundColor: '#22C55E' },
  ctaBtnText: { fontSize: 17, fontWeight: '700', color: '#111111' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 32 },
  heading: { fontSize: 28, fontWeight: '700', color: '#111111' },
  sub: { fontSize: 14, color: '#999999', marginBottom: 24 },
  card: {
    backgroundColor: '#F7F7F7', borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1.5, borderColor: 'transparent',
  },
  cardActive: { borderColor: '#C9A84C', backgroundColor: '#FDFAF3' },
  crownBadge: {
    alignSelf: 'flex-start', backgroundColor: '#FBF6EC', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10,
  },
  crownText: { fontSize: 11, color: '#C9A84C', fontWeight: '700' },
  cardEmoji: { fontSize: 36, marginBottom: 8 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#111111', marginBottom: 6 },
  cardGoal: { fontSize: 13, color: '#555555', lineHeight: 20, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: 15, fontWeight: '700', color: '#C9A84C' },
  cardArrow: { fontSize: 13, color: '#999999' },
});
