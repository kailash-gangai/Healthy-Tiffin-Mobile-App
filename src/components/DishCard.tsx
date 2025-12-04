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
import {
  selectIsWishlisted,
  toggleWishlist,
} from '../store/slice/favoriteSlice';
import EyeShow from '../assets/newicon/i-icon.svg';
import HeartIcon from '../assets/newicon/heart.svg';
import { EMPTY_STATE_URL } from '../constants';
import SkeletonLoading from './SkeletonLoading';
import { addItems, removeItem } from '../store/slice/cartSlice';
import LinearGradient from 'react-native-linear-gradient';

const width = Dimensions.get('window').width;

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
  date,
  category,
  type,
  tiffinPlan,
  item,
  onChange,
  isLoading,
}: any) {
  const dispatch = useAppDispatch();
  const { lines } = useAppSelector(state => state.cart);

  // Check if this specific item is in cart
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

  // Check if any item in the same category for this tiffin plan is selected
  const isCategorySelected = React.useMemo(
    () =>
      lines.some(
        (it: any) =>
          it.day === day &&
          it.category === category &&
          it.type === 'main' &&
          it.tiffinPlan === tiffinPlan,
      ),
    [lines, day, category, tiffinPlan],
  );

  const [open, setOpen] = useState(false);
  const isFav = useAppSelector(
    selectIsWishlisted(item.id, item.variantId, category, day),
  );
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
  const toggleSelection = () => {
    const itemWithMeta = {
      ...item,
      type,
      category,
      day,
      date,
      tiffinPlan,
      qty: 1,
    };

    if (isItemInCart) {
      // Remove if already selected
      dispatch(
        removeItem({
          id: item.id,
          variantId: item.variantId,
          tiffinPlan,
          type,
        }),
      );
      onChange?.({ ...itemWithMeta, selected: false, liked: isFav });
    } else {
      // Add new item (cart slice will handle replacement of same category)
      dispatch(addItems([itemWithMeta]));
      onChange?.({ ...itemWithMeta, selected: true, liked: isFav });
    }
  };

  const onHeartPress = () => {
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
    onChange?.({ ...item, selected: isItemInCart, liked: !isFav });
  };

  const dishItem = {
    ...item,
    type,
    category,
    day,
    date,
    tiffinPlan,
    qty: 1,
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
              stroke={isFav ? '#F9C711' : '#878787'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setOpen(true)}
            style={s.eyeBtn}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="View details"
          >
            <EyeShow width={20} height={20} />
          </TouchableOpacity>

          {/* Selection circle */}
          <LinearGradient
            colors={isItemInCart ? ['#5FBC9B', '#1E9E64'] : ['#fff', '#fff']}
           style={[s.radio, isItemInCart && s.radioOn]}
          >
                     
          </LinearGradient>
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

        {/* Product Info */}
        <View style={s.textWrap}>
          <Text style={s.title} numberOfLines={2}>
            {item.title || 'Product Name'}
          </Text>
          {item.price !== 0 && (
            <Text style={s.price}>+ ${item.price || '0.00'}</Text>
          )}
        </View>
      </TouchableOpacity>

      <DishDetailModal
        visible={open}
        onClose={() => setOpen(false)}
        onToggleLike={onHeartPress}
        liked={isFav}
        dish={dishItem as any}
      />
    </>
  );
}

const s = StyleSheet.create({
  card: {
    width: width / 2 - 40,
    borderRadius: 16,
  },
  imageWrap: {
    position: 'relative',
    borderRadius: 16,
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
  },
  eyeBtn: {
    position: 'absolute',
    bottom: 12,
    right: 4,
    backgroundColor:'#CBC6CD',
    borderStyle: 'solid',
    borderRadius: 14,
  },
  radio: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.6,
    borderColor: '#CBC6CD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderRadius: 10,
    borderColor: '#FFFFFF',
    // backgroundColor: '#0B5733',
  },
  // radioDot: {
  //   width: 8,
  //   height: 8,
  //   borderRadius: 4,
  //   backgroundColor: COLORS.green,
  // },
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
    fontWeight: '400',
    fontSize: 12,
    color: '#00020E',
    fontFamily: 'Poppins',
    lineHeight: 20,
    letterSpacing: -0.24,
  },
  price: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.24,
    color: '#00020E80',
    alignSelf: 'flex-start',
  },
  occupiedIndicator: {
    backgroundColor: '#FFF3CD',
    padding: 4,
    borderRadius: 4,
    marginHorizontal: 8,
    marginTop: 4,
  },
  occupiedText: {
    fontSize: 10,
    color: '#856404',
    textAlign: 'center',
  },
});
