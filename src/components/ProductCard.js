import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT } from '../config/theme';

export default function ProductCard({ name, expiry, status, onDelete }) {
  // status: 'good' | 'warning' | 'danger' | 'expired'
  const statusColors = {
    good: COLORS.success,
    warning: COLORS.warning,
    danger: COLORS.danger,
    expired: '#888888',
  };

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.expiry}>Expires: {expiry}</Text>
      </View>
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: statusColors[status] }]} />
        <Text style={styles.statusText}>{status}</Text>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  info: { flex: 2 },
  name: { fontSize: 16, fontWeight: FONT.bold, color: COLORS.text },
  expiry: { fontSize: 13, color: COLORS.textLight, marginTop: SPACING.xs },
  statusContainer: { flex: 1, alignItems: 'center', gap: SPACING.xs },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: FONT.medium, color: COLORS.textLight },
  deleteBtn: { padding: SPACING.sm, marginLeft: SPACING.xs },
  deleteText: { color: COLORS.danger, fontSize: 18, fontWeight: FONT.bold },
});