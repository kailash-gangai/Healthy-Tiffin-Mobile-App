import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Fontisto } from '@react-native-vector-icons/fontisto';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { COLORS } from '../ui/theme';

export default function DishCard({ item }: { item: { title: string; image: any; selected?: boolean } }) {
      const [sel, setSel] = React.useState(!!item.selected);
      return (
            <View style={s.row}>
                  <Image source={item.image} style={s.img} />
                  <Text style={s.name}>{item.title}</Text>
                  <TouchableOpacity onPress={() => setSel(x => !x)} style={[s.pick, sel && { backgroundColor: COLORS.green }]}>
                        <FontAwesome5 iconStyle='solid' name={sel ? 'check' : 'plus'} size={16} color={sel ? COLORS.white : COLORS.text} />
                  </TouchableOpacity>
            </View>
      );
}

const s = StyleSheet.create({
      row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
      img: { width: 56, height: 56, borderRadius: 10 },
      name: { flex: 1, color: COLORS.text, fontWeight: '700' },
      pick: { width: 28, height: 28, borderRadius: 6, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
});
