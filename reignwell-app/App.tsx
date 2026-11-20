import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { View, ActivityIndicator } from 'react-native';

function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#C9A84C" />
      </View>
    );
  }

  return session ? <MainNavigator /> : <AuthNavigator />;
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return (
      <>
        <StatusBar style="dark" />
        <SplashScreen onFinish={() => setSplashDone(true)} />
      </>
    );
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
