import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { COLORS, SPACING, FONT } from '../config/theme';

export default function ScannerScreen() {
  const navigation = useNavigation();
  const { addProduct, updateProduct, editingId, setEditingId } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);

  const handleBarCodeScanned = useCallback(async ({ data }) => {
    setScanning(false);
    setLoading(true);

    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const json = await res.json();
      const name = json.status === 1 && json.product?.product_name ? json.product.product_name : `Product ${data}`;
      
      if (editingId) {
        await updateProduct(editingId, { name, barcode: data });
        setEditingId(null);
        Alert.alert('✅ Updated', `${name} refreshed`);
      } else {
        await addProduct({ name, barcode: data, expiry: new Date().toISOString().split('T')[0], status: 'good' });
        Alert.alert('✅ Added', `${name} saved`);
      }
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('⚠️ Network Error', 'Could not fetch product details.');
    } finally {
      setLoading(false);
      setTimeout(() => setScanning(true), 1500);
    }
  }, [addProduct, updateProduct, editingId, setEditingId, navigation]);

  if (!permission) return <ActivityIndicator style={styles.center} size="large" color={COLORS.primary} />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Camera access required</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanning && !loading ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'qr'] }}
      />
      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
        <Text style={styles.hint}>Align barcode within frame</Text>
        {loading && <ActivityIndicator size="large" color="#fff" />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  message: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: SPACING.lg },
  btn: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: FONT.bold },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)', borderRadius: 20 },
  hint: { color: '#fff', marginTop: SPACING.md, fontSize: 14, opacity: 0.8 }
});