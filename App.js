import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { COLORS } from './src/config/theme';
import TabNavigator from './src/navigation/TabNavigator';
import { AppProvider } from './src/context/AppContext'; // 👈 ADD

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppProvider> {/* 👈 WRAP HERE */}
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