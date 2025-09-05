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

type Dish = {
  id: string;
  title: string;
  price: string;
  image: any;
  description?: string;
  calories?: number;
  enabled?: boolean;
  day?: string;
  selected?: boolean;
  variantId: string;
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

function SkeletonDishRow() {
  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 1],
  });

  return (
    <View style={[s.row, { backgroundColor: COLORS.white }]}>
      <Animated.View style={[s.skelBox, s.skelCheckbox, { opacity }]} />
      <Animated.View style={[s.skelBox, s.skelThumb, { opacity }]} />
      <View style={s.textContainer}>
        <Animated.View
          style={[
            s.skelBox,
            { height: 14, width: '60%', marginBottom: 8, opacity },
          ]}
        />
        <Animated.View
          style={[s.skelBox, { height: 12, width: '35%', opacity }]}
        />
      </View>
      <Animated.View style={[s.skelBox, s.skelHeart, { opacity }]} />
    </View>
  );
}

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
  const enabled = item.enabled !== false;
  const active = enabled && checked;

  const toggleSelection = () => {
    if (item.enabled === false) return;

    const currentDate = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-US').format(currentDate);
    const itemWithType: any = {
      ...item,
      type,
      category,
      day,
      date: formattedDate,
    };
    const nextChecked = !checked;

    if (nextChecked) {
      // add this day+category instance
      setSelectedItemsToAddOnCart(prev => [...prev, itemWithType]);
    } else {
      // remove only this day+category instance
      setSelectedItemsToAddOnCart(prev =>
        prev.filter(
          (i: any) =>
            !(
              i.id === item.id &&
              i.variantId === item.variantId &&
              i.day === day &&
              i.category === category
            ),
        ),
      );
    }

    onChange?.({ ...itemWithType, selected: nextChecked, liked });
  };

  const toggleLike = () => {
    if (!enabled) return;
    const next = !liked;
    setLiked(next);
    onChange?.({ ...item, selected: checked, liked: next });
  };

  if (isLoading) return <SkeletonDishRow />;

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setOpen(true)}
        style={[s.row, active && { backgroundColor: COLORS.rowBg }]}
        disabled={!enabled}
      >
        <TouchableOpacity
          onPress={toggleSelection}
          disabled={!enabled}
          style={[
            s.checkbox,
            active && s.checkboxOn,
            !enabled && { opacity: 0.35 },
          ]}
          activeOpacity={0.85}
        >
          {active ? (
            <FontAwesome5
              iconStyle="solid"
              name="check"
              size={12}
              color="#fff"
            />
          ) : null}
        </TouchableOpacity>

        <Image
          source={{ uri: item.image }}
          style={[s.thumb, !enabled && { opacity: 0.35 }]}
        />
        <View style={s.textContainer}>
          <Text style={[s.title, !enabled && s.titleDim]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[s.price, !enabled && s.titleDim]}>${item?.price}</Text>
        </View>

        <TouchableOpacity
          onPress={toggleLike}
          disabled={!enabled}
          style={[s.heartWrap, !enabled && { opacity: 0.35 }]}
          activeOpacity={0.85}
        >
          <FontAwesome5
            iconStyle="solid"
            name="heart"
            size={18}
            color={COLORS.accent}
          />
        </TouchableOpacity>
      </TouchableOpacity>

      <DishDetailModal
        visible={open}
        onClose={() => setOpen(false)}
        onShare={() => {}}
        onToggleLike={() => {}}
        liked={liked}
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
