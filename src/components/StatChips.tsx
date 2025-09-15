import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SHADOW, RADIUS, SPACING } from '../ui/theme';
import { Use } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../screens/navigation/types';
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';
const width = Dimensions.get('window').width;
const DIAMETER = width / 5 - 10;
const items =
      [
            { value: '70', unit: 'kg', type: 'Weight', bgColor: '#DDE3F6', color: '#3B49DF', navigate: 'WeightTracker' },
            { value: '120', unit: '', type: 'Steps', bgColor: '#DDEEE2', color: '#0B5733', navigate: 'StepsTracker' },
            { value: '10', unit: 'hrs', type: 'Sleep', bgColor: '#EDE7FB', color: '#6A4CDB', navigate: 'SleepTracker' },
            { value: '8', unit: 'Glasses', type: 'Water', bgColor: '#EAF3FB', color: '#0B73B3', navigate: 'WaterTracker' },
            { value: '60', unit: 'Cal', type: 'Calories', bgColor: '#FDF1D9', color: '#D27C00', navigate: 'CaloriesTracker' },
      ];
export default function StatsCard() {
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
      return (
            < View style={s.cardWrap} >
                  <View style={s.card}>
                        <View style={s.rowStats}>
                              {items.map((it, i) => (
                                    <TouchableOpacity key={i} activeOpacity={0.8}
                                          onPress={() => navigation.navigate(it.navigate)}
                                    >
                                          <View key={i} style={[s.pill, s.circle, { backgroundColor: it.bgColor, }]}>
                                                <Text style={s.value}>
                                                      <Text style={[s.value, { color: it.color }]}> {it.value}</Text>
                                                      {it.unit ? <Text style={[s.unit, { color: it.color }]}> {it.unit}</Text> : null}
                                                </Text>
                                                <Text style={s.label}>{it.type}</Text>
                                          </View>
                                    </TouchableOpacity>
                              ))}
                        </View>
                  </View>
            </View >
      );
}

const s = StyleSheet.create({
      cardWrap: {
            backgroundColor: COLORS.white,
            alignItems: 'center',
            marginTop: -20,
            borderTopLeftRadius: RADIUS,
            borderTopRightRadius: RADIUS,

      },
      card: {
            marginVertical: 26,
            backgroundColor: COLORS.white,
            borderRadius: 20,
            paddingVertical: 12,
            paddingHorizontal: 8,
            ...SHADOW,
      },
      rowStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'space-around' },
      pill: { alignItems: 'center', justifyContent: 'center', },
      value: { fontWeight: '800', fontSize: 16, },
      unit: { fontSize: 12 },
      label: { fontSize: 14, color: '#000', fontWeight: '800' },
      circle: {
            width: DIAMETER,
            height: DIAMETER,
            borderRadius: DIAMETER / 2,
            alignItems: 'center',
            justifyContent: 'center',
      },

});
