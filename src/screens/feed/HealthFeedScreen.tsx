import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import { COLORS as C, SHADOW2 } from '../../ui/theme';
import HealthFeedModal, {
  Feed,
  formatDate,
} from '../../components/HealthFeedModal';

const { width } = Dimensions.get('window');
const CARD_W = width - 32;

export default function HealthFeedScreen({ route, navigation }: any) {
  const { items }: { items: Feed[] } = route.params;
  const [open, setOpen] = useState<Feed | null>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.white }}>
      <AppHeader title="Health Feed" onBack={() => navigation.goBack()} />

      <FlatList
        data={items}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setOpen(item)}
            style={[s.card, SHADOW2]}
          >
            {/* Media banner with gradient overlay */}
            <View style={s.media}>
              <Image source={{ uri: item.image }} style={s.mediaImg} />
              <View style={s.gradient} />
              <View style={s.badges}>
                <Text style={s.badge}>{formatDate(item.date)}</Text>
                {!!item.video && (
                  <View style={s.badgeRow}>
                    <FontAwesome5
                      iconStyle="solid"
                      name="video"
                      size={12}
                      color="#fff"
                    />
                    <Text style={s.badgeTxt}>Video</Text>
                  </View>
                )}
              </View>
              {!!item.video && (
                <View style={s.playFab}>
                  <FontAwesome5
                    iconStyle="solid"
                    name="play"
                    size={16}
                    color="#000"
                  />
                </View>
              )}
            </View>

            {/* Text block */}
            <View style={s.body}>
              <Text style={s.title} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={s.metaRow}>
                <Image
                  source={require('../../assets/LOGO.png')}
                  style={s.avatar}
                />
                <Text style={s.author} numberOfLines={1}>
                  {item.author}
                </Text>
              </View>
              <Text style={s.excerpt} numberOfLines={3}>
                {item.excerpt}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <HealthFeedModal open={open} onClose={() => setOpen(null)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  card: {
    width: CARD_W,
    borderRadius: 16,
    backgroundColor: C.white,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  media: { width: '100%', height: 180, position: 'relative' },
  mediaImg: { width: '100%', height: '100%' },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  badges: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: '800',
    fontSize: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeTxt: { color: '#fff', fontWeight: '800', fontSize: 12 },

  playFab: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: { padding: 12 },
  title: { color: C.black, fontWeight: '800', fontSize: 18 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 6,
  },
  avatar: { width: 22, height: 22, borderRadius: 11 },
  author: { color: C.black, fontWeight: '700' },
  excerpt: { color: C.black, lineHeight: 20, fontSize: 14 },
});
