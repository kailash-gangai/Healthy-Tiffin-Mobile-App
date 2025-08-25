import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../ui/theme';

export default function StatChips({ items }: { items: { label: string; sub: string }[] }) {
      return (
            <View style={s.wrap}>
                  {items.map((it, i) => (
                        <View key={i} style={s.chip}>
                              <Text style={s.big}>{it.label}</Text>
                              <Text style={s.sub}>{it.sub}</Text>
                        </View>
                  ))}
            </View>
      );
}

const s = StyleSheet.create({
      wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
      chip: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: COLORS.card },
      big: { fontWeight: '800', color: COLORS.text },
      sub: { color: COLORS.sub, fontSize: 12 },
});
