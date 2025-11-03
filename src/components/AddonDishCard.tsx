import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import DishDetailModal from './DishDetailModal';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectIsWishlisted,
  toggleWishlist,
} from '../store/slice/favoriteSlice';
import HeartIcon from '../assets/htf-icon/icon-heart.svg';
import EyeShow from '../assets/htf-icon/icon-eye.svg';
import DeleteIcon from '../assets/htf-icon/icon-trans.svg';
import SkeletonLoading from './SkeletonLoading';
const width = Dimensions.get('window').width;
type Dish = {
  id: string;
  title: string;
  price: string;
  image: string;
  description?: string;
  type?: 'main' | 'addon';
  calories?: number;
  day?: string;
  selected?: boolean;
  variantId: string;
  tags?: string[];
  liked?: boolean;
};

const COLORS = {
  text: '#232323',
  sub: '#7A7A7A',
  green: '#0B5733',
  white: '#FFFFFF',
  border: '#E7ECE9',
  borderStrong: '#D7E2DC',
  pill: '#F2F7F4',
  badge: '#0B5733',
  shadow: 'rgba(0,0,0,0.08)',
};

function nowStr() {
  return new Intl.DateTimeFormat('en-US').format(new Date());
}

export default React.memo(function AddonDishCard({
  day,
  category,
  type,
  tiffinPlan,
  item,
  onChange,
  setSelectedItemsToAddOnCart,
  selectedItemsToAddOnCart,
  isLoading,
}: {
  category: string;
  day: string;
  type: 'main' | 'addon';
  item: Dish;
  onChange?: (d: Dish) => void;
  tiffinPlan?: number;
  setSelectedItemsToAddOnCart?: any;
  selectedItemsToAddOnCart: any[];
  isLoading?: boolean;
}) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const keyMatch = useCallback(
    (i: any) =>
      i.id === item.id &&
      i.variantId === item.variantId &&
      i.day === day &&
      i.category === category &&
      i.type === 'addon',
    [item.id, item.variantId, day, category],
  );

  const selectedEntry = useMemo(
    () => selectedItemsToAddOnCart.find(keyMatch),
    [selectedItemsToAddOnCart, keyMatch],
  );
  const qty = selectedEntry?.qty ?? 0;
  const checked = qty > 0;

  const isFav = useAppSelector(
    selectIsWishlisted(item.id, item.variantId, category, day),
  );

  const addOrReplace = useCallback(
    (nextQty: number) => {
      setSelectedItemsToAddOnCart?.((prev: any[]) => {
        const without = prev.filter((i: any) => !keyMatch(i));
        return [
          ...without,
          {
            ...item,
            type: 'addon',
            category,
            day,
            date: nowStr(),
            tiffinPlan,
            qty: nextQty,
          },
        ];
      });
      onChange?.({ ...item, selected: false, liked: isFav });
    },
    [setSelectedItemsToAddOnCart, keyMatch, item, category, day, tiffinPlan, onChange, isFav],
  );

  const removeFromList = useCallback(() => {
    setSelectedItemsToAddOnCart?.((prev: any[]) =>
      prev.filter((i: any) => !keyMatch(i)),
    );
    onChange?.({ ...item, selected: false, liked: isFav });
  }, [setSelectedItemsToAddOnCart, keyMatch, onChange, item, isFav]);

  const onCardPress = useCallback(() => {
    if (!checked) addOrReplace(1);
  }, [checked, addOrReplace]);

  const increment = useCallback(
    () => addOrReplace(qty > 0 ? qty + 1 : 1),
    [qty, addOrReplace],
  );
  const decrement = useCallback(() => {
    if (qty <= 1) removeFromList();
    else addOrReplace(qty - 1);
  }, [qty, removeFromList, addOrReplace]);

  const onHeartPress = useCallback(() => {
    dispatch(
      toggleWishlist({
        id: item.id,
        variantId: item.variantId,
        category,
        day,
        title: item.title,
        description: item.description,
        image: item.image,
        price: item.price,
        type: 'addon',
        date: nowStr(),
        tags: item.tags,
      }),
    );
    onChange?.({ ...item, selected: false, liked: !isFav });
  }, [dispatch, item, category, day, onChange, isFav]);

  if (isLoading) return <SkeletonLoading />;

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onCardPress}
        style={[s.card, checked && { borderColor: COLORS.green }]}
      >
        {/* Image */}
        <View style={s.imgWrap}>
          <Image source={{ uri: item.image }} style={s.thumb} />
          <View style={s.priceBadge}>
            <Text style={s.priceText}>${item.price}</Text>
          </View>

          <TouchableOpacity
            onPress={e => {
              e.stopPropagation();
              setOpen(true);
            }}
            style={[s.iconBtn, { left: 8, top: 8 }]}
          >
            <EyeShow width={16} height={16} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={e => {
              e.stopPropagation();
              onHeartPress();
            }}
            style={[s.iconBtn, { right: 8, top: 8 }]}
          >
            <HeartIcon
              width={16}
              height={16}
              fill={isFav ? '#FF4D4D' : '#CFCFCF'}
            />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={s.textWrap}>
          <Text style={s.title} numberOfLines={2}>
            {item.title}
          </Text>
        </View>

        {/* Qty Control */}
        <View style={s.qtyPill}>
          <TouchableOpacity
            onPress={e => {
              e.stopPropagation();
              qty <= 1 ? removeFromList() : decrement();
            }}
            style={[s.pillBtn, !checked && s.disabled]}
            disabled={!checked}
          >
            {qty <= 1 ? (
              <DeleteIcon height={20} width={20} />
            ) : (
              <Text style={s.pillBtnText}>−</Text>
            )}
          </TouchableOpacity>

          <Text style={s.qtyNum}>{qty}</Text>

          <TouchableOpacity
            onPress={e => {
              e.stopPropagation();
              increment();
            }}
            style={s.pillBtn}
          >
            <Text style={s.pillBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <DishDetailModal
        visible={open}
        onClose={() => setOpen(false)}
        onToggleLike={onHeartPress}
        liked={isFav}
        dish={item as any}
      />
    </>
  );
});

const s = StyleSheet.create({
  card: {
    width: (width / 2) - 40,
    height: width / 2 + 40,
    borderRadius: 14,
  },
  imgWrap: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumb: {
    width: width / 2 - 40,
    height: width / 2 - 40,
    resizeMode: 'cover',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: COLORS.green,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priceText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  iconBtn: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textWrap: { marginTop: 10, minHeight: 32 },
  title: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  qtyPill: {
    marginTop: 10,
    alignSelf: 'center',
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    gap: 6,
  },
  pillBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabled: { opacity: 0.35 },
  pillBtnText: { fontSize: 14, fontWeight: '800', color: COLORS.green },
  qtyNum: {
    minWidth: 16,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
});
