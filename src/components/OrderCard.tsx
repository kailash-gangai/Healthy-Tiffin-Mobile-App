import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { SHADOW, COLORS } from '../ui/theme';
import type { OrderSummary } from '../shopify/queries/types';

const FALLBACK =
  'https://static-00.iconduck.com/assets.00/package-food-icon-2048x2048-xnet2u9t.png';

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

function Pill({
  text,
  kind,
}: {
  text: string;
  kind: 'fulfillment' | 'payment';
}) {
  const map =
  kind === 'fulfillment'
    ? {
        FULFILLED: { bg: '#E0F7FA', fg: '#00796B' }, 
        PARTIALLY_FULFILLED: { bg: '#B3E5FC', fg: '#0288D1' }, 
        UNFULFILLED: { bg: '#FFCDD2', fg: '#D32F2F' }, 
        default: { bg: '#F0F0F0', fg: '#616161' }, 
      }
    : {
        PAID: { bg: '#C8E6C9', fg: '#388E3C' }, 
        PENDING: { bg: '#FFF3E0', fg: '#FF8F00' }, 
        REFUNDED: { bg: '#E1BEE7', fg: '#7B1FA2' }, 
        default: { bg: '#F0F0F0', fg: '#616161' }, 
      };

  const c = (map as any)[text] ?? (map as any).default;
  return (
    <View style={[s.pill, { backgroundColor: c.bg }]}>
      <Text style={[s.pillTxt, { color: c.fg }]}>{text}</Text>
    </View>
  );
}

type Props = OrderSummary & { onPress?: () => void };

export default memo(function OrderCard({
  name,
  orderNumber,
  processedAt,
  financialStatus,
  fulfillmentStatus,
  items,
  onPress,
}: Props) {
  const cover = items?.[0]?.imageUrl || FALLBACK;
  const thumbs = items.slice(0, 3);
  const extra = Math.max(items.length - 3, 0);

  return (
    <TouchableOpacity activeOpacity={0.9} style={s.card} onPress={onPress}>
      <Image source={{ uri: cover }} style={s.img} />

      <View style={s.right}>
        {/* header */}
        <View style={s.header}>
          <Text style={s.title} numberOfLines={1}>
            {/* #{orderNumber} */}
            {name} <Text style={s.sub}></Text>
          </Text>
          <Pill text={fulfillmentStatus} kind="fulfillment" />
        </View>

        {/* thumbnails */}
        <View style={s.thumbRow}>
          {thumbs.map((it, i) => (
            <Image
              key={i}
              source={{ uri: it.imageUrl || FALLBACK }}
              style={[s.thumb, i > 0 && { marginLeft: -10 }]}
            />
          ))}
          {extra > 0 ? (
            <View style={[s.thumb, s.more]}>
              <Text style={s.moreTxt}>+{extra}</Text>
            </View>
          ) : null}
        </View>

        {/* meta */}
        <View style={s.metaGrid}>
          <View style={s.metaCol}>
            <Text style={s.metaV}>{fmt(processedAt)}</Text>
          </View>
          <View style={[s.metaCol, { alignItems: 'flex-end' }]}>
            <View style={{ marginTop: 2 }}>
              <Pill text={financialStatus} kind="payment" />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    ...SHADOW,
  },
  img: {
    width: 96,
    height: 96,
    borderRadius: 12,
    marginRight: 12,
    resizeMode: 'cover',
  },
  right: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flexShrink: 1,
    color: COLORS.black,
    fontWeight: '500',
    fontSize: 14,
  },
  sub: { color: COLORS.sub, fontWeight: '400', fontSize: 12 },

  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 22,
    alignSelf: 'flex-start',
  },
  pillTxt: { fontSize: 12, fontWeight: '800' },

  thumbRow: { flexDirection: 'row', marginTop: 10, marginBottom: 6 },
  thumb: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: '#EEE',
  },
  more: { alignItems: 'center', justifyContent: 'center' },
  moreTxt: { fontWeight: '400', color: '#444', fontSize: 12 },

  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  metaCol: { flexShrink: 1 },
  metaK: { color: COLORS.sub, fontWeight: '400', fontSize: 12 },
  metaV: { color: COLORS.black, fontWeight: '400', fontSize: 12 },

  itemsLine: { marginTop: 8, color: COLORS.sub, fontSize: 12 },
});
