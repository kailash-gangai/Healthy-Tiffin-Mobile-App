import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
type Metric = {
      id: string;
      label: string;          // Steps, Sleep, Calories, Water
      value: string;          // 1215623, 6 H 36 M, 12532, 8 Glasses
      tint: string;           // row background tint
      color: string;          // value color
      image: string;           // MDI icon name
};

const SHADOW = {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
};

export default function HealthMetrics({
      items = [
            { id: 'steps', label: 'Steps', value: '1215623', tint: '#E8F2EB', color: '#1E8E5A', image: require('../assets/icons/running.png') },
            { id: 'sleep', label: 'Sleep', value: '6 H 36 M', tint: '#F0E7FA', color: '#7B57C5', image: require('../assets/icons/moon.webp') },
            { id: 'cal', label: 'Calories', value: '12532', tint: '#FDF2E3', color: '#F4A300', image: require('../assets/icons/fire.png') },
            { id: 'water', label: 'Water', value: '8 Glasses', tint: '#EAF3FB', color: '#2C85D8', image: require('../assets/icons/water-drops.png') },
      ],
}: { items?: Metric[] }) {
      return (
            <View style={{ gap: 12 }}>
                  {items.map(m => (
                        <View key={m.id} style={s.card}>
                              <View style={[s.row, { backgroundColor: m.tint }]}>
                                    {/* <FontAwesome5 iconStyle="solid" name={m.icon} size={46} color={m.color} /> */}
                                    <Image source={m.image} style={{ width: 46, height: 46 }} />
                                    <Text style={[s.value, { color: m.color }]} numberOfLines={1}>
                                          {m.value}
                                    </Text>
                                    <Text style={s.label} numberOfLines={1}>
                                          {m.label}
                                    </Text>
                              </View>
                        </View>
                  ))}
            </View>
      );
}

const s = StyleSheet.create({
      card: {
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 14,
            ...SHADOW,
      },
      row: {
            height: 84,
            borderRadius: 12,
            paddingHorizontal: 18,
            alignItems: 'center',
            flexDirection: 'row',
            gap: 16,
            flex: 1,


      },
      value: {
            fontSize: 20,
            flex: 1,
            fontWeight: '800',
      },
      label: {
            fontSize: 22,
            fontWeight: '800',
            color: '#232323',
      },
});
