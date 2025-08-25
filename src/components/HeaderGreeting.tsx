import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Fontisto } from '@react-native-vector-icons/fontisto';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { COLORS } from '../ui/theme';

export default function HeaderGreeting({ name }: { name: string }) {
      return (
            <View style={s.row}>
                  <View style={s.left}>
                        <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={s.avatar} />
                        <View>
                              <Text style={s.hello}>Hello, {name}!</Text>
                              <Text style={s.sub}>Ready to build today’s box?</Text>
                        </View>
                  </View>
                  <View style={s.right}>
                        <TouchableOpacity style={s.iconBtn}><FontAwesome5 name="bell" size={18} color={COLORS.text} /></TouchableOpacity>
                        <TouchableOpacity style={s.iconBtn}><FontAwesome5 iconStyle='solid' name="shopping-cart" size={18} color={COLORS.text} /></TouchableOpacity>
                  </View>
            </View>
      );
}

const s = StyleSheet.create({
      row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
      left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
      avatar: { width: 42, height: 42, borderRadius: 21 },
      hello: { fontSize: 16, fontWeight: '700', color: COLORS.text },
      sub: { color: COLORS.sub },
      right: { flexDirection: 'row', gap: 10 },
      iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
});
