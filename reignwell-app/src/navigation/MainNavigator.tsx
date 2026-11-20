import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DashboardScreen from '../screens/DashboardScreen';
import FoodLogScreen from '../screens/FoodLogScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GymTrackerScreen from '../screens/GymTrackerScreen';
import RegimensScreen from '../screens/RegimensScreen';
import BloodMarkersScreen from '../screens/BloodMarkersScreen';
import MealSuggestionsScreen from '../screens/MealSuggestionsScreen';
import JournalScreen from '../screens/JournalScreen';
import ShopScreen from '../screens/ShopScreen';
import QuickActionPanel from '../components/QuickActionPanel';

export type MainTabParamList = {
  Dashboard: undefined;
  FoodLog: undefined;
  Progress: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  GymTracker: undefined;
  Regimens: undefined;
  BloodMarkers: undefined;
  MealSuggestions: undefined;
  Journal: undefined;
  Shop: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return <Text style={{ fontSize: 19, opacity: focused ? 1 : 0.45 }}>{icon}</Text>;
}

function TabsWithPanel() {
  const navigation = useNavigation<any>();

  const handleNavigate = (screen: string) => {
    const stackScreens = ['GymTracker', 'Regimens', 'BloodMarkers', 'MealSuggestions', 'Journal', 'Shop'];
    if (stackScreens.includes(screen)) {
      navigation.navigate(screen);
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
          name="Progress"
          component={ProgressScreen}
          options={{ title: 'Progress', tabBarIcon: ({ focused }) => <TabIcon icon="📈" focused={focused} /> }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} /> }}
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
      <Stack.Screen name="Regimens" component={RegimensScreen} />
      <Stack.Screen name="BloodMarkers" component={BloodMarkersScreen} />
      <Stack.Screen name="MealSuggestions" component={MealSuggestionsScreen} />
      <Stack.Screen name="Journal" component={JournalScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
