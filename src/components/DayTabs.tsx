import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../ui/theme';

export default function DayTabs({ days, index, onChange }: { days: string[]; index: number; onChange: (i: number) => void }) {
      return (
            <View>
                  <View style={s.header}>
                        <TouchableOpacity style={s.nav} onPress={() => onChange(Math.max(0, index - 1))}><Text style={s.navTxt}>{'<'}</Text></TouchableOpacity>
                        <Text style={s.today}>Today</Text>
                        <Text style={s.title}>{days[index]}</Text>
                        <TouchableOpacity style={s.nav} onPress={() => onChange(Math.min(days.length - 1, index + 1))}><Text style={s.navTxt}>{'>'}</Text></TouchableOpacity>
                  </View>
                  <View style={s.days}>
                        {days.map((d, i) => (
                              <TouchableOpacity key={d} onPress={() => onChange(i)} style={[s.day, i === index && s.dayOn]}>
                                    <Text style={[s.dayTxt, i === index && { color: COLORS.white }]}>{d.slice(0, 3).toLowerCase()}</Text>
                              </TouchableOpacity>
                        ))}
                  </View>
            </View>
      );
}

const s = StyleSheet.create({
      header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
      nav: { width: 28, height: 28, borderRadius: 6, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
      navTxt: { color: COLORS.text, fontWeight: '700' },
      today: { color: COLORS.green, fontWeight: '700', marginLeft: 4 },
      title: { flex: 1, fontWeight: '800', color: COLORS.text },
      days: { flexDirection: 'row', gap: 8, marginTop: 8 },
      day: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: COLORS.card },
      dayOn: { backgroundColor: COLORS.green },
      dayTxt: { color: COLORS.text, fontSize: 12 },
});
