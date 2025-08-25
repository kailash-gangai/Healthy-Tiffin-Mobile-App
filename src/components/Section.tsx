import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Fontisto } from '@react-native-vector-icons/fontisto';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { COLORS } from '../ui/theme';

export default function Section({
      title, note, children, collapsed = false,
}: { title: string; note?: string; children?: React.ReactNode; collapsed?: boolean }) {
      const [open, setOpen] = React.useState(!collapsed);
      return (
            <View style={s.card}>
                  <TouchableOpacity style={s.head} onPress={() => setOpen(o => !o)}>
                        <Text style={s.title}>• {title}</Text>
                        <FontAwesome5 iconStyle='solid' name={open ? 'minus' : 'plus'} size={16} color={COLORS.text} />
                  </TouchableOpacity>
                  {!!note && <Text style={s.note}>{note}</Text>}
                  {open && <View style={{ marginTop: 8, gap: 10 }}>{children}</View>}
            </View>
      );
}

const s = StyleSheet.create({
      card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
      head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
      title: { fontWeight: '800', color: COLORS.text },
      note: { color: COLORS.sub, marginTop: 2, fontSize: 12 },
});
