import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { COLORS as C } from '../ui/theme';

type Props = {
      label: string;
      icon: string;       // Feather icon name
      onPress?: () => void;
};

export default function LinkRow({ label, icon, onPress }: Props) {
      return (
            <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={s.row}>
                  <FontAwesome5 iconStyle='solid' name={icon} size={28} color={C.oranger} style={{ marginRight: 12 }} />
                  <Text style={s.label}>{label}</Text>
            </TouchableOpacity>
      );
}

const s = StyleSheet.create({
      row: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: C.divider,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 16,
            marginBottom: 12,
      },
      label: { fontSize: 22, fontWeight: '600', color: C.black, marginLeft: 12 },
});
