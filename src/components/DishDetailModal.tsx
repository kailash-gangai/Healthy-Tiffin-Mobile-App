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

import CaloriesIcon from '../assets/htf-icon/icon-calories.svg';
import ProteinIcon from '../assets/htf-icon/icon-protein.svg';
import CarbsIcon from '../assets/htf-icon/icon-carbs.svg';
import SugarIcon from '../assets/htf-icon/icon-sugar.svg';
import CholesterolIcon from '../assets/htf-icon/icon-cholesterol.svg';
import PotassiumIcon from '../assets/htf-icon/icon-potassium.svg';
import LinearGradient from 'react-native-linear-gradient';
import { useAppDispatch } from '../store/hooks';
import { addItem, addItems } from '../store/slice/cartSlice';
const { height } = Dimensions.get('window');
const width = Dimensions.get('window').width;
import MobileMenubg from '../assets/newicon/mobile-menu-oprn.svg'

const COLORS = {
  backdrop: 'rgba(0,0,0,0.45)',
  white: '#ffffff',
  text: '#1B1B1B',
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

  const nutritionInfo = [
    {
      label: 'Calories',
      value: '',
      icon: <CaloriesIcon height={20} width={20} />,
    },
    {
      label: 'Protein',
      value: '',
      icon: <ProteinIcon height={20} width={20} />,
    },
    {
      label: 'Total Carbs',
      value: '',
      icon: <CarbsIcon height={20} width={20} />,
    },
    { label: 'Sugar', value: '', icon: <SugarIcon height={20} width={20} /> },
    {
      label: 'Cholesterol',
      value: '',
      icon: <CholesterolIcon height={20} width={20} />,
    },
    {
      label: 'Potassium',
      value: '',
      icon: <PotassiumIcon height={20} width={20} />,
    },
  ];

  const metaobject = dish?.metafields?.find(
    (mf: any) => mf && mf.key === 'nutrients_information',
  );

  if (metaobject) {
    const nutrientsInformation = JSON.parse(metaobject.value);
    const updatedNutritionInfo = nutritionInfo.map((nutrient, i) => {
      const nutrientData = nutrientsInformation.find(n =>
        n.toLowerCase().includes(nutrient.label.toLowerCase()),
      );

      if (nutrientData) {
        const [label, value] = nutrientData.split(' || ');
        return {
          ...nutrient,
          value: value || '',
        };
      }

      return nutrient;
    });

    nutritionInfo.splice(0, nutritionInfo.length, ...updatedNutritionInfo);
  }

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
  const dispatch = useAppDispatch();
  const handleAddToCart = () => {
    console.log('Load', new Date());
    dispatch(addItems([dish as any]));
    onClose();
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
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={s.backdrop} onPress={onClose} />
      <Animated.View style={[s.sheet, { transform: [{ translateY }] }]}>
        <MobileMenubg height={75} width={width} style={{ position: "absolute", top: -3, left: 0, right: 0 }} />

        <TouchableOpacity onPress={onClose} style={s.handleWrapper}>
          {/* <View style={s.handle}></View> */}
        </TouchableOpacity>
        <View style={{
          backgroundColor: '#F7F7F9', paddingTop: 8,
          paddingHorizontal: 20,
        }}>
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
                  <HeartIcon
                    width={26}
                    height={26}
                    fill={liked ? '#FF0000' : '#C7C7C7'}
                  />
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
            <Text style={s.desc}>{dish.description || ' '}</Text>

            <View style={s.nutritionWrap}>
              {nutritionInfo.map(
                (n, i) =>
                  n.value !== '' && (
                    <View key={i} style={s.nutriBox}>
                      <View>
                        <Text style={s.nutriIcon}>{n.icon}</Text>
                      </View>
                      <View>
                        <Text style={s.nutriLabel}>{n.label}</Text>
                        <Text style={s.nutriValue}>{n.value}</Text>
                      </View>
                    </View>
                  ),
              )}
            </View>
          </ScrollView>

          {/* FIXED BUTTON (non-scrollable) */}
          {/* FIXED BUTTON (non-scrollable) */}
          <View style={s.footer}>
            <TouchableOpacity onPress={handleAddToCart} activeOpacity={0.9}>
              <LinearGradient
                colors={['#42D296', '#2AB47B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[s.addBtn]}
              >
                <View style={s.toggleBtnContent}>
                  <Text style={s.addText}>Add to Cart</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
    case 'foodmap':
      return { backgroundColor: '#A5B6A5' };
    default:
      return { backgroundColor: '#0B5733' };
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,

  },
  handleWrapper: {
    width: '100%',
    height: 5,
    paddingVertical: 13,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '300',
    lineHeight: 20,
    marginBottom: 16,
    letterSpacing: 0.24,
  },
  nutritionWrap: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  nutriBox: {
    display: 'flex',
    gap: 6,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    flexDirection: 'row',
    width: (width - 33.33) / 3 - 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  nutriIcon: { fontSize: 18, marginBottom: 4 },
  nutriValue: { fontWeight: '500', fontSize: 12, color: COLORS.text },
  nutriLabel: { fontSize: 12, color: COLORS.sub },

  /* Fixed Add Button */
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 25,
    paddingTop: 10,
  },
  addBtn: {
    borderRadius: 8,

    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    color: COLORS.white,
    fontWeight: '500',
    lineHeight: 24,
    fontSize: 16,
  },
  toggleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});
