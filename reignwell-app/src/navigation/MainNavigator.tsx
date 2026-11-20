import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import FoodLogScreen from '../screens/FoodLogScreen';
import BloodWorkScreen from '../screens/BloodWorkScreen';
import SupplementsScreen from '../screens/SupplementsScreen';
import AiCoachScreen from '../screens/AiCoachScreen';
import ConnectScreen from '../screens/ConnectScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  FoodLog: undefined;
  BloodWork: undefined;
  Supplements: undefined;
  Coach: undefined;
  Connect: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return <Text style={{ fontSize: 19, opacity: focused ? 1 : 0.45 }}>{icon}</Text>;
}

export default function MainNavigator() {
  return (
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
  );
}
