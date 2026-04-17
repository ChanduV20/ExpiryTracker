import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, Platform, TouchableOpacity, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING, FONT } from '../config/theme';
import ProductCard from '../components/ProductCard';
import RecipeModal from '../components/RecipeModal';
import { getProductStatus } from '../utils/statusUtils';
import { useApp } from '../context/AppContext';
import { generateRecipe } from '../services/aiRecipeService';

export default function HomeScreen() {
  const { products, categories, selectedCategory, setSelectedCategory, addProduct, updateProduct, removeProduct, editingId, setEditingId } = useApp();

  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState(new Date());
  const [selectedCat, setSelectedCat] = useState('Uncategorized');
  const [showPicker, setShowPicker] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'expiry', direction: 'asc' });
  
  // 🍳 AI Recipe States
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [recipeModal, setRecipeModal] = useState({ visible: false, recipe: null, loading: false, error: null });

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

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleEdit = (product) => {
    if (selectionMode) return; // Don't edit while selecting
    setName(product.name);
    const [y, m, d] = product.expiry.split('-').map(Number);
    setExpiry(new Date(y, m - 1, d));
    setSelectedCat(product.category || 'Uncategorized');
    setEditingId(product.id);
  };

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Missing Info', 'Please enter a product name.');
    const dateStr = formatDate(expiry);
    try {
      if (editingId) {
        await updateProduct(editingId, { name: name.trim(), expiry: dateStr, category: selectedCat });
        Alert.alert('✅ Updated', 'Product saved');
      } else {
        await addProduct({ name: name.trim(), expiry: dateStr, category: selectedCat, status: 'good' });
        Alert.alert('✅ Added', 'Product saved');
      }
      setEditingId(null); setName(''); setExpiry(new Date()); setSelectedCat('Uncategorized');
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

  const sortedProducts = [...products].sort((a, b) => {
    const { key, direction } = sortConfig;
    const mod = direction === 'asc' ? 1 : -1;
    if (key === 'name') return mod * a.name.localeCompare(b.name);
    if (key === 'expiry') return mod * (new Date(a.expiry) - new Date(b.expiry));
    return 0;
  });

  const productsWithStatus = sortedProducts.map(p => ({ ...p, status: getProductStatus(p.expiry) }));
  const filteredProducts = selectedCategory ? productsWithStatus.filter(p => p.category === selectedCategory) : productsWithStatus;

  const handleGenerateRecipe = async () => {
    if (selectedIds.length < 2) return Alert.alert('Select Items', 'Please select at least 2 products for a recipe.');
    
    setRecipeModal({ visible: true, recipe: null, loading: true, error: null });
    const selectedProducts = products.filter(p => selectedIds.includes(p.id));
    const names = selectedProducts.map(p => p.name);

    try {
      const recipe = await generateRecipe(names);
      setRecipeModal(prev => ({ ...prev, recipe, loading: false }));
      setSelectedIds([]); // Clear selection after success
      setSelectionMode(false);
    } catch (err) {
      setRecipeModal(prev => ({ ...prev, error: err.message, loading: false }));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>📦 Expiry Tracker</Text>
        <TouchableOpacity 
          style={[styles.modeBtn, selectionMode && styles.modeBtnActive]} 
          onPress={() => { setSelectionMode(!selectionMode); setSelectedIds([]); }}
        >
          <Text style={[styles.modeText, selectionMode && styles.modeTextActive]}>
            {selectionMode ? '✓ Done' : '🍳 Select'}
          </Text>
        </TouchableOpacity>
      </View>

      {editingId && <View style={styles.editBanner}><Text style={styles.editText}>✏️ Editing</Text><Button title="Cancel" onPress={() => { setEditingId(null); setName(''); setExpiry(new Date()); }} color={COLORS.danger} /></View>}
      
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Product Name" value={name} onChangeText={setName} editable={!selectionMode} />
        <View style={styles.dateInput}>
          <Text style={styles.dateText}>📅 {formatDate(expiry)}</Text>
          <Button title="Change" onPress={() => setShowPicker(true)} color={COLORS.primary} disabled={selectionMode} />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          <TouchableOpacity style={[styles.chip, selectedCat === 'Uncategorized' && styles.chipActive]} onPress={() => setSelectedCat('Uncategorized')} disabled={selectionMode}>
            <Text style={[styles.chipText, selectedCat === 'Uncategorized' && styles.chipTextActive]}>Uncategorized</Text>
          </TouchableOpacity>
          {categories.map(c => (
            <TouchableOpacity key={c.id} style={[styles.chip, selectedCat === c.name && styles.chipActive]} onPress={() => setSelectedCat(c.name)} disabled={selectionMode}>
              <Text style={[styles.chipText, selectedCat === c.name && styles.chipTextActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Button title={editingId ? "💾 Update" : "➕ Add"} onPress={handleSave} color={editingId ? COLORS.warning : COLORS.primary} disabled={selectionMode} />
      </View>

      {showPicker && <DateTimePicker value={expiry} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'calendar'} onChange={handleDateChange} minimumDate={new Date()} accentColor={COLORS.primary} />}

      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterChip, !selectedCategory && styles.filterChipActive]} onPress={() => setSelectedCategory(null)}>
          <Text style={[styles.filterText, !selectedCategory && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        {categories.map(c => (
          <TouchableOpacity key={c.id} style={[styles.filterChip, selectedCategory === c.name && styles.filterChipActive]} onPress={() => setSelectedCategory(selectedCategory === c.name ? null : c.name)}>
            <Text style={[styles.filterText, selectedCategory === c.name && styles.filterTextActive]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tableHeader}>
        <TouchableOpacity style={{flex:2}} onPress={() => handleSort('name')}><Text style={styles.headerText}>Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</Text></TouchableOpacity>
        <TouchableOpacity style={{flex:1.5}} onPress={() => handleSort('expiry')}><Text style={styles.headerText}>Expiry {sortConfig.key === 'expiry' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</Text></TouchableOpacity>
        <Text style={[styles.headerText, {flex:0.8, textAlign:'center'}]}>St.</Text>
        <Text style={[styles.headerText, {flex:0.7, textAlign:'right'}]}>Act.</Text>
      </View>

      <FlatList 
        data={filteredProducts} 
        keyExtractor={i => i.id} 
        renderItem={({ item }) => (
          <ProductCard 
            name={item.name} 
            expiry={item.expiry} 
            statusColor={item.status.color} 
            statusText={item.status.text} 
            isSelected={selectedIds.includes(item.id)}
            selectionMode={selectionMode}
            onToggleSelect={() => toggleSelection(item.id)}
            onEdit={() => handleEdit(item)} 
            onDelete={() => removeProduct(item.id)} 
          />
        )} 
        ListEmptyComponent={<Text style={styles.empty}>No products yet.</Text>} 
        contentContainerStyle={{ paddingBottom: SPACING.xl + 60 }} 
      />

      {/* 🍳 Floating Recipe Button */}
      {selectionMode && selectedIds.length >= 2 && (
        <TouchableOpacity style={styles.recipeFab} onPress={handleGenerateRecipe}>
          <Text style={styles.recipeFabText}>🍳 Get Recipe ({selectedIds.length})</Text>
        </TouchableOpacity>
      )}

      <RecipeModal 
        visible={recipeModal.visible} 
        recipe={recipeModal.recipe} 
        loading={recipeModal.loading} 
        error={recipeModal.error} 
        onClose={() => setRecipeModal({ visible: false, recipe: null, loading: false, error: null })} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg, paddingTop: SPACING.xl },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  title: { fontSize: 24, fontWeight: FONT.bold, color: COLORS.text },
  modeBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: '#f1f5f9', borderRadius: 20 },
  modeBtnActive: { backgroundColor: COLORS.primary },
  modeText: { fontSize: 14, fontWeight: FONT.medium, color: COLORS.text },
  modeTextActive: { color: '#fff' },
  editBanner: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.warning, padding: SPACING.md, borderRadius: 8, marginBottom: SPACING.md },
  editText: { fontWeight: FONT.bold, color: '#fff' },
  form: { gap: SPACING.md, marginBottom: SPACING.md },
  input: { backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  dateInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  dateText: { fontSize: 15, color: COLORS.text },
  catScroll: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  chip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.text },
  chipTextActive: { color: '#fff', fontWeight: FONT.bold },
  filterRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, backgroundColor: '#f1f5f9', borderRadius: 16 },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterText: { fontSize: 12, color: COLORS.textLight },
  filterTextActive: { color: '#fff', fontWeight: FONT.bold },
  tableHeader: { flexDirection: 'row', paddingVertical: SPACING.sm, borderBottomWidth: 2, borderBottomColor: COLORS.primary, marginBottom: SPACING.xs },
  headerText: { fontSize: 12, fontWeight: FONT.bold, color: COLORS.text, textTransform: 'uppercase' },
  empty: { textAlign: 'center', color: COLORS.textLight, marginTop: SPACING.xl },
  recipeFab: { position: 'absolute', bottom: 20, alignSelf: 'center', backgroundColor: '#10b981', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, elevation: 5, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.2, shadowRadius: 4 },
  recipeFabText: { color: '#fff', fontWeight: FONT.bold, fontSize: 15 }
});