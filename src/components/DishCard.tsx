import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import DishDetailModal from './DishDetailModal';

type Dish = {
      id: string;
      title: string;
      image: any;              // require(...)
      description?: string;    // shown in modal
      calories?: number;       // optional extra
      enabled?: boolean;
      selected?: boolean;
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

export default function DishCard({ item, onChange }: { item: Dish; onChange?: (d: Dish) => void }) {
      const [checked, setChecked] = React.useState(!!item.selected);
      const [liked, setLiked] = React.useState(!!item.liked);
      const [open, setOpen] = React.useState(false);
      const enabled = item.enabled !== false;
      const active = enabled && checked;

      const toggle = () => {
            if (!enabled) return;
            const next = !checked;
            setChecked(next);
            onChange?.({ ...item, selected: next, liked });
      };

      const toggleLike = () => {
            if (!enabled) return;
            const next = !liked;
            setLiked(next);
            onChange?.({ ...item, selected: checked, liked: next });
      };

      return (
            <>
                  {/* Row: tap anywhere (except icons) to open modal */}
                  <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setOpen(true)}
                        style={[s.row, active && { backgroundColor: COLORS.rowBg }]}
                        disabled={!enabled}
                  >
                        <TouchableOpacity
                              onPress={toggle}
                              disabled={!enabled}
                              style={[s.checkbox, active && s.checkboxOn, !enabled && { opacity: 0.35 }]}
                              activeOpacity={0.85}
                        >
                              {active ? <FontAwesome5 iconStyle='solid' name="check" size={12} color="#fff" /> : null}
                        </TouchableOpacity>

                        <Image source={item.image} style={[s.thumb, !enabled && { opacity: 0.35 }]} />

                        <Text style={[s.title, !enabled && s.titleDim]} numberOfLines={1}>
                              {item.title}
                        </Text>

                        <TouchableOpacity
                              onPress={toggleLike}
                              disabled={!enabled}
                              style={[s.heartWrap, !enabled && { opacity: 0.35 }]}
                              activeOpacity={0.85}
                        >
                              <FontAwesome5 iconStyle='solid' name="heart" size={18} color={COLORS.accent} />
                        </TouchableOpacity>
                  </TouchableOpacity>

                  {/* Modal */}
                  <DishDetailModal
                        visible={open}
                        onClose={() => setOpen(false)}
                        onShare={() => { }}
                        onToggleLike={() => { }}
                        liked={true}
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
      checkbox: {
            width: 20, height: 20, borderRadius: 4,
            borderWidth: 1.4, borderColor: '#C7D0C9',
            alignItems: 'center', justifyContent: 'center',
            marginRight: 10, backgroundColor: COLORS.white,
      },
      checkboxOn: { backgroundColor: COLORS.green, borderColor: COLORS.green },
      thumb: { width: 44, height: 44, borderRadius: 8, marginRight: 10, resizeMode: 'cover' },
      title: { flex: 1, fontWeight: '700', color: COLORS.text },
      titleDim: { color: '#BDBDBD' },
      heartWrap: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },

      // modal
      backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.backdrop },
      sheet: {
            position: 'absolute',
            left: 0, right: 0, bottom: 0,
            borderTopLeftRadius: 18, borderTopRightRadius: 18,
            backgroundColor: COLORS.white,
      },
      grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: '#DDD', marginTop: 8, marginBottom: 6 },
      header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.divider },
      modalImg: { width: 54, height: 54, borderRadius: 10 },
      modalTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
      kcal: { marginTop: 2, color: COLORS.sub },
      closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

      sectionHd: { fontWeight: '800', color: COLORS.text, marginTop: 12, marginBottom: 6 },
      desc: { color: COLORS.text, lineHeight: 20 },

      actions: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.divider },
      actBtn: { flex: 1, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
      primary: { backgroundColor: COLORS.green },
      secondary: { backgroundColor: '#F4F4F4' },
      actTxt: { color: COLORS.white, fontWeight: '800' },
});
