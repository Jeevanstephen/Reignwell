import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DashboardScreen from '../screens/DashboardScreen';
import FoodLogScreen from '../screens/FoodLogScreen';
import BloodWorkScreen from '../screens/BloodWorkScreen';
import SupplementsScreen from '../screens/SupplementsScreen';
import AiCoachScreen from '../screens/AiCoachScreen';
import ConnectScreen from '../screens/ConnectScreen';
import GymTrackerScreen from '../screens/GymTrackerScreen';
import QuickActionPanel from '../components/QuickActionPanel';

export type MainTabParamList = {
  Dashboard: undefined;
  FoodLog: undefined;
  BloodWork: undefined;
  Supplements: undefined;
  Coach: undefined;
  Connect: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  GymTracker: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return <Text style={{ fontSize: 19, opacity: focused ? 1 : 0.45 }}>{icon}</Text>;
}

function TabsWithPanel() {
  const navigation = useNavigation<any>();

  const handleNavigate = (screen: string) => {
    if (screen === 'GymTracker') {
      navigation.navigate('GymTracker');
    } else {
      navigation.navigate('Tabs', { screen });
    }
  };

  return (
    <View style={styles.root}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#F0F0F0',
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 65,
          },
          tabBarActiveTintColor: '#C9A84C',
          tabBarInactiveTintColor: '#999999',
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📊" focused={focused} /> }}
        />
        <Tab.Screen
          name="FoodLog"
          component={FoodLogScreen}
          options={{ title: 'Food', tabBarIcon: ({ focused }) => <TabIcon icon="🍽️" focused={focused} /> }}
        />
        <Tab.Screen
          name="BloodWork"
          component={BloodWorkScreen}
          options={{ title: 'Blood', tabBarIcon: ({ focused }) => <TabIcon icon="🩸" focused={focused} /> }}
        />
        <Tab.Screen
          name="Supplements"
          component={SupplementsScreen}
          options={{ title: 'Supps', tabBarIcon: ({ focused }) => <TabIcon icon="💊" focused={focused} /> }}
        />
        <Tab.Screen
          name="Coach"
          component={AiCoachScreen}
          options={{ title: 'Coach', tabBarIcon: ({ focused }) => <TabIcon icon="✦" focused={focused} /> }}
        />
        <Tab.Screen
          name="Connect"
          component={ConnectScreen}
          options={{ title: 'Connect', tabBarIcon: ({ focused }) => <TabIcon icon="⌚" focused={focused} /> }}
        />
      </Tab.Navigator>
      <QuickActionPanel onNavigate={handleNavigate} />
    </View>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabsWithPanel} />
      <Stack.Screen name="GymTracker" component={GymTrackerScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
