import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { COLORS } from '../ui/theme';

type Props = {
      title: string;
      onBack?: () => void;
      right?: React.ReactNode; // optional right-side content (icon, button, etc.)
};

export default function AppHeader({ title, onBack, right }: Props) {
      return (
            <View style={s.topbar}>
                  {/* Back button */}
                  <TouchableOpacity
                        onPress={onBack}
                        style={s.back}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                        <FontAwesome5 iconStyle='solid' name="chevron-left" size={18} color={COLORS.white} />
                  </TouchableOpacity>

                  {/* Title */}
                  <Text style={s.title}>{title}</Text>

            </View>
      );
}

const s = StyleSheet.create({
      topbar: {
            height: 48,
            backgroundColor: COLORS.green,
            flexDirection: 'row',
            alignItems: 'center',
            // justifyContent: 'space-between',
            paddingHorizontal: 12,
      },
      back: {
            width: 28,
            height: 28,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.overlay,
            borderRadius: 14,
            padding: 4,
            opacity: 0.6
      },
      title: {
            flex: 1,
            textAlign: 'center',
            fontWeight: '800',
            fontSize: 22,
            letterSpacing: 2,
            color: COLORS.white,
      },
      right: {
            width: 28,
            alignItems: 'center',
            justifyContent: 'center',
      },
});
