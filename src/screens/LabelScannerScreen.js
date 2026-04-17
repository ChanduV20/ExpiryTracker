import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { COLORS, SPACING, FONT } from '../config/theme';

const OCR_API_KEY = process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY;

export default function LabelScannerScreen() {
  const navigation = useNavigation();
  const { addProduct, updateProduct, editingId, setEditingId } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);

  const extractExpiryFromText = (text) => {
    const patterns = [
      /(?:EXP|Best\s*Before|BB|Use\s*By|Expiry)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}(?:[\/\-\.]\d{2,4})?)/i,
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
      /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*\d{2,4})/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return normalizeDate(match[1]);
    }
    return null;
  };

  const normalizeDate = (raw) => {
    const cleaned = raw.replace(/[\/\-\.]/g, '-');
    const parts = cleaned.split('-').map(p => parseInt(p, 10));
    if (parts.length !== 3) return raw;
    let [a, b, c] = parts;
    if (c > 31) return `${c}-${String(a).padStart(2, '0')}-${String(b).padStart(2, '0')}`;
    if (a > 31) return `${a}-${String(b).padStart(2, '0')}-${String(c).padStart(2, '0')}`;
    if (b > 31) return `${b}-${String(a).padStart(2, '0')}-${String(c).padStart(2, '0')}`;
    if (c < 100) c += c < 50 ? 2000 : 1900;
    return `${c}-${String(a).padStart(2, '0')}-${String(b).padStart(2, '0')}`;
  };

  const callOCRAPI = async (imageUri) => {
    const formData = new FormData();
    formData.append('apikey', OCR_API_KEY);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('file', { uri: imageUri, name: 'image.jpg', type: 'image/jpeg' });

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const result = await response.json();
    if (result.IsErroredOnProcessing) throw new Error(result.ErrorMessage?.[0] || 'OCR failed');
    return result.ParsedResults?.[0]?.ParsedText || '';
  };

  const processImage = async (imageUri) => {
    setLoading(true);
    try {
      const extractedText = await callOCRAPI(imageUri);
      const date = extractExpiryFromText(extractedText);

      if (date) {
        if (editingId) {
          await updateProduct(editingId, { expiry: date });
          setEditingId(null);
          Alert.alert('✅ Date Updated', `Expiry set to ${date}`);
        } else {
          await addProduct({ name: 'Scanned Product', expiry: date, status: 'good' });
          Alert.alert('✅ Added', `Expiry set to ${date}`);
        }
        navigation.navigate('Home');
      } else {
        Alert.alert('⚠️ No Date Found', 'Try clearer image or enter manually.');
      }
    } catch (error) {
      Alert.alert('OCR Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false });
    await processImage(photo.uri);
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access needed.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets[0]) await processImage(result.assets[0].uri);
  };

  if (!permission) return <ActivityIndicator style={styles.center} size="large" color={COLORS.primary} />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Camera access required for label scanning</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFillObject} ref={cameraRef} />
      <View style={styles.overlay}>
        <View style={styles.frame} />
        <Text style={styles.hint}>Align expiry text clearly</Text>
        {loading && <ActivityIndicator size="large" color="#fff" />}
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.captureBtn, loading && styles.disabled]} onPress={handleCapture} disabled={loading}>
          <Text style={styles.captureText}>{loading ? 'Processing...' : '📸 Capture'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.galleryBtn, loading && styles.disabled]} onPress={pickFromGallery} disabled={loading}>
          <Text style={styles.galleryText}>🖼️ Gallery</Text>
        </TouchableOpacity>
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
  frame: { width: 280, height: 160, borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)', borderRadius: 16 },
  hint: { color: '#fff', marginTop: SPACING.md, fontSize: 14, opacity: 0.9 },
  buttonRow: { position: 'absolute', bottom: 40, flexDirection: 'row', alignSelf: 'center', gap: SPACING.md },
  captureBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 30, elevation: 4 },
  captureText: { color: '#fff', fontSize: 16, fontWeight: FONT.bold },
  galleryBtn: { backgroundColor: 'rgba(255,255,255,0.9)', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 30 },
  galleryText: { color: COLORS.text, fontSize: 16 },
  disabled: { opacity: 0.5 }
});