import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

interface Device {
  id: string;
  name: string;
  description: string;
  emoji: string;
  connected: boolean;
  syncedAt?: string;
}

const INITIAL_DEVICES: Device[] = [
  {
    id: '1',
    name: 'Apple Health',
    description: 'Steps, heart rate, sleep, workouts',
    emoji: '❤️',
    connected: false,
  },
  {
    id: '2',
    name: 'Google Fit',
    description: 'Activity, nutrition, vitals',
    emoji: '🏃',
    connected: false,
  },
  {
    id: '3',
    name: 'Fitbit',
    description: 'Sleep stages, SpO2, stress score',
    emoji: '⌚',
    connected: true,
    syncedAt: 'Last synced 2h ago',
  },
  {
    id: '4',
    name: 'Oura Ring',
    description: 'Readiness, HRV, sleep quality',
    emoji: '💍',
    connected: false,
  },
  {
    id: '5',
    name: 'Whoop',
    description: 'Strain, recovery, sleep coach',
    emoji: '📿',
    connected: false,
  },
  {
    id: '6',
    name: 'Garmin',
    description: 'GPS, VO2 max, body battery',
    emoji: '🗺️',
    connected: false,
  },
];

export default function ConnectScreen() {
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);

  const toggle = (id: string) => {
    setDevices(prev =>
      prev.map(d =>
        d.id === id
          ? { ...d, connected: !d.connected, syncedAt: !d.connected ? 'Just synced' : undefined }
          : d
      )
    );
  };

  const connectedCount = devices.filter(d => d.connected).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Connect</Text>
      <Text style={styles.sub}>{connectedCount} device{connectedCount !== 1 ? 's' : ''} connected</Text>

      {connectedCount > 0 && (
        <View style={styles.syncBanner}>
          <Text style={styles.syncIcon}>✓</Text>
          <Text style={styles.syncText}>Auto-syncing health data to your dashboard</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Health Platforms</Text>
      {devices.map((d) => (
        <View key={d.id} style={styles.card}>
          <Text style={styles.deviceEmoji}>{d.emoji}</Text>
          <View style={styles.deviceInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.deviceName}>{d.name}</Text>
              {d.connected && (
                <View style={styles.connectedBadge}>
                  <View style={styles.connectedDot} />
                  <Text style={styles.connectedText}>Connected</Text>
                </View>
              )}
            </View>
            <Text style={styles.deviceDesc}>{d.description}</Text>
            {d.connected && d.syncedAt && (
              <Text style={styles.syncedAt}>{d.syncedAt}</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.connectBtn, d.connected && styles.disconnectBtn]}
            onPress={() => toggle(d.id)}
          >
            <Text style={[styles.connectBtnText, d.connected && styles.disconnectBtnText]}>
              {d.connected ? 'Disconnect' : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>More integrations coming soon — Polar, Apple Watch, CGMs, and lab import.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  heading: { fontSize: 28, fontWeight: '700', color: '#111111' },
  sub: { fontSize: 13, color: '#999999', marginTop: 2, marginBottom: 20 },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  syncIcon: { color: '#22C55E', fontSize: 14, fontWeight: '700' },
  syncText: { fontSize: 13, color: '#166534' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111111', marginBottom: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  deviceEmoji: { fontSize: 28 },
  deviceInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  deviceName: { fontSize: 15, fontWeight: '600', color: '#111111' },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
    gap: 4,
  },
  connectedDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#22C55E' },
  connectedText: { fontSize: 10, color: '#22C55E', fontWeight: '600' },
  deviceDesc: { fontSize: 12, color: '#777777' },
  syncedAt: { fontSize: 11, color: '#C9A84C', marginTop: 2, fontWeight: '500' },
  connectBtn: {
    backgroundColor: '#C9A84C',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  connectBtnText: { fontSize: 12, fontWeight: '700', color: '#111111' },
  disconnectBtn: { backgroundColor: '#F0F0F0' },
  disconnectBtnText: { color: '#666666' },
  footer: { marginTop: 12 },
  footerText: { fontSize: 12, color: '#AAAAAA', textAlign: 'center', lineHeight: 18 },
});
