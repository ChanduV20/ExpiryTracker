import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native'; // 👈 Added View
import { COLORS } from '../config/theme';
import HomeScreen from '../screens/HomeScreen';
import ScannerScreen from '../screens/ScannerScreen';

const SettingsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 18 }}>⚙️ Settings Coming Soon</Text>
  </View>
);

const Tab = createBottomTabNavigator();

const IconText = ({ children }) => <Text style={{ fontSize: 22 }}>{children}</Text>;

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: { backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border, paddingBottom: 5, height: 60 },
      }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Products', tabBarIcon: () => <IconText>📦</IconText> }} />
      <Tab.Screen name="Scanner" component={ScannerScreen} options={{ tabBarLabel: 'Scan', tabBarIcon: () => <IconText>📷</IconText> }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings', tabBarIcon: () => <IconText>⚙️</IconText> }} />
    </Tab.Navigator>
  );
}