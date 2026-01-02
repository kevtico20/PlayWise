import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function SectionSkeleton() {
  return (
    <View style={styles.row}>
      <View style={styles.card} />
      <View style={styles.card} />
      <View style={styles.card} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  card: {
    width: '32%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
});
