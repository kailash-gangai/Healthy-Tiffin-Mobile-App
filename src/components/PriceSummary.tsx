import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Row = [label: string, value: string];

export default function PriceSummary({ rows }: { rows: Row[] }) {
      return (
            <View style={s.card} accessibilityRole="summary">
                  {rows.map(([k, v], i) => {
                        const last = i === rows.length - 1;
                        return (
                              <View key={k} style={[s.row, !last && s.rowDivider]}>
                                    <Text style={[s.k, last && s.kTotal]}>{k}</Text>
                                    <Text style={[s.v, last && s.vTotal]}>{v}</Text>
                              </View>
                        );
                  })}
            </View>
      );
}

const s = StyleSheet.create({
      card: {
            backgroundColor: '#F4F5F6',    // light panel like design
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
      },
      row: {
            minHeight: 36,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
      },
      rowDivider: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: '#DCDCDC',
      },
      k: { color: '#5F5F5F', fontSize: 14 },
      v: { color: '#232323', fontSize: 14 },
      kTotal: { fontWeight: '800', color: '#232323' },
      vTotal: { fontWeight: '800' },
});
