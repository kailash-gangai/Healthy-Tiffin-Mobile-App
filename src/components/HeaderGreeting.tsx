import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Fontisto } from '@react-native-vector-icons/fontisto';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { COLORS, RADIUS, SPACING, SHADOW } from '../ui/theme';


export default function HeaderGreeting({ name }: { name: string }) {
      return (
            <View>
                  {/* Orange bar */}
                  <View style={s.orange}>
                        <View style={s.row}>
                              <View style={s.left}>
                                    <Image source={{ uri: 'https://i.pravatar.cc/80' }} style={s.avatar} />
                                    <Text style={s.hello}>Hello, {name}!</Text>
                              </View>
                              <View style={s.right}>
                                    <TouchableOpacity><FontAwesome5 name="bell" size={20} color={COLORS.white} /></TouchableOpacity>
                                    <TouchableOpacity><FontAwesome5 iconStyle='solid' name="shopping-bag" size={20} color={COLORS.white} /></TouchableOpacity>
                              </View>
                        </View>
                  </View>


            </View>
      );
}

const s = StyleSheet.create({
      orange: {
            backgroundColor: '#F9B233',
            height: 160,
            paddingHorizontal: 16,
            justifyContent: 'center',
            paddingTop: SPACING * 2,
      },
      row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
      left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
      avatar: { width: 40, height: 40, borderRadius: 20 },
      hello: { color: COLORS.white, fontWeight: '700', fontSize: 18 },
      right: { flexDirection: 'row', gap: 12 },
      cardWrap: {
            backgroundColor: COLORS.white,
            alignItems: 'center',
            marginTop: -20,
            borderTopLeftRadius: RADIUS,
            borderTopRightRadius: RADIUS,
      },
      card: {
            marginHorizontal: 16,
            // marginTop: -34, // overlap
            backgroundColor: COLORS.white,
            borderRadius: 20,
            paddingVertical: 14,
            ...SHADOW,
      },
      rowStats: { flexDirection: 'row', justifyContent: 'space-around' },
      pill: { alignItems: 'center', justifyContent: 'center', borderRadius: 12, padding: 8 },
      value: { fontWeight: '800', color: COLORS.black },
      unit: { fontSize: 11, color: COLORS.sub },
      label: { fontSize: 12, color: COLORS.sub },
});

