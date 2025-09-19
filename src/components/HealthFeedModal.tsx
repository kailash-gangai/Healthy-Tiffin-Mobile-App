// components/HealthFeedModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import { COLORS as C, SHADOW } from '../ui/theme';

export type Feed = {
  id: string;
  title: string;
  author: string;
  date: string;
  image: string;
  video?: string;
  content?: string;
  excerpt: string;
};

export const formatDate = (d: string | number | Date, locale = 'en-US') => {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(dt);
};

const { height } = Dimensions.get('window');
const MAX_MODAL_BODY = Math.round(height * 0.4); // ~60% screen height

export default function HealthFeedModal({
  open,
  onClose,
  onSave,
  onShare,
  onDiscuss,
}: {
  open: Feed | null;
  onClose: () => void;
  onSave?: (f: Feed) => void;
  onShare?: (f: Feed) => void;
  onDiscuss?: (f: Feed) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [sub, setSub] = useState(false);
  const [showMore, setShowMore] = useState(false);
  return (
    <Modal
      visible={!!open}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={s.backdrop}>
        <View style={s.modal}>
          {/* media fixed at top */}
          {open?.video ? (
            <Video
              source={{ uri: open.video }}
              style={s.video}
              controls
              paused={false}
              resizeMode="cover"
            />
          ) : (
            <Image source={{ uri: open?.image || '' }} style={s.video} />
          )}

          {/* scrollable body */}
          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            nestedScrollEnabled
            showsVerticalScrollIndicator={showMore}
            overScrollMode="always"
          >
            <View style={s.meta}>
              <Text style={s.modalTitle}>
                {(open?.title ?? '').length < 40
                  ? open?.title
                  : (open?.title ?? '').slice(0, 40).replace(/\s+\S*$/, '') +
                    '…'}
              </Text>
              <TouchableOpacity
                onPress={() => setSub(v => !v)}
                style={[s.subBtn, sub && s.subOn]}
              >
                <Text style={[s.subTxt, sub && { color: C.white }]}>
                  {sub ? 'SUBSCRIBED' : 'SUBSCRIBE'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={s.stats}>
              <Text style={s.views}>84,212 views</Text>
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <TouchableOpacity
                  onPress={() => setLiked(v => !v)}
                  style={s.iconBtn}
                >
                  <FontAwesome5
                    name="thumbs-up"
                    size={22}
                    color={liked ? C.green : C.black}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={s.iconBtn}>
                  <FontAwesome5
                    iconStyle="solid"
                    name="share"
                    size={22}
                    color={C.black}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.divider} />

            <View style={s.channel}>
              <Image source={require('../assets/LOGO.png')} style={s.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={s.chName}>Healthy Tiffin</Text>
                <View style={s.pillsRow}>
                  <Text style={[s.pill, s.pillGreen]}>
                    {formatDate(open?.date || new Date())}
                  </Text>
                  {!!open?.author && <Text style={s.pill}>{open.author}</Text>}
                  {!!open?.video && <Text style={s.pill}>Video</Text>}
                </View>
              </View>
            </View>

            <View style={s.contentWrap}>
              <Text style={s.contentText} numberOfLines={showMore ? 0 : 6}>
                {open?.content || open?.excerpt || 'No description available.'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowMore(v => !v)}
                style={s.moreBtn}
                activeOpacity={0.8}
              >
                <Text style={s.moreTxt}>
                  {showMore ? 'Show less' : 'Read more'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={s.actionsRow}>
              <TouchableOpacity
                style={s.actionChip}
                onPress={() => open && onSave?.(open)}
              >
                <FontAwesome5 name="bookmark" size={14} color={C.black} />
                <Text style={s.actionTxt}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.actionChip}
                onPress={() => open && onShare?.(open)}
              >
                <FontAwesome5 name="paper-plane" size={14} color={C.black} />
                <Text style={s.actionTxt}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.actionChip}
                onPress={() => open && onDiscuss?.(open)}
              >
                <FontAwesome5 name="comment" size={14} color={C.black} />
                <Text style={s.actionTxt}>Discuss</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* close */}
          <TouchableOpacity
            onPress={onClose}
            style={s.close}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <FontAwesome5
              iconStyle="solid"
              name="times"
              size={18}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    padding: 14,
    width: '100%',
    borderRadius: 18,
    backgroundColor: C.white,
    overflow: 'hidden',
    ...SHADOW,
  },
  video: {
    width: '100%',
    height: 190,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  scroll: { maxHeight: MAX_MODAL_BODY },
  scrollContent: { paddingBottom: 14 },

  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  modalTitle: { flex: 1, fontWeight: '800', color: C.black, fontSize: 18 },
  subBtn: {
    backgroundColor: C.red,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  subOn: { backgroundColor: C.green },
  subTxt: { fontWeight: '800', color: C.white },

  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  views: { color: C.sub },
  iconBtn: { padding: 6 },

  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#888585ff',
    marginVertical: 8,
  },

  channel: { flexDirection: 'row', alignItems: 'center', padding: 4, gap: 10 },
  avatar: { width: 45, height: 45, borderRadius: 12 },
  chName: { fontWeight: '700', color: C.black, fontSize: 22 },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F2F3F5',
    color: C.black,
    fontWeight: '700',
    fontSize: 12,
  },
  pillGreen: { backgroundColor: '#E8F5EE', color: C.green },

  contentWrap: {
    marginTop: 8,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 12,
  },
  contentText: { color: C.black, lineHeight: 20, fontSize: 14 },
  moreBtn: { alignSelf: 'flex-start', marginTop: 8 },
  moreTxt: { color: C.green, fontWeight: '800' },

  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E6E6E6',
  },
  actionTxt: { fontWeight: '700', color: C.black, fontSize: 12 },

  close: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});
