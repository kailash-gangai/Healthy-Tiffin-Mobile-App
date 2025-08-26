// screens/SubscriptionScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import AppHeader from '../../components/AppHeader';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../../ui/theme';


const BENEFITS = [
      'Zero delivery charges on all orders',
      'Access to FITNESS Tracker',
      'Workout videos',
      'Special FREE tasting treats for new items',
      'One free 10 minute dietician consultation',
];


type AboutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type Props = { navigation: AboutScreenNavigationProp };
export default function SubscriptionScreen({ navigation }: Props) {
      return (
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>

                  <AppHeader title='Subscription' onBack={() => navigation.goBack()} />

                  <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false}>
                        {/* Plan badge */}
                        <View style={s.badge}>
                              <Text style={s.badgeTxt}>Premium</Text>
                        </View>

                        {/* Price */}
                        <Text style={s.price}>$5</Text>
                        <Text style={s.caption}>one time steel dabba deposit fee</Text>

                        {/* Benefits card */}
                        <View style={s.card}>
                              {BENEFITS.map((b, i) => (
                                    <View key={i} style={s.row}>
                                          <FontAwesome5 name="check-circle" size={22} color={COLORS.green} />
                                          <Text style={s.rowText}>{b}</Text>
                                    </View>
                              ))}
                        </View>

                        {/* Note */}
                        <Text style={s.note}>
                              The one time orders cost <Text style={{ color: COLORS.green, fontWeight: '800' }}>$5</Text> extra flat
                              for delivery and no member access
                        </Text>



                        <View style={{ height: 16 }} />
                  </ScrollView>
                  <View style={s.bottom}>
                        {/* CTA */}
                        <TouchableOpacity style={s.cta} activeOpacity={0.9} onPress={
                              () => navigation.navigate('Checkout')
                        }>
                              <Text style={s.ctaTxt}>Subscribe Premium</Text>
                        </TouchableOpacity>
                  </View>
            </SafeAreaView>
      );
}

const s = StyleSheet.create({
      wrap: { padding: SPACING * 2, alignItems: 'center' },
      badge: {
            backgroundColor: COLORS.badge,
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 10,
            marginTop: 8,
            borderColor: COLORS.black,
            borderWidth: 2,
      },
      badgeTxt: { color: COLORS.black, fontWeight: '800', fontSize: 22 },
      price: { fontSize: 64, fontWeight: '900', color: COLORS.black, marginTop: 10 },
      caption: { color: COLORS.black, marginTop: 4, fontSize: 16, fontWeight: '700' },
      card: {
            width: '100%',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: COLORS.border,
            padding: 14,
            marginTop: 18,
            backgroundColor: COLORS.white,
      },
      row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 8 },
      rowText: { flex: 1, color: COLORS.black, fontSize: 18 },
      note: {
            textAlign: 'center',
            color: COLORS.black,
            marginTop: 16,
            paddingHorizontal: 8,
            lineHeight: 22,
            fontSize: 16,
      },
      bottom: { padding: SPACING, backgroundColor: COLORS.white, marginBottom: 22 },
      cta: {
            width: '100%',
            height: 52,
            backgroundColor: COLORS.green,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',

      },
      ctaTxt: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
});
