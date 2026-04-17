// src/components/ProductCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT } from '../config/theme';

export default function ProductCard({ name, expiry, statusColor, statusText, onEdit, onDelete, isSelected, selectionMode, onToggleSelect }) {
  return (
    <TouchableOpacity 
      style={[styles.row, selectionMode && styles.rowSelectable]} 
      activeOpacity={selectionMode ? 0.6 : 0.2}
      onPress={() => selectionMode ? onToggleSelect() : onEdit()}
    >
      {/* Checkbox (Only in selection mode) */}
      {selectionMode && (
        <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      )}

      <View style={styles.cellName}>
        <Text style={[styles.nameText, selectionMode && isSelected && styles.nameSelected]} numberOfLines={1}>{name}</Text>
      </View>
      
      <Text style={styles.cellDate}>{expiry}</Text>
      
      <View style={styles.cellStatus}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
      </View>

      {!selectionMode && (
        <View style={styles.actions}>
          <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
            <Text style={[styles.actionText, { color: COLORS.danger }]}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  rowSelectable: { backgroundColor: '#f8fafc' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  checkboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: FONT.bold },
  cellName: { flex: 2, paddingRight: SPACING.sm },
  nameText: { fontSize: 15, fontWeight: FONT.medium, color: COLORS.text },
  nameSelected: { color: COLORS.primary, fontWeight: FONT.bold },
  cellDate: { flex: 1.5, fontSize: 14, color: COLORS.textLight },
  cellStatus: { flex: 0.8, alignItems: 'center', gap: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: FONT.bold },
  actions: { flex: 0.7, flexDirection: 'row', justifyContent: 'flex-end' },
  actionBtn: { padding: SPACING.xs }
});