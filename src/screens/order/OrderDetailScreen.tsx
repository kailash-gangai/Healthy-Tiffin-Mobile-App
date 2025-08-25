import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { COLORS } from '../../ui/theme';
type Item = { name: string; qty: number };
type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
      orderId?: string;
      plan?: 'Weekly' | 'One Day';
      placedAt?: string;     // '17/12/2023 | 12:45 PM'
      deliveredAt?: string;  // '17/12/2023 | 02:00 PM'
      items?: Item[];
      total?: string;        // '$384'
      cardLast4?: string;    // '436'
      addressLines?: string[];
      receipt?: { label: string; value: string }[]; // [{label:'Total',value:'$80.45'},...]s
      navigation: Nav
};


const defaultItems: Item[] = [
      { name: 'Berry Bliss Salad', qty: 2 },
      { name: 'Tangy Ceaser Salad', qty: 2 },
];

export default function OrderDetailScreen({
      orderId = '#BE12345',
      plan = 'Weekly',
      placedAt = '17/12/2023 | 12:45 PM',
      deliveredAt = '17/12/2023 | 02:00 PM',
      items = defaultItems,
      total = '$ 384',
      cardLast4 = '436',
      addressLines = ['Banu Elson', 'Altenauer Str., 35', 'Clausthal-Zellerfeld, Germany'],
      receipt = [
            { label: 'Total', value: '$80.45' },
            { label: 'Tax', value: '$5' },
            { label: 'Subtotal', value: '$80.45' },
      ],
      navigation,

}: Props) {
      return (
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
                  {/* Top bar */}
                  <View style={s.topbar}>
                        <TouchableOpacity style={s.back} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                              <FontAwesome5 iconStyle='solid' name="chevron-left" size={18} color={COLORS.white} />
                        </TouchableOpacity>
                        <Text style={s.title}>Order Details</Text>
                        <View style={{ width: 24 }} />
                  </View>

                  <View style={s.container}>
                        {/* Order meta */}
                        <Text style={s.id}>Order ID : <Text style={{ fontWeight: '800' }}>{orderId}</Text></Text>

                        <Text style={s.plan}>{plan}</Text>

                        <Text style={s.meta}>Time placed: <Text style={s.metaStrong}>{placedAt}</Text></Text>
                        <Text style={s.meta}>Time delivered: <Text style={s.metaStrong}>{deliveredAt}</Text></Text>

                        <View style={{ marginTop: 10 }}>
                              {items.map((it, i) => (
                                    <Text key={i} style={s.itemLine}>
                                          <Text style={s.link}>{it.qty}x {it.name}</Text>
                                    </Text>
                              ))}
                        </View>

                        <Text style={[s.meta, { marginTop: 8 }]}>
                              <Text style={{ fontWeight: '800' }}>Total : </Text>
                              <Text style={{ color: '#000', fontWeight: '800' }}>{total}</Text>
                        </Text>

                        {/* Payment */}
                        <Text style={s.sectionHd}>Payment</Text>
                        <View style={s.panel}>
                              <Text style={s.cardLabel}>Card</Text>
                              <View style={s.cardRow}>
                                    <FontAwesome5 iconStyle='solid' name="credit-card" size={20} color="#FFB000" />
                                    <Text style={s.cardNum}> ************ {cardLast4}</Text>
                              </View>
                        </View>

                        {/* Address */}
                        <Text style={s.sectionHd}>Address</Text>
                        <View style={s.panel}>
                              {addressLines.map((l, i) => (
                                    <Text key={i} style={s.addr}>{l}</Text>
                              ))}
                        </View>

                        {/* Receipt */}
                        <Text style={s.sectionHd}>Receipt</Text>
                        <View style={s.receipt}>
                              {receipt.map((r, i) => (
                                    <View key={r.label} style={[s.rRow, i < receipt.length - 1 && s.rDiv]}>
                                          <Text style={[s.rKey, r.label === 'Total' && s.rKeyBold]}>{r.label}</Text>
                                          <Text style={[s.rVal, r.label === 'Total' && s.rValBold]}>{r.value}</Text>
                                    </View>
                              ))}
                        </View>
                  </View>
            </SafeAreaView>
      );
}

const s = StyleSheet.create({
      topbar: {
            height: 48, backgroundColor: COLORS.green, flexDirection: 'row',
            alignItems: 'center', paddingHorizontal: 12,
      },
      back: {
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.chip,
            opacity: 0.4,
            borderRadius: 16
      },
      title: { flex: 1, textAlign: 'center', color: COLORS.white, fontWeight: '800', fontSize: 16 },

      container: { flex: 1, paddingHorizontal: 16, paddingTop: 14 },
      id: { color: COLORS.text, marginBottom: 8 },
      plan: { color: COLORS.text, fontWeight: '800', marginTop: 4, marginBottom: 6 },
      meta: { color: COLORS.text, marginTop: 2 },
      metaStrong: { color: COLORS.text, fontWeight: '700' },
      link: { color: COLORS.link, textDecorationLine: 'underline', fontWeight: '700' },
      itemLine: { marginTop: 2 },

      sectionHd: { marginTop: 16, marginBottom: 8, color: COLORS.text, fontWeight: '800' },

      panel: {
            backgroundColor: '#F3F4F6',
            borderRadius: 14,
            padding: 14,
      },
      cardLabel: { color: COLORS.text, fontWeight: '800', marginBottom: 8 },
      cardRow: { flexDirection: 'row', alignItems: 'center' },
      cardNum: { color: COLORS.text, fontWeight: '700' },

      addr: { color: COLORS.text, marginTop: 2 },

      receipt: {
            backgroundColor: '#EFEFEF',
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginBottom: 16,
      },
      rRow: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
      rDiv: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.divider },
      rKey: { color: COLORS.text },
      rVal: { color: COLORS.text },
      rKeyBold: { fontWeight: '800' },
      rValBold: { fontWeight: '800' },
});
