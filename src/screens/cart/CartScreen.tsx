
import React, { useState } from 'react';
import {
      View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput,
} from 'react-native';
import AppHeader from '../../components/AppHeader';
import { COLORS as C, SHADOW, SPACING } from '../../ui/theme';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Item = { id: string; title: string; price: number; img: any; qty: number };

const INIT: Item[] = [
      { id: '1', title: 'Khichdi', price: 25, img: require('../../assets/banners/chana.jpg'), qty: 1 },
      { id: '2', title: 'Gluten/Sugar FREE\nDessert', price: 2, img: require('../../assets/banners/chana.jpg'), qty: 1 },
      { id: '3', title: 'Health Boost Drink', price: 3, img: require('../../assets/banners/chana.jpg'), qty: 1 },
      { id: '4', title: 'Khichdi', price: 25, img: require('../../assets/banners/chana.jpg'), qty: 1 },
      { id: '5', title: 'Gluten/Sugar FREE\nDessert', price: 2, img: require('../../assets/banners/chana.jpg'), qty: 1 },
      { id: '6', title: 'Health Boost Drink', price: 3, img: require('../../assets/banners/chana.jpg'), qty: 1 },
];

export default function CartScreen({ navigation }: any) {
      const [items, setItems] = useState<Item[]>(INIT);
      const [note, setNote] = useState('');
      const [mode, setMode] = useState<'delivery' | 'pickup'>('delivery');
      const [addr, setAddr] = useState('2118 Thornridge Cir, Syracuse');
      const insets = useSafeAreaInsets();

      const updateQty = (id: string, d: 1 | -1) =>
            setItems(prev =>
                  prev.map(x => (x.id === id ? { ...x, qty: Math.max(1, x.qty + d) } : x)));

      const mealCost = items.reduce((s, x) => s + x.price * x.qty, 0);
      const addons = 5;
      const nonMember = 5;
      const subtotal = mealCost + addons + nonMember;

      return (
            <SafeAreaView style={{ flex: 1, backgroundColor: C.white }}>
                  <AppHeader title="My Cart" onBack={() => navigation.goBack()} />
                  <ScrollView
                        contentContainerStyle={{ padding: 16, paddingBottom: 180 + insets.bottom }}

                        showsVerticalScrollIndicator={true}>
                        {items.map(it => (
                              <View key={it.id} style={s.card}>
                                    <Image source={it.img} style={s.img} />
                                    <View style={{ flex: 1 }}>
                                          <Text style={s.itemTitle} numberOfLines={2}>{it.title}</Text>
                                          <Text style={s.price}>${it.price}</Text>
                                          <View style={s.qtyRow}>
                                                <Round onPress={() => updateQty(it.id, -1)}><Text style={s.sign}>−</Text></Round>
                                                <Text style={s.qty}>{it.qty}</Text>
                                                <Round onPress={() => updateQty(it.id, +1)}><Text style={s.sign}>＋</Text></Round>
                                          </View>
                                    </View>
                              </View>
                        ))}

                        {/* notes */}
                        <Text style={s.caption}>Add delivery instructions</Text>
                        <TextInput
                              style={s.note}
                              value={note}
                              onChangeText={setNote}
                              multiline
                              placeholder="Add a note"
                              placeholderTextColor={C.sub}
                        />

                        {/* price summary */}
                        <View style={s.summary}>
                              <Row k="Meal box price" v={`$${mealCost}`} />
                              <Row k="Add on's" v={`$${addons}`} />
                              <Row k="Non member shipping" v={`$${nonMember}`} />
                              <Row k="Total" v={`$${subtotal}`} bold />
                        </View>

                        {/* upsell */}
                        <Text style={s.upsellText}>
                              Subscribe and save delivery charges &{'\n'}get many more features.
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Subscription')} activeOpacity={0.9} style={s.subBtn}>
                              <Text style={s.subBtnTxt}>Subscribe Premium</Text>
                        </TouchableOpacity>
                  </ScrollView>

                  <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
                        <View style={s.segment}>
                              <TouchableOpacity style={[s.segBtn, mode === 'delivery' && s.segOn]} onPress={() => setMode('delivery')}>
                                    <Text style={[s.segTxt, mode === 'delivery' && s.segTxtOn]}>DELIVERY</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={[s.segBtn, mode === 'pickup' && s.segOn]} onPress={() => setMode('pickup')}>
                                    <Text style={[s.segTxt, mode === 'pickup' && s.segTxtOn]}>PICKUP</Text>
                              </TouchableOpacity>
                        </View>

                        {mode === 'pickup' && <Text style={s.saveNote}>Save extra 5% when you pickup orders</Text>}

                        <View style={s.totalRow}>
                              <Text style={s.totalK}>TOTAL:</Text>
                              <Text style={s.totalV}>${subtotal}</Text>
                        </View>

                        <TouchableOpacity style={s.payBtn}
                              onPress={() => navigation.navigate('OrderTrack')}
                        ><Text style={s.payTxt}>
                                    To Payment <FontAwesome5 iconStyle='solid' name="arrow-right" size={16} color={C.white} /></Text></TouchableOpacity>
                  </View>

            </SafeAreaView>
      );
}

