// screens/TrackOrderScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { COLORS as C, SHADOW, SPACING } from '../../ui/theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createCart } from '../../shopify/mutation/cart';
import { clearCart } from '../../store/slice/cartSlice';
import { useShopifyCheckoutSheet } from '@shopify/checkout-sheet-kit';

const STEPS = [
  {
    id: 1,
    title: 'Order Received',
    desc: 'Your order has been received',
    icon: 'clipboard-list',
    done: true,
  },
  {
    id: 2,
    title: 'Food Preparing',
    desc: 'Your order is currently in the process preparing in the restaurant.',
    icon: 'utensils',
    done: true,
  },
  {
    id: 3,
    title: 'Order Picking',
    desc: 'Your order is currently in the process of being picked and prepared for shipment.',
    icon: 'box',
    done: true,
  },
  {
    id: 4,
    title: 'Delivered',
    desc: 'Your much-anticipated order has completed its journey and is now at your doorstep.',
    icon: 'map-marker-alt',
    done: false,
  },
];

export default function TrackOrderScreen({ navigation }: any) {
  const { lines } = useAppSelector(state => state.cart);
  const { customerToken, email } = useAppSelector(state => state.user);
  const shopifyCheckout = useShopifyCheckoutSheet();
  console.log(lines, 'lines');
  const dispatch = useAppDispatch();
  const cart = async () => {
    try {
      const createdCart = await createCart(
        lines,
        customerToken as string,
        email as string,
      );
      console.log(createdCart, 'cart');
      shopifyCheckout.present(createdCart.checkoutUrl);

      if (createdCart && createdCart.id) {
        dispatch(clearCart());
      }
    } catch (error) {
      console.log('something went wrong', error);
    }
  };
  useEffect(() => {
    cart();
  }, []);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.white }}>
      <AppHeader title="Track Order" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        {/* Delivery time */}
        <Text style={s.arriving}>
          Arriving by:{' '}
          <Text style={{ fontWeight: '800' }}>10:00 am - 10:10 am</Text>
        </Text>
        <View style={s.timerBox}>
          <Text style={s.timer}>20 min</Text>
          <Text style={s.timerLabel}>ESTIMATED DELIVERY TIME</Text>
        </View>

        <View style={s.container}>
          {/* Rider card */}
          <View style={s.riderCard}>
            <Image
              source={require('../../assets/LOGO.png')}
              style={s.riderImg}
            />
            <Text style={s.riderName}>John Smith</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginLeft: 'auto' }}>
              <TouchableOpacity style={s.callBtn}>
                <FontAwesome5
                  iconStyle="solid"
                  name="phone"
                  size={16}
                  color={C.white}
                />
              </TouchableOpacity>
              <TouchableOpacity style={s.msgBtn}>
                <FontAwesome5 name="comment-dots" size={16} color={C.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Steps */}
          <View style={{ marginTop: 20 }}>
            {STEPS.map((s, i) => (
              <View key={s.id} style={srow.row}>
                {/* line + icon */}
                <View style={srow.lineWrap}>
                  {i !== STEPS.length - 1 && (
                    <View
                      style={[
                        srow.line,
                        { backgroundColor: s.done ? C.oranger : '#b9b9b9ff' },
                      ]}
                    />
                  )}
                  <View
                    style={[
                      srow.iconCircle,
                      { backgroundColor: s.done ? C.oranger : '#E0E0E0' },
                    ]}
                  >
                    <FontAwesome5
                      iconStyle="solid"
                      name={s.icon}
                      size={22}
                      color={s.done ? C.green : C.gray}
                    />
                  </View>
                </View>
                {/* text */}
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[srow.title, !s.done && { color: '#b9b9b9ff' }]}>
                    {s.title}
                  </Text>
                  <Text style={[srow.desc, !s.done && { color: '#b9b9b9ff' }]}>
                    {s.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Invite */}
          <TouchableOpacity style={s.invite}>
            <Image
              source={require('../../assets/LOGO.png')}
              style={{ width: 50, height: 50, marginRight: 10 }}
            />
            <Text
              style={{
                flex: 1,
                fontWeight: '400',
                color: C.black,
                fontSize: 20,
              }}
              onPress={() => navigation.navigate('Referal')}
            >
              Invite friend, get $10 off
            </Text>
            <View style={s.icon}>
              <FontAwesome5
                iconStyle="solid"
                name="arrow-right"
                size={22}
                color={C.white}
              />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  icon: {
    backgroundColor: C.green,
    width: 45,
    height: 45,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: { paddingHorizontal: SPACING },
  arriving: {
    textAlign: 'center',
    color: C.black,
    marginTop: 6,
    marginBottom: 10,
    fontSize: 16,
  },
  timerBox: {
    backgroundColor: C.lightOrange,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  timer: { fontSize: 28, fontWeight: '800', color: C.green },
  timerLabel: { fontSize: 16, color: C.green, marginTop: 4, fontWeight: '600' },

  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  riderImg: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  riderName: { fontWeight: '800', color: C.black, fontSize: 18 },
  callBtn: { backgroundColor: C.green, borderRadius: 20, padding: 8 },
  msgBtn: { backgroundColor: '#F6A300', borderRadius: 20, padding: 8 },

  invite: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 12,
    padding: SPACING,
    marginTop: 24,
    ...SHADOW,
  },
});

const srow = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: 22 },
  lineWrap: { alignItems: 'center', width: 60 },
  line: {
    position: 'absolute',
    top: 24,
    width: 2,
    height: 80,
    zIndex: -1,
    alignSelf: 'center',
    borderLeftWidth: 2,
    borderStyle: 'dotted',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: '700', fontSize: 18, marginBottom: 2 },
  desc: { fontSize: 14, color: C.sub, maxWidth: '90%' },
});
