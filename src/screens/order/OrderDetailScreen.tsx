import React from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SHADOW } from '../../ui/theme';
import AppHeader from '../../components/AppHeader';

type R = RouteProp<RootStackParamList, 'OrderDetail'>;

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function OrderDetailScreen({ navigation }: any) {
  const { params } = useRoute<R>();
  const { items: order } = params;

  // Calculate total price
  const totalPrice = order.items.reduce((total: any, item: any) => {
    const itemPrice = parseFloat(item.price || '0');
    return total + itemPrice * item.quantity;
  }, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      {/* Top bar */}

      <AppHeader title={order.name} onBack={() => navigation.goBack()} />

      <FlatList
        contentContainerStyle={s.body}
        data={order.items}
        keyExtractor={(_, i) => String(i)}
        ListHeaderComponent={
          <View>
            {/* Meta */}
            <View style={s.metaCard}>
              <Row k="Order #" v={String(order.orderNumber)} />
              <Row k="Placed" v={fmt(order.processedAt)} />
              <Row k="Payment" v={order.financialStatus} />
              <Row k="Fulfillment" v={order.fulfillmentStatus} />
            </View>

            {/* Ship-to */}
            <Text style={s.sectionHd}>Delivery address</Text>
            <View style={s.addrCard}>
              <Text style={s.addrLine}>{order.address.address1}</Text>
              {order.address.address2 ? (
                <Text style={s.addrLine}>{order.address.address2}</Text>
              ) : null}
              <Text style={s.addrLine}>
                {order.address.city}, {order.address.country}
              </Text>
            </View>

            {/* Items */}
            <Text style={s.sectionHd}>Items</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.itemRow}>
            <Image source={{ uri: item.imageUrl ?? '' }} style={s.itemImg} />
            <View style={{ flex: 1 }}>
              <Text style={s.itemTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={s.itemSub}>
                SKU: {item.sku ?? '-'} 
                {/* <Text style={}>
                  ${parseFloat(item.price || '0').toFixed(2)}
                </Text> */}
              </Text>
            </View>
            <Text style={s.qty}>×{item.quantity}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListFooterComponent={
          <View style={s.totalRow}>
            <Text style={s.totalText}>Total:</Text>
            <Text style={s.totalPrice}>${totalPrice.toFixed(2)}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View style={s.row}>
      <Text style={s.k}>{k}</Text>
      <Text style={s.v}>{v}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  topbar: {
    height: 48,
    backgroundColor: COLORS.green,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  back: {
    width: 32,
    height: 32,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: COLORS.white,
    fontSize: 12,
    backgroundColor: COLORS.chip,
    opacity: 0.4,
    borderRadius: 16,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 12,
  },

  body: { padding: 16, paddingBottom: 16 },

  sectionHd: {
    marginTop: 16,
    marginBottom: 8,
    color: COLORS.black,
    fontWeight: '800',
  },

  metaCard: {
    borderRadius: 14,
    padding: 14,
    ...SHADOW,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  k: { color: COLORS.sub, fontWeight: '400' },
  v: { color: COLORS.black, fontWeight: '500' },

  addrCard: {
    borderRadius: 14,
    padding: 14,
    ...SHADOW,
  },
  addrLine: { color: COLORS.black, marginTop: 2 },

  itemRow: {
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOW,
  },
  itemImg: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#EEE',
  },
  itemTitle: { color: COLORS.black, fontWeight: '400', fontSize: 12 },
  itemSub: {
    color: COLORS.black,
    marginTop: 2,
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  qty: { color: COLORS.black, fontWeight: '400', marginLeft: 8 },

  totalRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.sub,
    paddingTop: 12,
  },
  totalText: { color: COLORS.black, fontWeight: '800' },
  totalPrice: { color: COLORS.green, fontWeight: '800' },
});
