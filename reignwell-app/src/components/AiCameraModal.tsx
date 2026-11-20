import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity,
  Image, Animated, TextInput, ScrollView, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyzeFood, FoodAnalysisResult } from '../lib/analyzeFood';

const API_KEY_STORAGE = 'rw_ai_api_key';

type State = 'idle' | 'analyzing' | 'results' | 'error' | 'no-api-key';

interface Props {
  visible: boolean;
  onClose: () => void;
  onLog: (items: { name: string; calories: number }[], totalCalories: number) => void;
}

function ShimmerBar({ width }: { width: number | string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });
  return (
    <Animated.View style={[shimmer.bar, { width: width as any, opacity }]} />
  );
}

export default function AiCameraModal({ visible, onClose, onLog }: Props) {
  const [state, setState] = useState<State>('idle');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (visible) {
      AsyncStorage.getItem(API_KEY_STORAGE).then(k => setSavedKey(k));
      setState('idle');
      setPhotoUri(null);
      setResult(null);
    }
  }, [visible]);

  const saveApiKey = async () => {
    if (!apiKey.trim()) return;
    await AsyncStorage.setItem(API_KEY_STORAGE, apiKey.trim());
    setSavedKey(apiKey.trim());
    setState('idle');
  };

  const openCamera = async () => {
    if (!savedKey) { setState('no-api-key'); return; }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to scan food.');
      return;
    }

    const picked = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.6,
      allowsEditing: false,
    });

    if (picked.canceled || !picked.assets?.[0]) return;

    const asset = picked.assets[0];
    setPhotoUri(asset.uri);
    setState('analyzing');

    try {
      await new Promise(r => setTimeout(r, 1500));
      const data = await analyzeFood(asset.base64 ?? '', savedKey);
      setResult(data);
      setState('results');
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Something went wrong. Please try again.');
      setState('error');
    }
  };

  const handleLog = () => {
    if (!result) return;
    onLog(result.items, result.totalCalories);
    onClose();
  };

  const retake = () => {
    setPhotoUri(null);
    setResult(null);
    setState('idle');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {state === 'results' ? 'AI Analysis' : 'Scan Food with AI'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body}>

          {/* IDLE */}
          {state === 'idle' && (
            <View style={styles.centered}>
              <View style={styles.cameraCircle}>
                <Text style={styles.cameraEmoji}>📸</Text>
              </View>
              <Text style={styles.idleTitle}>Point at your meal</Text>
              <Text style={styles.idleSubtitle}>
                Our AI will instantly identify food items and calculate calories and macros.
              </Text>
              <TouchableOpacity style={styles.goldBtn} onPress={openCamera}>
                <Text style={styles.goldBtnText}>Open Camera</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ANALYZING */}
          {state === 'analyzing' && (
            <View style={styles.centered}>
              {photoUri && (
                <Image source={{ uri: photoUri }} style={styles.thumb} />
              )}
              <Text style={styles.analyzingLabel}>Analyzing with AI…</Text>
              <View style={styles.shimmerStack}>
                <ShimmerBar width="80%" />
                <ShimmerBar width="60%" />
                <ShimmerBar width="70%" />
              </View>
            </View>
          )}

          {/* RESULTS */}
          {state === 'results' && result && (
            <>
              {photoUri && (
                <Image source={{ uri: photoUri }} style={styles.resultThumb} />
              )}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Calories</Text>
                <Text style={styles.totalValue}>{result.totalCalories} kcal</Text>
              </View>
              <Text style={styles.detectedLabel}>Detected items</Text>
              {result.items.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCal}>{item.calories} kcal</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.goldBtn} onPress={handleLog}>
                <Text style={styles.goldBtnText}>Log this meal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.retakeBtn} onPress={retake}>
                <Text style={styles.retakeText}>Retake photo</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ERROR */}
          {state === 'error' && (
            <View style={styles.centered}>
              <Text style={styles.errorEmoji}>⚠️</Text>
              <Text style={styles.errorTitle}>Analysis failed</Text>
              <Text style={styles.errorMsg}>{errorMsg}</Text>
              <TouchableOpacity style={styles.goldBtn} onPress={retake}>
                <Text style={styles.goldBtnText}>Try again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* NO API KEY */}
          {state === 'no-api-key' && (
            <View style={styles.apiKeyCard}>
              <Text style={styles.apiKeyTitle}>🔑 Enter your Google AI API key</Text>
              <Text style={styles.apiKeySubtitle}>
                Required to analyse food photos with Gemini Vision. Your key is stored only on this device.
              </Text>
              <TextInput
                style={styles.apiKeyInput}
                placeholder="AIza..."
                placeholderTextColor="#999"
                value={apiKey}
                onChangeText={setApiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.goldBtn, !apiKey.trim() && { opacity: 0.5 }]}
                onPress={saveApiKey}
                disabled={!apiKey.trim()}
              >
                <Text style={styles.goldBtnText}>Save & Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.retakeBtn} onPress={() => setState('idle')}>
                <Text style={styles.retakeText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </View>
    </Modal>
  );
}

const shimmer = StyleSheet.create({
  bar: { height: 14, backgroundColor: '#E8E8E8', borderRadius: 7, marginBottom: 10 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingTop: 24, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111111' },
  close: { fontSize: 18, color: '#999999', paddingHorizontal: 4 },
  body: { padding: 24, paddingBottom: 48, flexGrow: 1 },
  centered: { alignItems: 'center', paddingTop: 32 },
  cameraCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#FBF6EC', borderWidth: 2, borderColor: '#C9A84C',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  cameraEmoji: { fontSize: 48 },
  idleTitle: { fontSize: 22, fontWeight: '700', color: '#111111', marginBottom: 10 },
  idleSubtitle: { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  thumb: { width: '100%', height: 180, borderRadius: 14, marginBottom: 24, resizeMode: 'cover' },
  analyzingLabel: { fontSize: 17, fontWeight: '600', color: '#111111', marginBottom: 20 },
  shimmerStack: { width: '100%', gap: 0 },
  resultThumb: { width: '100%', height: 200, borderRadius: 14, marginBottom: 20, resizeMode: 'cover' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FBF6EC', borderRadius: 14, padding: 16, marginBottom: 20,
  },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#7a6030' },
  totalValue: { fontSize: 28, fontWeight: '800', color: '#C9A84C' },
  detectedLabel: { fontSize: 13, fontWeight: '700', color: '#111111', marginBottom: 10 },
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F7F7F7', borderRadius: 10, padding: 14, marginBottom: 8,
  },
  itemName: { fontSize: 15, fontWeight: '500', color: '#111111' },
  itemCal: { fontSize: 14, fontWeight: '700', color: '#555555' },
  goldBtn: {
    backgroundColor: '#C9A84C', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center',
    width: '100%', marginTop: 20,
  },
  goldBtnText: { color: '#111111', fontSize: 16, fontWeight: '700' },
  retakeBtn: { paddingVertical: 14, alignItems: 'center', width: '100%' },
  retakeText: { color: '#C9A84C', fontSize: 14, fontWeight: '600' },
  errorEmoji: { fontSize: 48, marginBottom: 16 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: '#111111', marginBottom: 8 },
  errorMsg: { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  apiKeyCard: { paddingTop: 16 },
  apiKeyTitle: { fontSize: 18, fontWeight: '700', color: '#111111', marginBottom: 10 },
  apiKeySubtitle: { fontSize: 13, color: '#666666', lineHeight: 20, marginBottom: 20 },
  apiKeyInput: {
    borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: '#111111', backgroundColor: '#FAFAFA',
    marginBottom: 4,
  },
});
