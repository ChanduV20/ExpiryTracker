import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING, FONT } from '../config/theme';
import ProductCard from '../components/ProductCard';

const MOCK_PRODUCTS = [
  { id: '1', name: 'Milk 1L', expiry: '2026-04-20', status: 'warning' },
  { id: '2', name: 'Bread', expiry: '2026-04-15', status: 'danger' },
];

export default function HomeScreen() {
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  // Format date for display
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setExpiry(selectedDate);
    }
  };

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert('Missing Info', 'Please enter a product name.');
      return;
    }

    const dateString = formatDate(expiry);
    const newProduct = {
      id: Date.now().toString(),
      name: name.trim(),
      expiry: dateString,
      status: 'good',
    };

    setProducts([newProduct, ...products]);
    setName('');
    setExpiry(new Date()); // Reset to today
    Alert.alert('✅ Added', `${name} saved with expiry ${dateString}`);
  };

  const handleDelete = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Expiry Tracker</Text>

      {/* Input Section */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Product Name"
          value={name}
          onChangeText={setName}
        />
        
        {/* Date Picker Trigger */}
        <View style={styles.dateInput}>
          <Text style={styles.dateText}>📅 {formatDate(expiry)}</Text>
          <Button 
            title="Change" 
            onPress={() => setShowPicker(true)} 
            color={COLORS.primary} 
          />
        </View>

        <Button title="Add Product" onPress={handleAdd} color={COLORS.primary} />
      </View>

      {/* Date Picker Modal */}

        {showPicker && (
        <DateTimePicker
            value={expiry}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
            onChange={(event, selectedDate) => {
            const currentDate = selectedDate || expiry;
            setShowPicker(false); // Close immediately on Android
            setExpiry(currentDate);
            }}
            minimumDate={new Date()}
            accentColor={COLORS.primary}
            textColor={COLORS.text}
        />
        )}

      {/* List Section */}
      <Text style={styles.sectionTitle}>Your Products</Text>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ProductCard 
            name={item.name} 
            expiry={item.expiry} 
            status={item.status}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No products added yet.</Text>}
        contentContainerStyle={{ paddingBottom: SPACING.xl }}
      />
    </View>
  );
}

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