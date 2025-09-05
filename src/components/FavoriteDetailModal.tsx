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
import { COLORS, SHADOW } from '../ui/theme';
import { EMPTY_STATE_URL } from '../constants';

type Item = {
  id: string;
  title: string;
  price: string;
  image: string | null;
  description?: string;
  category: string;
  type: 'main' | 'addon';
  day?: string;
  variantId: string;
  tags?: string[];
  date?: string;
};

export default function FavoriteDetailModal({
  visible,
  onClose,
  onShare,
  onToggleLike,
  liked,
  item,
}: {
  visible: boolean;
  onClose: () => void;
  onShare?: () => void;
  onToggleLike?: () => void;
  liked?: boolean;
  item: Item;
}) {
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
          <View style={s.imgFrame}>
            <Image
              source={{ uri: item.image || EMPTY_STATE_URL }}
              style={s.img}
            />
          </View>

          {/* title row with share + like */}
          <View style={s.titleRow}>
            <Text style={s.title} numberOfLines={2}>
              {item.title}
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
            <Text style={s.kcalNum}>{item.calories}</Text>
            <Text style={s.kcalUnit}> CALORIES</Text>
          </Text>

          {/* tags */}
          <View style={s.tags}>
            {(item.tags || ['High Protein', 'Low carb', '150 g']).map(t => (
              <View key={t} style={s.tag}>
                <Text style={s.tagTxt}>{t}</Text>
              </View>
            ))}
          </View>

          {/* description */}
          <ScrollView
            contentContainerStyle={{ paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={s.desc}>{item.description || ''}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
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
    ...SHADOW,
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
    marginTop: 12,
  },
  img: { width: '100%', height: 200, borderRadius: 10, resizeMode: 'cover' },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: COLORS.black,
    fontWeight: '800',
    fontSize: 18,
    flex: 1,
    paddingRight: 10,
  },

  kcal: { marginTop: 8 },
  kcalNum: { color: COLORS.green, fontWeight: '800', fontSize: 20 },
  kcalUnit: {
    color: COLORS.sub,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 2,
    fontSize: 11,
  },

  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tag: {
    backgroundColor: COLORS.green,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tagTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },

  desc: { color: COLORS.sub, marginTop: 12, lineHeight: 20 },
});
