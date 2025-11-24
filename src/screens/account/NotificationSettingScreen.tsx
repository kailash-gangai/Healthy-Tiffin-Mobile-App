// screens/NotificationSettings.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS as C, RADIUS } from '../../ui/theme';
import AppHeader from '../../components/AppHeader';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Row = { key: string; label: string; value: boolean };
type AboutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type Props = { navigation: AboutScreenNavigationProp };
function ToggleRow({
      label, value, onValueChange,
}: { label: string; value: boolean; onValueChange: (v: boolean) => void }) {
      const [on, setOn] = useState(false);

      return (
            <View style={s.row}>
                  <Text style={s.rowLabel}>{label}</Text>
                  <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setOn(!on)}
                        style={[s.track, on && s.trackOn]}
                  >
                        <View style={[s.thumb, on && { alignSelf: 'flex-end' }]} />
                  </TouchableOpacity>
            </View>
      );
}

export default function NotificationSettings({ navigation }: Props) {
      const [items, setItems] = React.useState<Row[]>([
            { key: 'progress', label: 'Progress', value: false },
            { key: 'new', label: 'New Items On Menu', value: true },
            { key: 'offers', label: 'Offers', value: true },
            { key: 'delivery', label: 'Delivery Notifications', value: true },
      ]);

      const setAt = (k: string, v: boolean) =>
            setItems(prev => prev.map(it => (it.key === k ? { ...it, value: v } : it)));

      return (
            <SafeAreaView style={{ flex: 1, backgroundColor: C.white }}>
                 

                  <AppHeader title="Notification Settings" onBack={() => navigation.goBack()} />
                  <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false}>
                        {items.map(it => (
                              <View key={it.key} style={s.card}>
                                    <ToggleRow
                                          label={it.label}
                                          value={it.value}
                                          onValueChange={v => setAt(it.key, v)}
                                    />
                              </View>
                        ))}
                  </ScrollView>
            </SafeAreaView>
      );
}

const s = StyleSheet.create({
      wrap: { padding: 12, paddingBottom: 20 },
      card: {
            backgroundColor: C.gray,
            borderRadius: RADIUS,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginBottom: 10,
      },
      row: {
            height: 44,
            borderRadius: 10,
            paddingHorizontal: 12,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
      },
      rowLabel: { color: C.black, fontSize: 22, fontWeight: '400' },
      track: {
            width: 54,
            height: 35,
            borderRadius: 14,
            backgroundColor: '#D9D9D9',
            padding: 3,
            justifyContent: 'center',
      },
      trackOn: {
            backgroundColor: '#F6A300',
      },
      thumb: {
            width: 25,
            height: 25,
            borderRadius: 14,
            backgroundColor: '#FFF',
      },
});
