import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../ui/theme';

export default function PriceSummary({ rows }: { rows: [string, string][] }) {
      return (
            <View style={s.card}>
                  {rows.map(([k, v], i) => (
                        <View key={k} style={s.row}>
                              <Text style={s.k}>{k}</Text>
                              <Text style={[s.v, i === rows.length - 1 && { fontWeight: '800' }]}>{v}</Text>
                        </View>
                  ))}
            </View>
      );
}

const s = StyleSheet.create({
      card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 12, gap: 8 },
      row: { flexDirection: 'row', justifyContent: 'space-between' },
      k: { color: COLORS.text },
      v: { color: COLORS.text },
});
