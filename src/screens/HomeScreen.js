import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING, FONT } from '../config/theme';
import ProductCard from '../components/ProductCard';
import { useApp } from '../context/AppContext';
import { getProductStatus } from '../utils/statusUtils';


export default function HomeScreen({ navigation }) {
  const { products, addProduct, updateProduct, removeProduct, editingId, setEditingId } = useApp();

  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  
  // ✅ Sort state
  const [sortConfig, setSortConfig] = useState({ key: 'expiry', direction: 'asc' });

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

  const handleEdit = (product) => {
    setName(product.name);
    const [y, m, d] = product.expiry.split('-').map(Number);
    setExpiry(new Date(y, m - 1, d));
    setEditingId(product.id);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      return Alert.alert('Missing Info', 'Please enter a product name.');
    }

    const dateStr = formatDate(expiry);

    try {
      if (editingId) {
        await updateProduct(editingId, { name: name.trim(), expiry: dateStr });
        Alert.alert('✅ Updated', 'Product saved successfully');
      } else {
        await addProduct({ name: name.trim(), expiry: dateStr, status: 'good' });
        Alert.alert('✅ Added', 'Product saved successfully');
      }
      setEditingId(null);
      setName('');
      setExpiry(new Date());
    } catch (error) {
      Alert.alert('Save Error', error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setExpiry(new Date());
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeProduct(id),
        },
      ]
    );
  };

  const handleUse = (id, productName) => {
    Alert.alert(
      `Used: ${productName}`,
      'Great job using it before expiry! +10 XP 🎮',
      [{ text: 'Nice!' }]
    );
    // Gamification: We'll add XP logic in Step 11
  };

  // ✅ Sort handler
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // ✅ Sort products before rendering
  const sortedProducts = [...products].sort((a, b) => {
    const { key, direction } = sortConfig;
    const modifier = direction === 'asc' ? 1 : -1;
    if (key === 'name') return modifier * a.name.localeCompare(b.name);
    if (key === 'expiry') return modifier * (new Date(a.expiry) - new Date(b.expiry));
    return 0;
  });

  // ✅ COMPUTE DYNAMIC STATUS FOR EACH PRODUCT
  const productsWithStatus = sortedProducts.map(product => ({
    ...product,
    status: getProductStatus(product.expiry) // Adds { color, text }
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Expiry Tracker</Text>

      {editingId && (
        <View style={styles.editBanner}>
          <Text style={styles.editBannerText}>✏️ Editing Product</Text>
          <Button title="Cancel" onPress={handleCancelEdit} color={COLORS.danger} />
        </View>
      )}

      {/* Input Form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Product Name"
          value={name}
          onChangeText={setName}
        />
        <View style={styles.dateInput}>
          <Text style={styles.dateText}>📅 {formatDate(expiry)}</Text>
          <Button title="Change" onPress={() => setShowPicker(true)} color={COLORS.primary} />
        </View>
        <Button
          title={editingId ? "💾 Update Product" : "➕ Add Product"}
          onPress={handleSave}
          color={editingId ? COLORS.warning : COLORS.primary}
        />
      </View>

      {/* Date Picker */}
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

      {/* ✅ Sortable Table Header */}
      <View style={styles.tableHeader}>
        <TouchableOpacity 
          style={[styles.headerCell, { flex: 2 }]} 
          onPress={() => handleSort('name')}
          activeOpacity={0.7}
        >
          <Text style={styles.headerText}>
            Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.headerCell, { flex: 1.5 }]} 
          onPress={() => handleSort('expiry')}
          activeOpacity={0.7}
        >
          <Text style={styles.headerText}>
            Expiry {sortConfig.key === 'expiry' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
          </Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerText, { flex: 0.5, textAlign: 'center' }]}>St.</Text>
        <Text style={[styles.headerText, { flex: 0.8, textAlign: 'right' }]}>Actions</Text>
      </View>

      {/* ✅ Product List with Sorted Data */}
      <FlatList
        data={productsWithStatus}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            name={item.name}
            expiry={item.expiry}
            statusColor={item.status.color}   // 👈 Pass color
            statusText={item.status.text}     // 👈 Pass text
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item.id)}
            onUse={() => handleUse(item.id, item.name)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No products yet. Add manually or scan!</Text>
        }
        contentContainerStyle={{ paddingBottom: SPACING.xl }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background, 
    padding: SPACING.lg, 
    paddingTop: SPACING.xl 
  },
  title: { 
    fontSize: 24, 
    fontWeight: FONT.bold, 
    color: COLORS.text, 
    marginBottom: SPACING.lg 
  },
  editBanner: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: COLORS.warning, 
    padding: SPACING.md, 
    borderRadius: 8, 
    marginBottom: SPACING.md 
  },
  editBannerText: { 
    fontWeight: FONT.bold, 
    color: '#fff' 
  },
  form: { 
    gap: SPACING.md, 
    marginBottom: SPACING.md 
  },
  input: { 
    backgroundColor: COLORS.card, 
    padding: SPACING.md, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    color: COLORS.text 
  },
  dateInput: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: COLORS.card, 
    padding: SPACING.md, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  dateText: { 
    fontSize: 15, 
    color: COLORS.text 
  },
  
  // ✅ Table Header Styles
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.card,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  headerCell: {
    paddingRight: SPACING.sm,
  },
  headerText: {
    fontSize: 13,
    fontWeight: FONT.bold,
    color: COLORS.text,
    textTransform: 'uppercase',
  },
  
  // ✅ List Styles
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: FONT.medium, 
    color: COLORS.text, 
    marginBottom: SPACING.md 
  },
  emptyText: { 
    textAlign: 'center', 
    color: COLORS.textLight, 
    marginTop: SPACING.xl, 
    fontSize: 14 
  },
});