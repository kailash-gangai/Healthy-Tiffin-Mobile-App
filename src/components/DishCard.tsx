import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import DishDetailModal from './DishDetailModal';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectIsWishlisted,
  toggleWishlist,
} from '../store/slice/favoriteSlice';
import EyeShow from '../assets/htf-icon/icon-eye.svg';
import HeartIcon from '../assets/htf-icon/icon-heart.svg';
import SkeletonLoading from './SkeletonLoading';
import { EMPTY_STATE_URL } from '../constants';
type Dish = {
  id: string;
  title: string;
  price: string; // string per your data
  image: string; // URL string per your data
  description?: string;
  calories?: number;
  day?: string;
  selected?: boolean;
  variantId: string;
  tags?: string[];
  liked?: boolean;
};
const COLORS = {
  text: '#232323',
  sub: '#9E9E9E',
  green: '#0B5733',
  rowBg: '#F0FBF4',
  divider: '#EDEDED',
  backdrop: 'rgba(0,0,0,0.35)',
  accent: '#F6A868',
  white: '#FFFFFF',
};

export default function DishCard({
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
  selectedItemsToAddOnCart: any;
  isLoading?: boolean;
}) {
  const dispatch = useAppDispatch();

  const checked = React.useMemo(
    () =>
      selectedItemsToAddOnCart.some(
        (it: any) =>
          it.id === item.id &&
          it.variantId === item.variantId &&
          it.day === day &&
          it.category === category,
      ),
    [selectedItemsToAddOnCart, item.id, item.variantId, day, category],
  );

  const [open, setOpen] = useState(false);
  const isFav = useAppSelector(
    selectIsWishlisted(item.id, item.variantId, category, day),
  );

  // SINGLE SELECT per day+category
  // SINGLE or MULTI select by type
  const toggleSelection = () => {
    const date = new Intl.DateTimeFormat('en-US').format(new Date());
    const itemWithMeta: any = {
      ...item,
      type,
      category,
      day,
      date,
      tiffinPlan,
    };
    const nextChecked = !checked;

    setSelectedItemsToAddOnCart?.((prev: any[]) => {
      if (type === 'addon') {
        // multi-select: add/remove only this item
        return nextChecked
          ? [...prev, itemWithMeta]
          : prev.filter(
              i =>
                !(
                  i.id === item.id &&
                  i.variantId === item.variantId &&
                  i.day === day &&
                  i.category === category
                ),
            );
      }

      // type === 'main' → single-select within same day+category (do not touch addons)
      const withoutMainGroup = prev.filter(
        i => !(i.type === 'main' && i.day === day && i.category === category),
      );
      return nextChecked
        ? [...withoutMainGroup, itemWithMeta]
        : withoutMainGroup;
    });

    onChange?.({ ...itemWithMeta, selected: nextChecked, liked: isFav });
  };

  const onHeartPress = () => {
    const date = new Intl.DateTimeFormat('en-US').format(new Date());
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
        type,
        date,
        tags: item.tags,
      }),
    );
    onChange?.({ ...item, selected: checked, liked: !isFav });
  };

  if (isLoading) return <SkeletonLoading />;
  return (
    <>
      {/* Whole row toggles selection now */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={toggleSelection}
        style={[s.row, checked && { backgroundColor: COLORS.rowBg }]}
      >
        {/* Radio UI (visual only; logic uses `checked`) */}
        <TouchableOpacity
          onPress={toggleSelection}
          style={[s.radio, checked && s.radioOn]}
          activeOpacity={0.85}
          accessibilityRole="radio"
          accessibilityState={{ selected: checked }}
        >
          {checked && <View style={s.radioDot} />}
        </TouchableOpacity>

        <Image
          source={{ uri: item.image === null ? EMPTY_STATE_URL : item.image }}
          style={[s.thumb]}
        />

        {/* Tap anywhere selects; text not a button */}
        <View style={s.textContainer}>
          <Text style={s.title} numberOfLines={1}>
            {item.title}
          </Text>
          {Number(item.price) > 0 ? (
            <Text style={s.price}>
              +{'('}${item.price}
              {')'}
            </Text>
          ) : null}
        </View>

        {/* New eye icon opens modal description */}
        <TouchableOpacity
          onPress={() => setOpen(true)}
          style={s.iconBtn}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="View details"
        >
          <EyeShow width={24} height={24} />
        </TouchableOpacity>

        {/* Favorite stays as-is */}
        <TouchableOpacity
          onPress={onHeartPress}
          style={s.iconBtn}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={
            isFav ? 'Remove from favorites' : 'Add to favorites'
          }
        >
          <HeartIcon
            width={24}
            height={24}
            fill={isFav ? '#FF0000' : '#CCCCCC'}
          />
        </TouchableOpacity>
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
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEF1EE',
    backgroundColor: COLORS.white,
  },
  textContainer: { flex: 1, paddingRight: 8 },
  // Radio visual
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.4,
    borderColor: '#C7D0C9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: COLORS.white,
  },
  radioOn: { borderColor: COLORS.green },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.green,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: 'cover',
  },
  title: { flex: 1, fontWeight: '700', color: COLORS.text },
  heartWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  price: { fontSize: 14, color: 'gray', marginTop: 4 },

  // keep existing modal/skeleton styles below (unchanged)...
});
