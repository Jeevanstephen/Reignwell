import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Onboarding'> };

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }: Props) {
  return (
    <LinearGradient colors={['#111111', '#1a1a1a']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoRow}>
          <Text style={styles.crown}>♛</Text>
          <Text style={styles.logoText}>REIGNWELL</Text>
        </View>
        <Text style={styles.tagline}>Your health. Elevated.</Text>
        <Text style={styles.sub}>
          Track nutrition, monitor biomarkers, and unlock your peak performance with AI-powered insights.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.primaryBtnText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.secondaryBtnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  crown: { fontSize: 36, color: '#C9A84C', marginRight: 10 },
  logoText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 20,
    color: '#C9A84C',
    marginBottom: 16,
    fontWeight: '500',
    letterSpacing: 1,
  },
  sub: {
    fontSize: 15,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: { paddingHorizontal: 24, paddingBottom: 48, gap: 12 },
  primaryBtn: {
    backgroundColor: '#C9A84C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#111111', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
});
