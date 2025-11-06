import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
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
import { addItem, decreaseItem, removeItem } from '../store/slice/cartSlice';

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
  metafields?: any[];
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
  isLoading,
}: {
  category: string;
  day: string;
  type: 'main' | 'addon';
  item: Dish;
  onChange?: (d: Dish) => void;
  tiffinPlan?: number | any;
  isLoading?: boolean;
}) {
  const dispatch = useAppDispatch();
  const { lines } = useAppSelector(state => state.cart);
  const [open, setOpen] = useState(false);

  let customTags = item?.metafields?.find(
    (mf: any) => mf && mf.key === 'dietary_tags',
  );
  if (customTags) {
    try {
      customTags = JSON.parse(customTags.value); // Safely parse the JSON string
    } catch (error) {
      console.error('Error parsing dietary tags:', error);
      customTags = []; // Default to empty array if parsing fails
    }
  } else {
    customTags = []; // Default to empty array if no tags are found
  }

  // Find this item in cart
  const cartItem = useMemo(
    () =>
      lines.find(
        (line: any) =>
          line.id === item.id &&
          line.variantId === item.variantId &&
          line.day === day &&
          line.category === category &&
          line.type === 'addon',
      ),
    [lines, item.id, item.variantId, day, category],
  );

  const qty = cartItem?.qty ?? 0;
  const checked = qty > 0;

  const isFav = useAppSelector(
    selectIsWishlisted(item.id, item.variantId, category, day),
  );

  const addToCart = useCallback(() => {
    const itemWithMeta = {
      ...item,
      type: 'addon',
      category,
      day,
      date: nowStr(),
      tiffinPlan,
      qty: 1,
    };
    dispatch(addItem(itemWithMeta as any));
    onChange?.({ ...item, selected: true, liked: isFav });
  }, [dispatch, item, category, day, tiffinPlan, onChange, isFav]);

  const increment = useCallback(() => {
    const itemWithMeta = {
      ...item,
      type: 'addon',
      category,
      day,
      date: nowStr(),
      tiffinPlan,
      qty: 1,
    };
    dispatch(addItem(itemWithMeta as any));
    onChange?.({ ...item, selected: true, liked: isFav });
  }, [dispatch, item, category, day, tiffinPlan, onChange, isFav]);

  const decrement = useCallback(() => {
    if (qty <= 1) {
      // Remove item completely
      dispatch(
        removeItem({
          id: item.id,
          variantId: item.variantId,
          tiffinPlan,
          type: 'addon',
        }),
      );
      onChange?.({ ...item, selected: false, liked: isFav });
    } else {
      // Decrease quantity
      dispatch(
        decreaseItem({
          id: item.id,
          variantId: item.variantId,
          tiffinPlan,
          type: 'addon',
        }),
      );
      onChange?.({ ...item, selected: true, liked: isFav });
    }
  }, [
    dispatch,
    item.id,
    item.variantId,
    tiffinPlan,
    qty,
    onChange,
    item,
    isFav,
  ]);

  const onCardPress = useCallback(() => {
    if (!checked) {
      addToCart();
    }
  }, [checked, addToCart]);

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
    onChange?.({ ...item, selected: checked, liked: !isFav });
  }, [dispatch, item, category, day, onChange, isFav, checked]);

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

        <View style={s.tagContainer}>
          {customTags &&
            customTags.length > 0 &&
            customTags.map((tag: any, idx: any) => (
              <View
                key={idx}
                style={[
                  s.tag,
                  tag.toLowerCase() === 'veg' && s.tagVeg,
                  tag.toLowerCase() === 'nv' && s.tagNV,
                  tag.toLowerCase() === 'fodmap' && s.tagFODMAP,
                  tag.toLowerCase() === 'vgn' && s.tagVGN,
                ]}
              >
                <Text style={s.tagText}>{tag.toUpperCase()}</Text>
              </View>
            ))}
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
              decrement();
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
    width: width / 2 - 40,
    height: width / 2 + 40,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 8,
  },
  imgWrap: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: width / 2 - 40,
    resizeMode: 'cover',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 10,
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
  textWrap: {
    marginTop: 10,
    minHeight: 32,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 16,
  },
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
  pillBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.green,
    lineHeight: 16,
  },
  qtyNum: {
    minWidth: 16,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  tagContainer: {
    position: 'absolute',
    top: width / 2 - 42,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    zIndex: 10,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    marginHorizontal: 4,
    backgroundColor: '#f7c612',
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 4,
  },
  tagVeg: { backgroundColor: '#A6CE39' },
  tagNV: { backgroundColor: '#6A3A1D' },
  tagFODMAP: { backgroundColor: '#A5B6A5' },
  tagVGN: { backgroundColor: '#e58d2a' },
  tagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});