/* small bits */
function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
      return (
            <View style={[s.row, bold && { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8 }]}>
                  <Text style={[s.k, bold && { fontWeight: '800', fontSize: 22 }]}>{k}</Text>
                  <Text style={[s.v, bold && { fontWeight: '800', fontSize: 22 }]}>{v}</Text>
            </View>
      );
}
function Round({ children, onPress }: any) {
      return (
            <TouchableOpacity style={s.round} onPress={onPress} activeOpacity={0.8}>
                  {children}
            </TouchableOpacity>
      );
}

/* styles */
const s = StyleSheet.create({
      wrap: { padding: 16, paddingBottom: 24 },
      footer: {
            position: 'absolute', left: 0, right: 0, bottom: 0,
            backgroundColor: C.white, paddingHorizontal: 16, paddingTop: 12,
            borderTopWidth: 1, borderTopColor: '#E5E5E5',
      },
      card: {
            flexDirection: 'row',
            backgroundColor: C.white,
            borderRadius: 16,
            padding: 12,
            marginBottom: 12,
            ...SHADOW
      },
      img: { width: 110, height: 100, borderRadius: 12, marginRight: 12, resizeMode: 'cover' },
      itemTitle: { color: C.black, fontWeight: '800', fontSize: 16 },
      price: { color: C.green, fontWeight: '800', fontSize: 24, marginTop: 6 },
      qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
      round: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.lightOrange, alignItems: 'center', justifyContent: 'center' },
      sign: { color: C.oranger, fontSize: 16, fontWeight: '800' },
      qty: { minWidth: 16, textAlign: 'center', fontWeight: '800', color: C.oranger, fontSize: 16 },

      caption: { color: C.black, marginTop: 6, marginBottom: 6, fontSize: 16, fontWeight: '800' },
      note: {
            minHeight: 70,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: C.border,
            padding: 12,
            color: C.black,
            marginBottom: 12,
      },

      summary: {
            backgroundColor: C.gray,
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
      },
      row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
      k: { color: C.black, fontWeight: '600', fontSize: 16 },
      v: { color: C.black, fontWeight: '800', fontSize: 16 },

      upsellText: { textAlign: 'center', color: C.sub, marginTop: 6, marginBottom: 10 },
      subBtn: {
            height: 60, borderRadius: 12, borderColor: C.green, borderWidth: 2,
            alignItems: 'center', justifyContent: 'center', marginBottom: 12,
      },
      subBtnTxt: { color: C.green, fontWeight: '800', fontSize: 22 },

      segment: { flexDirection: 'row', height: 44, borderRadius: 22, backgroundColor: C.chip, overflow: 'hidden', marginBottom: 8, fontSize: 16 },
      segBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
      segOn: { backgroundColor: C.green },
      segTxt: { color: C.black, fontWeight: '700' }, segTxtOn: { color: C.white },
      saveNote: { textAlign: 'center', color: C.sub, marginBottom: 10 },
      totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 },
      totalK: { color: C.sub, fontWeight: '700' }, totalV: { color: C.black, fontWeight: '900', fontSize: 24 },
      payBtn: { height: 52, borderRadius: 12, backgroundColor: C.oranger, alignItems: 'center', justifyContent: 'center' },
      payTxt: { fontWeight: '800', color: C.white, fontSize: 20 },
});
