// screens/NotificationsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { COLORS as C, SPACING } from '../../ui/theme';

type Notice = {
      id: string;
      title: string;
      line1: string;
      body: string;
      time: string;
      icon: any;
};

const DATA: Notice[] = [
      {
            id: '1',
            title: 'Meal Arriving',
            line1: 'Berry Bliss Salad, SIDES',
            body: "Your eagerly awaited meal is on its way! We wanted to keep ensure you're prepared for the deliciousness that's about to grace your doorstep.",
            time: 'Mon, 22:23',
            icon: require('../../assets/LOGO.png'),
      },
      {
            id: '2',
            title: 'Order for Tomorrow',
            line1: 'Berry Bliss Salad, SIDES',
            body: 'We are thrilled to confirm your order for tomorrow, featuring our crisp and refreshing Green Salad.',
            time: 'Mon, 22:23',
            icon: require('../../assets/LOGO.png'),
      },
      {
            id: '6',
            title: 'Subscribe to Premium',
            line1: '',
            body: 'Enjoy additional features that elevate your overall experience.',
            time: 'Mon, 22:23',
            icon: require('../../assets/LOGO.png'),
      },
];

function NotificationItem({ n }: { n: Notice }) {
      const isBadge = String(n.icon).includes('badge'); // only for demo ring
      return (
            <View style={s.item}>
                  <View style={[s.avatarWrap, isBadge && s.badgeRing]}>
                        <Image source={n.icon} style={s.avatar} />
                  </View>

                  <View style={s.content}>
                        <View style={s.rowTop}>
                              <Text style={s.title}>{n.title}</Text>
                              <Text style={s.time}>{n.time}</Text>
                        </View>

                        {!!n.line1 && (
                              <Text style={s.line1}>
                                    {n.line1.replace(', SIDES', '')}
                                    <Text style={s.bold}>, SIDES</Text>
                              </Text>
                        )}
                        <Text style={s.body} numberOfLines={3}>{n.body}</Text>
                  </View>
            </View>
      );
}

export default function NotificationsScreen({ navigation }: any) {
      return (
            <SafeAreaView style={{ flex: 1, backgroundColor: C.white }}>
                  <AppHeader title="Notifications" onBack={() => navigation.goBack()} />
                  <FlatList
                        data={DATA}
                        keyExtractor={i => i.id}
                        contentContainerStyle={{ padding: SPACING * 1.5, paddingBottom: 24 }}
                        ItemSeparatorComponent={() => <View style={{ height: 18 }} />}
                        renderItem={({ item }) => <NotificationItem n={item} />}
                        showsVerticalScrollIndicator={false}
                  />
            </SafeAreaView>
      );
}

const s = StyleSheet.create({
      item: { flexDirection: 'row' },
      avatarWrap: {
            width: 55, height: 55, borderRadius: 22, overflow: 'hidden',
            marginRight: 12, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center',
      },
      badgeRing: { borderWidth: 2, borderColor: C.oranger },
      avatar: { width: '100%', height: '100%', resizeMode: 'cover' },

      content: { flex: 1, justifyContent: 'space-between', paddingVertical: 6 },
      rowTop: { flexDirection: 'row', alignItems: 'center' },
      title: { flex: 1, color: C.black, fontWeight: '800', fontSize: 18 },
      time: { color: C.sub },

      line1: { marginTop: 2, color: C.sub },
      bold: { fontWeight: '800', color: C.black },
      body: { marginTop: 6, color: C.sub, lineHeight: 18 },
});
