import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CrownLogo from '../components/CrownLogo';
import { AuthStackParamList } from '../navigation/types';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Onboarding'> };

export default function OnboardingScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.logoSection}>
        <CrownLogo crownSize={72} fontSize={24} color="#111111" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingTop: 100,
    paddingBottom: 52,
  },
  logoSection: { alignItems: 'center', gap: 20 },
  tagline: {
    fontSize: 20,
    color: '#C9A84C',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  sub: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 4,
  },
  actions: { gap: 12 },
  primaryBtn: {
    backgroundColor: '#C9A84C',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#111111', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: '#DDDDDD',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnText: { color: '#111111', fontSize: 16, fontWeight: '500' },
});
