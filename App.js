import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { COLORS } from './src/config/theme';
import TabNavigator from './src/navigation/TabNavigator';
import { AppProvider } from './src/context/AppContext';
import * as Notifications from 'expo-notifications';

export default function App() {
  useEffect(() => {
    // 1. Request Permissions
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('🚫 Notification permissions denied');
      }
    };

    // 2. Create Android Channel (Required for Android 8+)
    const setupChannel = async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Expiry Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    };

    requestPermissions();
    setupChannel();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppProvider>
          <View style={styles.container}>
            <StatusBar style="dark" />
            <TabNavigator />
          </View>
        </AppProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
});