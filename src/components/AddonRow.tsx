import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Fontisto } from '@react-native-vector-icons/fontisto';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { COLORS } from '../ui/theme';

export default function AddonRow({ title, note }: { title: string; note?: string }) {
      const [open, setOpen] = React.useState(false);
      return (
            <View style={s.card}>
                  <View style={{ flex: 1 }}>
                        <Text style={s.title}>{title}</Text>
                        {!!note && <Text style={s.note}>{note}</Text>}
                  </View>
                  <TouchableOpacity onPress={() => setOpen(o => !o)} style={s.btn}>
                        <FontAwesome5 iconStyle='solid' name={open ? 'minus' : 'plus'} size={16} color={COLORS.text} />
                  </TouchableOpacity>
            </View>
      );
}
const s = StyleSheet.create({
      card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#eee' },
      title: { fontWeight: '800', color: COLORS.text },
      note: { color: COLORS.sub, fontSize: 12 },
      btn: { width: 28, height: 28, borderRadius: 6, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
});
