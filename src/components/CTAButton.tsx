import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';

type Props = {
      label: string;
      onPress: (e: GestureResponderEvent) => void;
      iconName?: string;     // defaults to shopping-bag
      disabled?: boolean;
};

export default function CTAButton({ label, onPress, iconName = 'shopping-bag', disabled }: Props) {
      return (
            <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={onPress}
                  disabled={disabled}
                  style={[s.btn, disabled && s.btnDisabled]}
                  accessibilityRole="button"
            >
                  <Text style={s.txt}>{label}</Text>
                  <FontAwesome5 iconStyle='solid' name={iconName} size={18} color="#000" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
      );
}

const s = StyleSheet.create({
      btn: {
            height: 54,
            borderRadius: 12,
            backgroundColor: '#FFC107',   // mustard like design
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
            elevation: 2,
      },
      btnDisabled: { opacity: 0.5 },
      txt: { fontWeight: '800', color: '#000', fontSize: 16 },
});
