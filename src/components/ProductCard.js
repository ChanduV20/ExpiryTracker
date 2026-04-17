// src/components/ProductCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT } from '../config/theme';

export default function ProductCard({ name, expiry, statusColor, statusText, onEdit, onDelete, onUse }) {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.cellName} onPress={onEdit}>
        <Text style={styles.nameText} numberOfLines={1}>{name}</Text>
      </TouchableOpacity>
      
      <Text style={styles.cellDate}>{expiry}</Text>
      
      <View style={styles.cellStatus}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onUse} style={styles.actionBtn}>
          <Text style={styles.actionText}>✅</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
          <Text style={[styles.actionText, { color: COLORS.danger }]}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  cellName: { flex: 2, paddingRight: SPACING.sm },
  nameText: { fontSize: 15, fontWeight: FONT.medium, color: COLORS.text },
  cellDate: { flex: 1.5, fontSize: 14, color: COLORS.textLight },
  cellStatus: { flex: 0.8, alignItems: 'center', gap: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: FONT.bold },
  actions: { flex: 0.7, flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.xs },
  actionBtn: { padding: SPACING.xs },
  actionText: { fontSize: 16 }
});