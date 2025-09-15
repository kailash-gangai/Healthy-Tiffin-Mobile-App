import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import { useAppDispatch } from '../store/hooks';
import { addItem } from '../store/slice/cartSlice';
import Toast from 'react-native-toast-message';

type Dish = {
  title: string;
  image: any;
  price: string; // require(...)
  calories: number;
  tags?: string[]; // e.g. ['High Protein','Low carb','150 g']
  description?: string;
  liked?: boolean;
};

const COLORS = {
  bg: 'rgba(0,0,0,0.55)',
  white: '#FFFFFF',
  text: '#1E1E1E',
  sub: '#8F8F8F',
  green: '#0B5733',
  accent: '#F6A868',
  border: '#EEEEEE',
  shadow: 'rgba(0,0,0,0.18)',
};

export default function DishDetailModal({
  visible,
  onClose,
  onShare,
  onToggleLike,
  liked,
  dish,
}: {
  visible: boolean;
  onClose: () => void;
  onShare?: () => void;
  onToggleLike?: () => void;
  liked?: boolean;
  dish: Dish;
}) {
  const dispatch = useAppDispatch();
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={s.backdrop} onPress={onClose} />
      <View style={s.wrap}>
        <View style={s.card}>
          {/* close button */}
          <TouchableOpacity
            style={s.close}
            onPress={onClose}
            activeOpacity={0.9}
          >
            <FontAwesome5
              iconStyle="solid"
              name="times"
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
          {/* image with white frame + shadow */}
          <View style={s.imgFrame}>
            <Image
              source={{
                uri: dish.image,
              }}
              style={s.img}
            />
          </View>

          {/* title row with share + like */}
          <View style={s.titleRow}>
            <Text style={s.title} numberOfLines={2}>
              {dish.title}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={onShare} hitSlop={8}>
                <FontAwesome5
                  iconStyle="solid"
                  name="share"
                  size={18}
                  color={COLORS.accent}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={onToggleLike} hitSlop={8}>
                <FontAwesome5
                  iconStyle="solid"
                  name="heart"
                  size={18}
                  color={COLORS.accent}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* calories */}
          <Text style={s.kcal}>
            <Text style={s.kcalNum}>{dish.calories}</Text>
            <Text style={s.kcalUnit}> CALORIES</Text>
          </Text>

          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => {
              dispatch(addItem(dish as any));
              Toast.show({
                text1: 'Added',
                text2: 'item added to the cart',
                visibilityTime: 2000,
                position: 'bottom',
                autoHide: true,
              });
            }}
            style={{
              alignSelf: 'flex-end',
              paddingVertical: 5,
              paddingHorizontal: 10,
              backgroundColor: '#000',
              borderRadius: 50,
            }}
          >
            <Text style={{ color: '#ffffffff', fontWeight: '700' }}>
              Add to cart
            </Text>
          </TouchableOpacity>
          {/* tags */}
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={s.tags}>
              {(dish.tags || ['High Protein', 'Low carb', '150 g']).map(t => (
                <View key={t} style={s.tag}>
                  <Text style={s.tagTxt}>{t}</Text>
                </View>
              ))}
            </View>
            <Text style={{ color: 'gray' }}>${dish.price}</Text>
          </View>

          {/* description */}
          <ScrollView
            contentContainerStyle={{ paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={s.desc}>
              {dish.description ||
                `Savor the burst of summer flavors with each bite. This dish is perfect for picnics,
barbecues, or as a light and satisfying lunch. A perfect balance of sweet, savory, and zesty goodness.`}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.bg },
  wrap: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    position: 'relative',
    borderRadius: 18,
    backgroundColor: COLORS.white,
    padding: 16,
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  close: {
    position: 'absolute',
    // bottom: 'auto',
    top: -14,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderColor: '#fff',
    borderWidth: 2,
  },

  imgFrame: {
    borderRadius: 14,
    padding: 6,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    marginBottom: 12,
  },
  img: { width: '100%', height: 200, borderRadius: 10, resizeMode: 'cover' },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: COLORS.text,
    fontWeight: '800',
    fontSize: 18,
    flex: 1,
    paddingRight: 10,
  },

  kcal: {
    marginTop: 8,
  },
  kcalNum: { color: COLORS.green, fontWeight: '800', fontSize: 20 },
  kcalUnit: {
    color: COLORS.sub,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 2,
    fontSize: 11,
  },

  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  tag: {
    backgroundColor: COLORS.green,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tagTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },

  desc: { color: COLORS.sub, marginTop: 12, lineHeight: 20 },
});
