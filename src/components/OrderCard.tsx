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
          FULFILLED: { bg: '#E8F4FF', fg: '#1A73E8' },
          PARTIALLY_FULFILLED: { bg: '#E8F4FF', fg: '#1A73E8' },
          UNFULFILLED: { bg: '#FBEAEA', fg: '#D93025' },
          default: { bg: '#EEE', fg: '#444' },
        }
      : {
          PAID: { bg: '#E6F7EF', fg: '#0F9D58' },
          PENDING: { bg: '#FFF7E6', fg: '#C47F00' },
          REFUNDED: { bg: '#F4E6FF', fg: '#7B57C5' },
          default: { bg: '#EEE', fg: '#444' },
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
    backgroundColor: COLORS.white,
    borderRadius: 16,
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
    fontWeight: '800',
    fontSize: 16,
  },
  sub: { color: COLORS.sub, fontWeight: '600', fontSize: 12 },

  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
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
  moreTxt: { fontWeight: '800', color: '#444', fontSize: 12 },

  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  metaCol: { flexShrink: 1 },
  metaK: { color: COLORS.sub, fontWeight: '700', fontSize: 12 },
  metaV: { color: COLORS.black, fontWeight: '700', fontSize: 12 },

  itemsLine: { marginTop: 8, color: COLORS.sub, fontSize: 12 },
});
