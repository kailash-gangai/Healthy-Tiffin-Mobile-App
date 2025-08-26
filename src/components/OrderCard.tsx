import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { SHADOW, COLORS } from '../ui/theme';

export type OrderCardProps = {
      thumbnail: any;                 // require('...')
      title: string;                  // e.g., "Berry Bliss Salad and 2 more"
      total: string;                  // e.g., "$64"
      plan: 'One Day' | 'Weekly';
      orderedAt: string;              // "10 Dec 2023 | 9:36 PM"
      deliveredAt?: string;           // "10 Dec 2023 | 10:12 PM"
      onPress?: () => void;
};



export default function OrderCard({
      thumbnail,
      title,
      total,
      plan,
      orderedAt,
      deliveredAt,
      onPress,
}: OrderCardProps) {
      return (
            <TouchableOpacity activeOpacity={0.85} style={s.card} onPress={onPress}>
                  <Image source={thumbnail} style={s.img} />

                  <View style={s.right}>
                        {/* title + plan tag */}
                        <View style={s.topRow}>
                              <Text style={s.title} numberOfLines={1}>{title}</Text>

                        </View>

                        {/* total */}
                        <View style={s.kvWrap}>
                              <Text style={s.kv}>
                                    <Text style={s.k}>Order Total :</Text>
                                    <Text style={s.v}> {total}</Text>
                              </Text>
                              <View style={[s.tag, plan === 'Weekly' ? s.tagWeekly : s.tagOneDay]}>
                                    <Text style={[s.tagTxt, plan === 'Weekly' ? s.tagTxtWeekly : s.tagTxtOneDay]}>
                                          {plan}
                                    </Text>
                              </View>
                        </View>

                        {/* meta */}
                        <Text style={s.meta}>Ordered : {orderedAt}</Text>
                        {deliveredAt ? <Text style={s.meta}>Delivered : {deliveredAt}</Text> : null}
                  </View>
            </TouchableOpacity>
      );
}

const s = StyleSheet.create({
      card: {
            flexDirection: 'row',
            backgroundColor: COLORS.white,
            borderRadius: 16,
            padding: 10,
            ...SHADOW
      },
      img: { width: 110, height: 110, borderRadius: 12, marginRight: 10, resizeMode: 'cover' },
      right: { flex: 1 },
      topRow: { flexDirection: 'row', alignItems: 'center' },
      kvWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
      title: { flex: 1, color: COLORS.text, fontWeight: '800' },

      tag: { height: 24, borderRadius: 12, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' },
      tagOneDay: { backgroundColor: COLORS.chipBg },
      tagWeekly: { backgroundColor: '#F0E7FA' },
      tagTxt: { fontSize: 12, fontWeight: '800' },
      tagTxtOneDay: { color: COLORS.chipText },
      tagTxtWeekly: { color: '#7B57C5' },

      kv: { marginTop: 6 },
      k: { color: COLORS.sub, fontWeight: '700' },
      v: { color: COLORS.green, fontWeight: '800' },

      meta: { marginTop: 2, color: COLORS.sub, fontSize: 12 },
});
