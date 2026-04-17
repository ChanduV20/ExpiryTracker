// src/screens/CategoriesScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useApp } from '../context/AppContext';
import { COLORS, SPACING, FONT } from '../config/theme';

export default function CategoriesScreen() {
  const { categories, addCategory, removeCategory, selectedCategory, setSelectedCategory } = useApp();
  const [newCat, setNewCat] = useState('');

  const handleAdd = async () => {
    if (!newCat.trim()) {
      Alert.alert('Missing Info', 'Please enter a category name');
      return;
    }
    
    try {
      await addCategory(newCat.trim());
      setNewCat(''); // Clear input after success
      Alert.alert('✅ Success', `Category "${newCat}" created!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create category. Check your internet connection.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Text style={styles.title}>📂 Categories</Text>
      
      <View style={styles.inputRow}>
        <TextInput 
          style={styles.input} 
          placeholder="Enter category name..." 
          value={newCat} 
          onChangeText={setNewCat}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Tap category to filter products</Text>
      
      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.row, selectedCategory === item.name && styles.rowSelected]}>
            <TouchableOpacity 
              style={styles.catBtn} 
              onPress={() => setSelectedCategory(selectedCategory === item.name ? null : item.name)}
            >
              <Text style={[styles.catText, selectedCategory === item.name && styles.catTextSelected]}>
                {selectedCategory === item.name ? '🔘 ' : '⚪ '}{item.name}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              Alert.alert('Delete Category?', `Remove "${item.name}"?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => removeCategory(item.id) }
              ]);
            }}>
              <Text style={styles.delText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No categories yet.{"\n"}Add one above to organize your products!</Text>
        }
        contentContainerStyle={{ paddingBottom: SPACING.xl }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg, paddingTop: SPACING.xl },
  title: { fontSize: 24, fontWeight: FONT.bold, color: COLORS.text, marginBottom: SPACING.lg },
  inputRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  input: { flex: 1, backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, fontSize: 15 },
  addBtn: { backgroundColor: COLORS.primary, width: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  addText: { color: '#fff', fontSize: 28, fontWeight: FONT.bold, paddingBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textLight, marginBottom: SPACING.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: 8, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  rowSelected: { borderColor: COLORS.primary, backgroundColor: '#E8F4FD' },
  catBtn: { flex: 1 },
  catText: { fontSize: 16, fontWeight: FONT.medium, color: COLORS.text },
  catTextSelected: { color: COLORS.primary, fontWeight: FONT.bold },
  delText: { color: COLORS.danger, fontSize: 18, padding: SPACING.sm },
  empty: { textAlign: 'center', color: COLORS.textLight, marginTop: SPACING.xl, fontSize: 14, lineHeight: 22 }
});