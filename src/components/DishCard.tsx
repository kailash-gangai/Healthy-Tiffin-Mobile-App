import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import DishDetailModal from './DishDetailModal';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectIsWishlisted,
  toggleWishlist,
} from '../store/slice/favoriteSlice';
import SkeletonLoading from './SkeletonLoading';
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
  setSelectedItemsToAddOnCart?: (items: Dish[]) => void;
  selectedItemsToAddOnCart: Dish[];
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
  const [liked, setLiked] = useState(!!item.liked);
  const [open, setOpen] = useState(false);

  const isFav = useAppSelector(
    selectIsWishlisted(item.id, item.variantId, category, day),
  );

  const toggleSelection = () => {
    const date = new Intl.DateTimeFormat('en-US').format(new Date());
    const itemWithMeta: any = { ...item, type, category, day, date };
    const nextChecked = !checked;

    setSelectedItemsToAddOnCart?.(prev =>
      nextChecked
        ? [...prev, itemWithMeta]
        : prev.filter(
            (i: any) =>
              !(
                i.id === item.id &&
                i.variantId === item.variantId &&
                i.day === day &&
                i.category === category
              ),
          ),
    );

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
        activeOpacity={0.85}
        onPress={() => setOpen(true)}
        style={[s.row, checked && { backgroundColor: COLORS.rowBg }]}
      >
        <TouchableOpacity
          onPress={toggleSelection}
          style={[s.checkbox, checked && s.checkboxOn]}
          activeOpacity={0.85}
        >
          {checked ? (
            <FontAwesome5
              iconStyle="solid"
              name="check"
              size={12}
              color="#fff"
            />
          ) : null}
        </TouchableOpacity>

        <Image source={{ uri: item.image }} style={[s.thumb]} />
        <View style={s.textContainer}>
          <Text style={s.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={s.price}>${item.price}</Text>
        </View>

        <TouchableOpacity
          onPress={onHeartPress}
          style={[s.heartWrap]}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={
            isFav ? 'Remove from favorites' : 'Add to favorites'
          }
        >
          <FontAwesome5
            iconStyle="solid"
            name="heart"
            size={18}
            color={isFav ? COLORS.accent : COLORS.divider}
          />
        </TouchableOpacity>
      </TouchableOpacity>

      <DishDetailModal
        visible={open}
        onClose={() => setOpen(false)}
        onShare={() => {}}
        onToggleLike={() => {}}
        liked={isFav}
        dish={item}
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
  textContainer: { flex: 1 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.4,
    borderColor: '#C7D0C9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: COLORS.white,
  },
  checkboxOn: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: 'cover',
  },
  title: { flex: 1, fontWeight: '700', color: COLORS.text },
  titleDim: { color: '#BDBDBD' },
  heartWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  price: { fontSize: 14, color: 'gray', marginTop: 4 },

  // skeleton
  skelBox: { backgroundColor: '#E8F2EC', borderRadius: 8 },
  skelCheckbox: { width: 20, height: 20, borderRadius: 4, marginRight: 10 },
  skelThumb: { width: 44, height: 44, borderRadius: 8, marginRight: 10 },
  skelHeart: { width: 30, height: 30, borderRadius: 15 },

  // modal
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.backdrop,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: COLORS.white,
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#DDD',
    marginTop: 8,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
  },
  modalImg: { width: 54, height: 54, borderRadius: 10 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  kcal: { marginTop: 2, color: COLORS.sub },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHd: {
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 6,
  },
  desc: { color: COLORS.text, lineHeight: 20 },
  actions: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.divider,
  },
  actBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: COLORS.green },
  secondary: { backgroundColor: '#F4F4F4' },
  actTxt: { color: COLORS.white, fontWeight: '800' },
});
