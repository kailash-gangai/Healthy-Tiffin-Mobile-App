import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import FavoriteDetailModal from './FavoriteDetailModal';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  toggleWishlist,
  selectIsWishlisted,
} from '../store/slice/favoriteSlice';
import { EMPTY_STATE_URL } from '../constants';
import HeartIcon from '../assets/htf-icon/icon-heart.svg';

type Dish = {
  id: string;
  title: string;
  price: string;
  image: string | null;
  description?: string;
  category: string;
  type: 'main' | 'addon';
  day?: string;
  variantId: string;
  tags?: string[];
  date?: string;
};

const COLORS = {
  text: '#1E1E1E',
  sub: '#9E9E9E',
  brand: '#0B5733',
  orange: '#F6A300', // heart bg
  card: '#FFFFFF',
  tagText: '#F6A300',
  border: '#EEF1EE',
  shadow: 'rgba(9,30,66,0.08)',
};

export default function FavoriteCard({ item }: { item: Dish }) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = React.useState(false);

  const isFav = useAppSelector(
    selectIsWishlisted(item.id, item.variantId, item.category, item.day),
  );

  const onHeartPress = () => {
    const date = new Intl.DateTimeFormat('en-US').format(new Date());
    dispatch(
      toggleWishlist({
        id: item.id,
        variantId: item.variantId,
        category: item.category,
        day: item.day,
        title: item.title,
        description: item.description,
        image: item.image ?? EMPTY_STATE_URL,
        price: item.price,
        type: item.type,
        date,
        tags: item.tags,
      }),
    );
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setOpen(true)}
        style={s.card}
      >
        <Image source={{ uri: item.image ?? EMPTY_STATE_URL }} style={s.img} />
        <View style={{ flex: 1 }}>
          <View style={s.topRow}>
            <Text style={s.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={s.price}>${Number(item.price).toFixed(2)}</Text>
          </View>

          <View style={s.badgesRow}>
            <Text style={s.category}>{item.category}</Text>
          </View>
        </View>

        <View style={s.rightCol}>
          <TouchableOpacity onPress={onHeartPress} hitSlop={10} style={s.heart}>
            <HeartIcon width={24} height={24}  />
          </TouchableOpacity>
          <View
            style={[
              s.badge,
              item.type === 'addon' ? s.badgeAddon : s.badgeMain,
            ]}
          >
            <Text style={s.badgeTxt}>{item.type}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <FavoriteDetailModal
        visible={open}
        onClose={() => setOpen(false)}
        onShare={() => {}}
        onToggleLike={onHeartPress}
        liked={isFav}
        item={item}
      />
    </>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 2,
  },
  img: {
    width: 96,
    height: 96,
    borderRadius: 12,
    marginRight: 12,
    resizeMode: 'cover',
    backgroundColor: '#F6F6F6',
  },
  topRow: { flexDirection: 'column', gap: 5 },
  title: { flex: 1, fontWeight: '700', fontSize: 16, color: COLORS.text },
  price: {
    //     marginLeft: 8,
    color: COLORS.brand,
    fontWeight: '800',
    fontSize: 14,
  },
  badgesRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  badge: {
    marginTop: 7,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    //     marginRight: 8,
  },
  badgeMain: { backgroundColor: '#EAF6F0' },
  badgeAddon: { backgroundColor: '#FFF3E0' },
  badgeTxt: { fontSize: 12, fontWeight: '700', color: '#555' },
  category: { color: COLORS.tagText, fontWeight: '800', fontSize: 12 },
  rightCol: {
    height: 62,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  heart: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.orange,
  },
});
