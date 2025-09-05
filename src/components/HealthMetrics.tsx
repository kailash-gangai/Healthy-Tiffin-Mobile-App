import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../screens/navigation/types';
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
export default function HealthMetrics({ items = [] }: { items?: Metric[] }) {
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
      const onPress = (nav: string) => {
            navigation.navigate(nav);
      };
      return (
            <View style={{ gap: 12 }}>
                  {items.map(m => (
                        <TouchableOpacity activeOpacity={0.85} key={m.id} onPress={() => onPress(m.navigate)}>
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
                        </TouchableOpacity>
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
