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
import HeartIcon from '../assets/newicon/heart.svg';
import EyeShow from '../assets/htf-icon/icon-eye-white.svg';
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
  const isItemInCart = React.useMemo(
    () =>
      lines.some(
        (it: any) =>
          it.id === item.id &&
          it.variantId === item.variantId &&
          it.day === day &&
          it.category === category &&
          it.tiffinPlan === tiffinPlan,
      ),
    [lines, item.id, item.variantId, day, category, tiffinPlan],
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
    console.log('Adding to cart:', itemWithMeta);
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


          <TouchableOpacity
            onPress={e => {
              e.stopPropagation();
              setOpen(true);
            }}
            style={[s.iconBtn, { right: 8, bottom: 8, position: 'absolute' }]}
          >
            <EyeShow width={16} height={16} />
          </TouchableOpacity>
          <Text style={[s.radio, isItemInCart && s.radioOn]}>
            {isItemInCart && <Text style={s.radioDot} />}
          </Text>
          <TouchableOpacity
            onPress={e => {
              e.stopPropagation();
              onHeartPress();
            }}
            style={[{ left: 8, top: 8, position: 'absolute' }]}
          >
            <HeartIcon
              width={20}
              height={20}
              stroke={isFav ? '#F9C711' : '#878787'}

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

        <View >
          {/* Title */}
          <View style={s.textWrap}>
            <Text style={s.title} numberOfLines={2}>
              {item.title}
            </Text>
            <View >
              <Text style={s.priceText}>${item.price}</Text>
            </View>
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

    borderRadius: 16,
    marginBottom: 8,
  },
  imgWrap: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
  },
  thumb: {
    width: width / 2 - 40,
    height: width / 2 - 40,
    resizeMode: 'cover',
  },

  priceText: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.24,
    color: '#00020E80',
    alignSelf: 'flex-start',
  },
  radio: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.6,
    borderColor: '#DFB318',
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: '#FFFFFF',
    backgroundColor: '#0B5733',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },
  iconBtn: {
    position: 'absolute',
    borderWidth: 1.2,
    borderColor: '#878787',
    borderStyle: 'solid',
    backgroundColor: '#878787',
    borderRadius: 14,
    padding: 2,
  },
  textWrap: {
    marginTop: 12,
    minHeight: 32,
    paddingHorizontal: 4,
  },
  title: {
    fontWeight: '400',
    fontSize: 12,
    color: '#00020E',
    fontFamily: 'Poppins',
    lineHeight: 20,
    letterSpacing: -0.24,
  },
  qtyPill: {

    alignSelf: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ababaa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 6,
  },
  pillBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',

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
    top: width / 2 - 50,
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
