// src/components/RecipeModal.js
import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, FONT } from '../config/theme';

export default function RecipeModal({ visible, recipe, loading, error, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>🍳 AI Recipe</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
          </View>

          {loading && <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />}
          {error && <Text style={styles.error}>{error}</Text>}
          
          {!loading && recipe && (
            <ScrollView style={styles.content}>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              <Text style={styles.meta}>⏱️ {recipe.prepTime}</Text>
              
              <Text style={styles.sectionTitle}>🥗 Ingredients</Text>
              {recipe.ingredients.map((ing, i) => (
                <Text key={i} style={styles.listItem}>• {ing}</Text>
              ))}

              <Text style={styles.sectionTitle}>👨‍ Steps</Text>
              {recipe.steps.map((step, i) => (
                <Text key={i} style={styles.stepItem}>{i + 1}. {step}</Text>
              ))}

              {recipe.tip && <Text style={styles.tip}>💡 Tip: {recipe.tip}</Text>}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.footerBtn} onPress={onClose}>
            <Text style={styles.footerText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  container: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', padding: SPACING.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  title: { fontSize: 20, fontWeight: FONT.bold, color: COLORS.text },
  closeBtn: { fontSize: 24, color: COLORS.textLight },
  loader: { marginVertical: 40 },
  error: { color: COLORS.danger, textAlign: 'center', marginVertical: 20 },
  content: { marginBottom: SPACING.md },
  recipeTitle: { fontSize: 18, fontWeight: FONT.bold, color: COLORS.primary, marginBottom: SPACING.xs },
  meta: { fontSize: 14, color: COLORS.textLight, marginBottom: SPACING.md },
  sectionTitle: { fontSize: 16, fontWeight: FONT.bold, color: COLORS.text, marginTop: SPACING.md, marginBottom: SPACING.xs },
  listItem: { fontSize: 14, color: COLORS.text, marginBottom: 4, marginLeft: SPACING.sm },
  stepItem: { fontSize: 14, color: COLORS.text, marginBottom: 6, lineHeight: 20 },
  tip: { fontSize: 13, color: COLORS.textLight, fontStyle: 'italic', marginTop: SPACING.md, padding: SPACING.md, backgroundColor: '#f8fafc', borderRadius: 8 },
  footerBtn: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: 12, alignItems: 'center' },
  footerText: { color: '#fff', fontWeight: FONT.bold, fontSize: 16 }
});