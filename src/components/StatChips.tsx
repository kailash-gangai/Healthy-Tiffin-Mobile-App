import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SHADOW, RADIUS, SPACING } from '../ui/theme';

type Item = { value: string; unit: string; color: string, bgColor: string, type: string };
const DIAMETER = 72;

export default function StatsCard({ items }: { items: Item[] }) {
      return (

            < View style={s.cardWrap} >
                  <View style={s.card}>
                        <View style={s.rowStats}>
                              {items.map((it, i) => (
                                    <View key={i} style={[s.pill, s.circle, { backgroundColor: it.bgColor, }]}>
                                          <Text style={s.value}>
                                                <Text style={[s.value, { color: it.color }]}> {it.value}</Text>
                                                {it.unit ? <Text style={[s.unit, { color: it.color }]}> {it.unit}</Text> : null}
                                          </Text>
                                          <Text style={s.label}>{it.type}</Text>
                                    </View>
                              ))}
                        </View>
                  </View>
            </View >
      );
}

const s = StyleSheet.create({
      cardWrap: {
            backgroundColor: COLORS.white,
            alignItems: 'center',
            marginTop: -16,
            borderTopLeftRadius: RADIUS,
            borderTopRightRadius: RADIUS,

      },
      card: {
            marginVertical: 26,
            backgroundColor: COLORS.white,
            borderRadius: 20,
            paddingVertical: 14,
            paddingHorizontal: 8,
            ...SHADOW,
      },
      rowStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'space-around' },
      pill: { alignItems: 'center', justifyContent: 'center', padding: 4 },
      value: { fontWeight: '800', fontSize: 16, },
      unit: { fontSize: 10 },
      label: { fontSize: 12, color: '#000', fontWeight: '800' },
      circle: {
            width: DIAMETER,
            height: DIAMETER,
            borderRadius: DIAMETER / 2,
            alignItems: 'center',
            justifyContent: 'center',
      },

});
