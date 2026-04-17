// src/App.js
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { COLORS } from './src/config/theme';
import TabNavigator from './src/navigation/TabNavigator';
import { AppProvider } from './src/context/AppContext';
import * as Notifications from 'expo-notifications';
import { debugGroq } from './src/services/aiRecipeService'; // ✅ Import NEW debug function

export default function App() {
  useEffect(() => {
    // 1. Request Notification Permissions
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('🚫 Notification permissions denied');
      }
    };

    // 2. Create Android Notification Channel
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

    // 3. 🔍 Run Groq Diagnostic (Replaces old HF debug)
    const runDiagnostics = async () => {
      console.log("🚀 App starting...");
      // Uncomment next line to verify Groq API key on startup:
      // debugGroq(); 
    };

    requestPermissions();
    setupChannel();
    runDiagnostics();
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