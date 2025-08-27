// screens/HealthFeedScreen.tsx
import React, { useState } from 'react';
import {
      View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import Video from 'react-native-video';
import { COLORS as C, SHADOW, SHADOW2 } from '../../ui/theme';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
// const C = { green: '#0B5733', white: '#FFF', text: '#232323', sub: '#7B7B7B', chip: '#F2F3F5', yellow: '#F6A300', shadow: 'rgba(0,0,0,0.12)' };

type Feed = {
      id: string; title: string; author: string; date: string;
      thumb: any; video?: string; // mp4 uri
      excerpt: string;
};

const DATA: Feed[] = [
      {
            id: '1',
            title: 'Minimalist Baker',
            author: 'Adam Smith',
            date: '10 Dec 2023',
            thumb: require('../../assets/banners/chana.jpg'),
            video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            excerpt:
                  'simple recipes with 10 ingredients or less, one bowl, or 30 minutes or less to prepare.',
      },
      {
            id: '2',
            title: 'Minimalist Baker',
            author: 'Adam Smith',
            date: '10 Dec 2023',
            thumb: require('../../assets/banners/chana.jpg'),
            video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            excerpt:
                  'simple recipes with 10 ingredients or less, one bowl, or 30 minutes or less to prepare.',
      },
      // add more …
];

export default function HealthFeedScreen({ navigation }: any) {
      const [open, setOpen] = useState<Feed | null>(null);
      const [liked, setLiked] = useState(false);
      const [sub, setSub] = useState(false);

      return (
            <SafeAreaView style={{ flex: 1, backgroundColor: C.white }}>
                  <AppHeader title="Health Feed" onBack={() => navigation.goBack()} />

                  <FlatList
                        data={DATA}
                        keyExtractor={i => i.id}
                        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
                        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                        renderItem={({ item }) => (
                              <TouchableOpacity activeOpacity={0.9} onPress={() => setOpen(item)} style={s.card}>
                                    <View style={s.thumbWrap}>
                                          <Image source={item.thumb} style={s.thumb} />
                                          <View style={s.playBtn}><FontAwesome5 iconStyle='solid' name="play" size={18} color={C.white} /></View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                          <Text style={s.title}>{item.title}</Text>
                                          <View style={s.authorBadge}><Text style={s.author}>{item.author}</Text></View>
                                          <Text numberOfLines={3} style={s.excerpt}>{item.excerpt}</Text>
                                          <Text style={s.date}>{item.date}</Text>
                                    </View>
                              </TouchableOpacity>
                        )}
                        showsVerticalScrollIndicator={false}
                  />

                  {/* Video modal */}
                  <Modal visible={!!open} animationType="fade" transparent onRequestClose={() => setOpen(null)}>
                        <View style={s.backdrop}>
                              <View style={s.modal}>
                                    {/* video area */}
                                    {open?.video ? (
                                          <Video
                                                source={{ uri: open.video }}
                                                style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 12 }}
                                                controls
                                                paused={false}
                                                resizeMode="cover"

                                          />
                                    ) : (
                                          <Image source={open?.thumb as any} style={s.video} />
                                    )}

                                    {/* title + channel row */}
                                    <View style={s.meta}>
                                          <Text style={s.modalTitle}>{open?.title}</Text>
                                          <TouchableOpacity onPress={() => setSub(v => !v)} style={[s.subBtn, sub && s.subOn]}>
                                                <Text style={[s.subTxt, sub && { color: C.white }]}>{sub ? 'SUBSCRIBED' : 'SUBSCRIBE'}</Text>
                                          </TouchableOpacity>
                                    </View>

                                    {/* stats row */}
                                    <View style={s.stats}>
                                          <Text style={s.views}>84,212  views</Text>
                                          <View style={{ flexDirection: 'row', gap: 14 }}>
                                                <TouchableOpacity onPress={() => setLiked(v => !v)} style={s.iconBtn}>
                                                      <FontAwesome5 name="thumbs-up" size={22} color={liked ? C.green : C.black} />
                                                </TouchableOpacity>
                                                {/* <TouchableOpacity style={s.iconBtn}>
                                                      <FontAwesome5 name="comment" size={22} color={C.black} />
                                                </TouchableOpacity> */}
                                                <TouchableOpacity style={s.iconBtn}>
                                                      <FontAwesome5 iconStyle='solid' name="share" size={22} color={C.black} />
                                                </TouchableOpacity>
                                          </View>
                                    </View>
                                    <View style={s.divider} />
                                    {/* channel row */}
                                    <View style={s.channel}>
                                          <View>
                                                <Image source={require('../../assets/LOGO.png')} style={{ width: 45, height: 45 }} />
                                          </View>
                                          <Text style={s.chName}>Healthy Tiffin</Text>
                                    </View>

                                    <TouchableOpacity style={s.close} onPress={() => setOpen(null)}>
                                          <FontAwesome5 iconStyle='solid' name="times" size={16} color={C.white} />
                                    </TouchableOpacity>
                              </View>
                        </View>
                  </Modal>
            </SafeAreaView>
      );
}

/* styles */
const s = StyleSheet.create({
      card: {
            flexDirection: 'row', gap: 12,
            backgroundColor: C.white, borderRadius: 16, padding: 12,
            ...SHADOW2
      },
      thumbWrap: { width: 120, height: 120, borderRadius: 12, overflow: 'hidden' },
      thumb: { width: '100%', height: '100%' },
      playBtn: {
            position: 'absolute', top: '50%', left: '50%', marginTop: -16, marginLeft: -16,
            width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.6)',
            alignItems: 'center', justifyContent: 'center',
      },
      title: { color: C.black, fontWeight: '800', fontSize: 18 },
      authorBadge: { alignSelf: 'flex-start', backgroundColor: C.oranger, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginTop: 4 },
      author: { fontWeight: '800', color: C.black, fontSize: 14 },
      excerpt: { color: C.black, marginTop: 6, lineHeight: 18, fontSize: 14, fontWeight: '400' },
      date: { color: C.sub, marginTop: 6, fontSize: 12 },

      /* modal */
      backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 16 },
      modal: {
            padding: 14,
            width: '100%', borderRadius: 16, backgroundColor: C.white,
            ...SHADOW
      },
      video: { width: '100%', height: 190, backgroundColor: '#000' },

      meta: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 10 },
      modalTitle: { flex: 1, fontWeight: '800', color: C.black, fontSize: 18 },
      subBtn: { backgroundColor: C.red, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
      subOn: { backgroundColor: C.green },
      subTxt: { fontWeight: '800', color: C.white },

      stats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingTop: 8 },
      views: { color: C.sub },
      iconBtn: { padding: 6 },

      channel: { flexDirection: 'row', alignItems: 'center', padding: 4, gap: 10 },
      chName: { fontWeight: '700', color: C.black, fontSize: 22 },
      divider: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: '#888585ff',
            marginVertical: 8
      },
      close: {

            position: 'absolute',
            top: -14,
            right: 12,
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: C.green,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 12,
            borderColor: '#fff',
            borderWidth: 2,
      },
});
