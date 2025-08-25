import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Fontisto } from '@react-native-vector-icons/fontisto';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { COLORS } from '../ui/theme';

export default function OrderToggle() {
      const [idx, setIdx] = React.useState(0);
      const tabs = ['ONE DAY ORDER', 'ONE WEEK ORDER'];
      return (
            <View style={s.wrap}>
                  {tabs.map((t, i) => (
                        <TouchableOpacity key={t} onPress={() => setIdx(i)} style={[s.tab, idx === i && s.on]}>
                              <Text style={[s.text, idx === i && { color: COLORS.white }]}>{t}</Text>
                              {i === 1 && <FontAwesome5 iconStyle='solid' name="chevron-down" size={14} color={idx === i ? COLORS.white : COLORS.text} />}
                        </TouchableOpacity>
                  ))}
            </View>
      );
}

const s = StyleSheet.create({
      wrap: { flexDirection: 'row', gap: 10 },
      tab: { flex: 1, height: 40, borderRadius: 10, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
      on: { backgroundColor: COLORS.green },
      text: { fontWeight: '700', color: COLORS.text, fontSize: 12 },
});
