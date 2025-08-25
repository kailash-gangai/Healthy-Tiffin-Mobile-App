import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Fontisto } from '@react-native-vector-icons/fontisto';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { COLORS } from '../ui/theme';

export default function CTAButton({ label, icon, onPress }: { label: string; icon?: string; onPress: () => void }) {
      return (
            <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
                  <LinearGradient colors={['#FFC107', '#FFC107']} style={s.btn}>
                        <Text style={s.txt}>{label}</Text>
                        {icon && <FontAwesome5 iconStyle='solid' name={icon} size={18} color="#000" />}
                  </LinearGradient>
            </TouchableOpacity>
      );
}

const s = StyleSheet.create({
      btn: { height: 50, borderRadius: 12, backgroundColor: '#FFC107', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
      txt: { fontWeight: '800', color: '#000' },
});
