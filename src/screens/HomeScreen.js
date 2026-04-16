import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING, FONT } from '../config/theme';
import ProductCard from '../components/ProductCard';
import { useApp } from '../context/AppContext';
import { useRoute, useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const { products, addProduct, removeProduct } = useApp();
  const route = useRoute(); 
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.prefillDate) {
        const [y, m, d] = route.params.prefillDate.split('-').map(Number);
        setExpiry(new Date(y, m - 1, d));
        route.params.prefillDate = null; // Clear to prevent re-trigger
      }
    }, [route.params?.prefillDate])
  );

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) setExpiry(selectedDate);
  };

  const handleAdd = () => {
    if (!name.trim()) return Alert.alert('Missing Info', 'Please enter a product name.');

    addProduct({
      name: name.trim(),
      expiry: formatDate(expiry),
      status: 'good',
    });

    setName('');
    setExpiry(new Date());
    Alert.alert('✅ Added', `${name.trim()} saved!`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Expiry Tracker</Text>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Product Name" value={name} onChangeText={setName} />
        <View style={styles.dateInput}>
          <Text style={styles.dateText}>📅 {formatDate(expiry)}</Text>
          <Button title="Change" onPress={() => setShowPicker(true)} color={COLORS.primary} />
        </View>
        <Button title="Add Product" onPress={handleAdd} color={COLORS.primary} />
      </View>

      {showPicker && (
        <DateTimePicker
          value={expiry}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          onChange={handleDateChange}
          minimumDate={new Date()}
          accentColor={COLORS.primary}
          textColor={COLORS.text}
        />
      )}

      <Text style={styles.sectionTitle}>Your Products</Text>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ProductCard 
            name={item.name} 
            expiry={item.expiry} 
            status={item.status}
            onDelete={() => removeProduct(item.id)}
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No products added yet. Scan or add manually!</Text>}
        contentContainerStyle={{ paddingBottom: SPACING.xl }}/>
    </View>
  );
}

// (Keep the same styles object from Step 2)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg, paddingTop: SPACING.xl },
  title: { fontSize: 24, fontWeight: FONT.bold, color: COLORS.text, marginBottom: SPACING.lg },
  form: { gap: SPACING.md, marginBottom: SPACING.xl },
  input: { backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text },
  dateInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  dateText: { fontSize: 15, color: COLORS.text },
  sectionTitle: { fontSize: 18, fontWeight: FONT.medium, color: COLORS.text, marginBottom: SPACING.md },
  emptyText: { textAlign: 'center', color: COLORS.textLight, marginTop: SPACING.xl },
});