import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, TextInput, Alert,
} from 'react-native';
import { markers, BloodMarker, getRisk, GROUPS, RiskLevel, MarkerReading } from '../lib/bloodMarkers';

const RISK_COLOR: Record<RiskLevel, string> = {
  green: '#22C55E',
  amber: '#F59E0B',
  red:   '#EF4444',
};

function MarkerDetail({ marker, onClose }: { marker: BloodMarker; onClose: () => void }) {
  const riskLevel = getRisk(marker);
  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <ScrollView style={detailStyle.container} contentContainerStyle={detailStyle.content}>
        <View style={detailStyle.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={detailStyle.back}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={detailStyle.titleRow}>
          <Text style={detailStyle.title}>{marker.name}</Text>
          <View style={[detailStyle.riskDot, { backgroundColor: RISK_COLOR[riskLevel] }]} />
        </View>
        <Text style={detailStyle.refRange}>
          Reference range: {marker.refMin}–{marker.refMax} {marker.unit}
        </Text>

        <Text style={detailStyle.sectionLabel}>HISTORY</Text>
        {marker.readings.length === 0 ? (
          <Text style={detailStyle.empty}>No readings logged yet.</Text>
        ) : (
          marker.readings.map((r, i) => {
            const level = r.value < marker.refMin || r.value > marker.refMax ? 'red'
              : r.value < marker.refMin + (marker.refMax - marker.refMin) * 0.2 ||
                r.value > marker.refMin + (marker.refMax - marker.refMin) * 0.8 ? 'amber'
              : 'green';
            return (
              <View key={i} style={detailStyle.historyRow}>
                <View style={[detailStyle.histDot, { backgroundColor: RISK_COLOR[level] }]} />
                <Text style={detailStyle.histValue}>{r.value} {marker.unit}</Text>
                <Text style={detailStyle.histDate}>{r.date}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </Modal>
  );
}

export default function BloodMarkersScreen() {
  const [selected, setSelected] = useState<BloodMarker | null>(null);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [pickedMarker, setPickedMarker] = useState(markers[0].id);
  const [valueInput, setValueInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().slice(0, 10));

  const handleLog = () => {
    if (!valueInput.trim()) return;
    Alert.alert('Logged', `${markers.find(m => m.id === pickedMarker)?.name}: ${valueInput} on ${dateInput}`);
    setLogModalVisible(false);
    setValueInput('');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Blood Markers</Text>
        <Text style={styles.sub}>Latest results & reference ranges</Text>

        {GROUPS.map(group => {
          const groupMarkers = markers.filter(m => m.group === group);
          return (
            <View key={group} style={styles.group}>
              <Text style={styles.groupLabel}>{group.toUpperCase()}</Text>
              {groupMarkers.map(m => {
                const level = getRisk(m);
                const latest = m.readings[0];
                return (
                  <TouchableOpacity key={m.id} style={styles.markerRow} onPress={() => setSelected(m)}>
                    <View style={[styles.riskDot, { backgroundColor: RISK_COLOR[level] }]} />
                    <View style={styles.markerInfo}>
                      <Text style={styles.markerName}>{m.name}</Text>
                      {latest && (
                        <Text style={styles.markerDate}>{latest.date}</Text>
                      )}
                    </View>
                    <Text style={styles.markerValue}>
                      {latest ? `${latest.value} ${m.unit}` : '—'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      {/* Gold FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setLogModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Detail modal */}
      {selected && (
        <MarkerDetail marker={selected} onClose={() => setSelected(null)} />
      )}

      {/* Log Result modal */}
      <Modal visible={logModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={logModal.container}>
          <View style={logModal.header}>
            <Text style={logModal.title}>Log Result</Text>
            <TouchableOpacity onPress={() => setLogModalVisible(false)}>
              <Text style={logModal.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 20 }}>
            <Text style={logModal.label}>Marker</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={logModal.pickerScroll}>
              {markers.map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={[logModal.pickerChip, pickedMarker === m.id && logModal.pickerChipActive]}
                  onPress={() => setPickedMarker(m.id)}
                >
                  <Text style={[logModal.pickerChipText, pickedMarker === m.id && logModal.pickerChipTextActive]}>
                    {m.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={logModal.label}>Value ({markers.find(m => m.id === pickedMarker)?.unit})</Text>
            <TextInput
              style={logModal.input}
              keyboardType="decimal-pad"
              placeholder="e.g. 5.1"
              placeholderTextColor="#999"
              value={valueInput}
              onChangeText={setValueInput}
            />

            <Text style={logModal.label}>Date</Text>
            <TextInput
              style={logModal.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
              value={dateInput}
              onChangeText={setDateInput}
            />

            <TouchableOpacity
              style={[logModal.saveBtn, !valueInput.trim() && logModal.saveBtnDisabled]}
              onPress={handleLog}
              disabled={!valueInput.trim()}
            >
              <Text style={logModal.saveBtnText}>Save Result</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  heading: { fontSize: 28, fontWeight: '700', color: '#111111' },
  sub: { fontSize: 14, color: '#999999', marginBottom: 24 },
  group: { marginBottom: 24 },
  groupLabel: { fontSize: 10, fontWeight: '700', color: '#999999', letterSpacing: 1.5, marginBottom: 8 },
  markerRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, backgroundColor: '#F7F7F7', borderRadius: 12, marginBottom: 8,
  },
  riskDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  markerInfo: { flex: 1 },
  markerName: { fontSize: 15, fontWeight: '600', color: '#111111' },
  markerDate: { fontSize: 11, color: '#999999', marginTop: 2 },
  markerValue: { fontSize: 14, fontWeight: '700', color: '#333333' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#C9A84C', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 10, elevation: 10,
  },
  fabText: { fontSize: 28, color: '#111111', fontWeight: '300', lineHeight: 32 },
});

const detailStyle = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingTop: 24, paddingBottom: 48 },
  header: { marginBottom: 16 },
  back: { fontSize: 16, color: '#C9A84C', fontWeight: '600' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  title: { fontSize: 24, fontWeight: '700', color: '#111111' },
  riskDot: { width: 12, height: 12, borderRadius: 6 },
  refRange: { fontSize: 13, color: '#777777', marginBottom: 24 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: '#999999', letterSpacing: 1.5, marginBottom: 10 },
  empty: { fontSize: 14, color: '#999999' },
  historyRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', gap: 10,
  },
  histDot: { width: 8, height: 8, borderRadius: 4 },
  histValue: { flex: 1, fontSize: 15, fontWeight: '600', color: '#111111' },
  histDate: { fontSize: 12, color: '#999999' },
});

const logModal = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingTop: 24, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111111' },
  close: { fontSize: 18, color: '#999999' },
  label: { fontSize: 13, fontWeight: '600', color: '#555555', marginBottom: 8, marginTop: 16 },
  pickerScroll: { marginBottom: 4 },
  pickerChip: {
    backgroundColor: '#F5F5F5', borderRadius: 20, borderWidth: 1,
    borderColor: '#E0E0E0', paddingHorizontal: 12, paddingVertical: 7, marginRight: 8,
  },
  pickerChipActive: { borderColor: '#C9A84C', backgroundColor: '#FBF6EC' },
  pickerChipText: { fontSize: 13, color: '#555555', fontWeight: '500' },
  pickerChipTextActive: { color: '#C9A84C', fontWeight: '700' },
  input: {
    borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16,
    color: '#111111', backgroundColor: '#FAFAFA',
  },
  saveBtn: {
    backgroundColor: '#C9A84C', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 24,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: '#111111', fontSize: 16, fontWeight: '700' },
});
