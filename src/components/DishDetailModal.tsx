import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
  Alert,
} from 'react-native';
import Share from 'react-native-share';
import Clipboard from '@react-native-clipboard/clipboard';
import HeartIcon from '../assets/htf-icon/icon-heart.svg';
import ShearIcon from '../assets/htf-icon/icon-shre.svg';

const { height } = Dimensions.get('window');

const COLORS = {
  backdrop: 'rgba(0,0,0,0.45)',
  white: '#FFFFFF',
  text: '#1E1E1E',
  sub: '#8F8F8F',
  green: '#0B5733',
  border: '#EEEEEE',
};

type Dish = {
  title: string;
  handle?: string;
  image: string;
  price: string;
  calories: number;
  tags?: string[];
  description?: string;
  liked?: boolean;
};

export default function DishDetailModal({
  visible,
  onClose,
  onToggleLike,
  liked,
  dish,
}: {
  visible: boolean;
  onClose: () => void;
  onToggleLike?: () => void;
  liked?: boolean;
  dish: Dish;
}) {
  const translateY = useRef(new Animated.Value(height)).current; // start off-screen



  const handleShare = async () => {
    try {
      const url = `https://healthytiffin-dev.myshopify.com/products/${dish.handle}`;
      await Share.open({ url, title: 'Share Dish' });
    } catch (err: any) {
      if (!err?.message?.includes('User did not share')) {
        Alert.alert('Error', 'Share failed.');
      }
    }
  };

  const handleCopyLink = () => {
    Clipboard.setString(dish.image || '');
    Alert.alert('Copied', 'Link copied to clipboard.');
  };

  const handleAddToCart = () => {
    onClose(); // close modal after adding
  };
  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 120,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: height,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} />
      <Animated.View
        style={[s.sheet, { transform: [{ translateY }] }]}

      >
        <View style={s.handle} />



        {/* Scrollable content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Header */}
          <View style={s.headerRow}>
            <Text style={s.title} numberOfLines={2}>
              {dish.title || 'Product Name'}
            </Text>
            <View style={s.actions}>
              <TouchableOpacity onPress={handleShare}>
                <ShearIcon width={22} height={22} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCopyLink}>
                <Text style={s.copy}>⧉</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onToggleLike}>
                <HeartIcon width={26} height={26} fill={liked ? '#FF0000' : '#C7C7C7'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Image */}
          <Image source={{ uri: dish.image }} style={s.image} />

          {/* Tags */}
          <View style={s.tagWrap}>
            {(dish.tags || ['VEG', 'VGN', 'NV', 'FODMAP', 'PLATE METHOD'])
              .slice(0, 5)
              .map(t => (
                <View key={t} style={[s.tag, getTagColor(t)]}>
                  <Text style={s.tagText}>{t}</Text>
                </View>
              ))}
          </View>

          {/* Description */}
          <Text style={s.desc}>
            {dish.description ||
              'Lorem ipsum dolor sit amet consectetur. Amet aliquam scelerisque ut quisque non. Non adipiscing suspendisse eget nulla tempus eget malesuada at aliquam.'}
          </Text>

          {/* Nutrition Stats */}
          <View style={s.nutritionWrap}>
            {[
              { label: 'Calories', value: '431 kcal', icon: '🔥' },
              { label: 'Protein', value: '38 g', icon: '💪' },
              { label: 'Total Carbs', value: '4.1 g', icon: '🥔' },
              { label: 'Sugar', value: '0.9 g', icon: '🍬' },
              { label: 'Cholesterol', value: '4.1 g', icon: '❤️' },
              { label: 'Potassium', value: '125 mg', icon: '🧂' },
            ].map((n, i) => (
              <View key={i} style={s.nutriBox}>
                <Text style={s.nutriIcon}>{n.icon}</Text>
                <Text style={s.nutriValue}>{n.value}</Text>
                <Text style={s.nutriLabel}>{n.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* FIXED BUTTON (non-scrollable) */}
        <View style={s.footer}>
          <TouchableOpacity style={s.addBtn} onPress={handleAddToCart} activeOpacity={0.9}>
            <Text style={s.addText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );  
}

function getTagColor(tag: string) {
  switch (tag.toLowerCase()) {
    case 'veg':
      return { backgroundColor: '#A6CE39' };
    case 'vgn':
      return { backgroundColor: '#F2B740' };
    case 'nv':
      return { backgroundColor: '#6A3A1D' };
    case 'fodmap':
      return { backgroundColor: '#A5B6A5' };
    default:
      return { backgroundColor: '#E5E5E5' };
  }
}

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.backdrop,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
    paddingTop: 8,
    paddingHorizontal: 20,
  },
  handle: {
    width: 50,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text, flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  copy: { fontSize: 20, color: '#777' },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    marginVertical: 14,
    resizeMode: 'cover',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tag: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  tagText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  desc: {
    color: COLORS.sub,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  nutritionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  nutriBox: {
    width: '30%',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  nutriIcon: { fontSize: 18, marginBottom: 4 },
  nutriValue: { fontWeight: '700', fontSize: 13, color: COLORS.text },
  nutriLabel: { fontSize: 12, color: COLORS.sub },

  /* Fixed Add Button */
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingBottom: 25,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEE',
  },
  addBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
});
