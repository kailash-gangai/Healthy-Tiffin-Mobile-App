import React, { useState } from 'react';
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
import { selectIsWishlisted, toggleWishlist } from '../store/slice/favoriteSlice';
import EyeShow from '../assets/htf-icon/icon-eye.svg';
import HeartIcon from '../assets/htf-icon/icon-heart.svg';
import { EMPTY_STATE_URL } from '../constants';
import SkeletonLoading from './SkeletonLoading';
const width = Dimensions.get('window').width;
type Dish = {
  id: string;
  title: string;
  price: string;
  image: string;
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
  white: '#FFFFFF',
  lightGray: '#EDEDED',
  veg: '#A6CE39',
  nonveg: '#6A3A1D',
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
}: any) {
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
  const isFav = useAppSelector(selectIsWishlisted(item.id, item.variantId, category, day));

  const toggleSelection = () => {
    const date = new Intl.DateTimeFormat('en-US').format(new Date());
    const itemWithMeta = { ...item, type, category, day, date, tiffinPlan };
    const nextChecked = !checked;

    setSelectedItemsToAddOnCart?.((prev: any[]) => {
      if (type === 'addon') {
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
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={toggleSelection}
        style={s.card}
      >
        {/* Dish Image */}
        <View style={s.imageWrap}>
          <Image
            source={{ uri: item.image || EMPTY_STATE_URL }}
            style={s.image}
          />

          {/* Heart */}
          <TouchableOpacity onPress={onHeartPress} style={s.heartBtn}>
            <HeartIcon
              width={20}
              height={20}
              fill={isFav ? '#FF4D4D' : 'rgba(255,255,255,0.8)'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setOpen(true)} style={s.eyeBtn} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="View details" > <EyeShow width={20} height={20} /> </TouchableOpacity>

          {/* Selection circle */}
          <Text style={[s.radio, checked && s.radioOn]}>
            {checked && <Text style={s.radioDot} />}
          </Text>


        </View>

        <View style={s.tagContainer}>
          {item.tags?.slice(0, 2).map((tag, idx) => (
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
        {/* Product Info */}
        <View style={[s.textWrap, { flexDirection: 'row', justifyContent: 'space-between' }]}>
          <Text style={s.title} numberOfLines={2}>
            {item.title || 'Product Name'}

          </Text>
          <Text style={s.price}>
            + ${item.price || '0.00'}
          </Text>
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
}

const s = StyleSheet.create({
  card: {
    width: (width / 2) - 40,
    height: width / 2 + 40,
    borderRadius: 14,
  },
  imageWrap: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
  },
  image: {
    width: width / 2 - 40,
    height: width / 2 - 40,
    resizeMode: 'cover',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 14,
    padding: 6,
  },
  eyeBtn: {
    position: 'absolute',
    top: 8,
    left: 48,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 14,
    padding: 6,
  },
  radio: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.6,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },
  tagContainer: {
    position: 'absolute',
    top: width / 2 - 50,
    right: 0,
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
  textWrap: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
    flexWrap: 'wrap',
    marginTop: 6,
  },
  title: {
    flex: 1,
    fontWeight: '700',
    fontSize: 14,
    color: '#232323',
    marginRight: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9E9E9E',
    alignSelf: 'flex-start',
  },
});
