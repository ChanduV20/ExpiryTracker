import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { COLORS, SPACING, FONT } from '../config/theme';
import ProductCard from '../components/ProductCard';

// Temporary mock data to test UI
const MOCK_PRODUCTS = [
  { id: '1', name: 'Milk 1L', expiry: '2026-04-20', status: 'warning' },
  { id: '2', name: 'Bread', expiry: '2026-04-15', status: 'danger' },
  { id: '3', name: 'Yogurt', expiry: '2026-05-01', status: 'good' },
];

export default function HomeScreen() {
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  const handleAdd = () => {
    if (!name || !expiry) {
      Alert.alert('Missing Info', 'Please enter both name and expiry date.');
      return;
    }
    // Simple validation: expect YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiry)) {
      Alert.alert('Invalid Date', 'Use format: YYYY-MM-DD');
      return;
    }

    const newProduct = {
      id: Date.now().toString(),
      name,
      expiry,
      status: 'good', // We'll calculate this properly later
    };

    setProducts([newProduct, ...products]);
    setName('');
    setExpiry('');
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
        <TextInput
          style={styles.input}
          placeholder="Expiry (YYYY-MM-DD)"
          value={expiry}
          onChangeText={setExpiry}
          keyboardType="numbers-and-punctuation"
        />
        <Button title="Add Product" onPress={handleAdd} color={COLORS.primary} />
      </View>

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
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg, paddingTop: SPACING.xl },
  title: { fontSize: 24, fontWeight: FONT.bold, color: COLORS.text, marginBottom: SPACING.lg },
  form: { gap: SPACING.md, marginBottom: SPACING.xl },
  input: { backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text },
  sectionTitle: { fontSize: 18, fontWeight: FONT.medium, color: COLORS.text, marginBottom: SPACING.md },
  emptyText: { textAlign: 'center', color: COLORS.textLight, marginTop: SPACING.xl },
});