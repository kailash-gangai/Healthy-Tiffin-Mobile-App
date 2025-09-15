import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { COLORS } from '../ui/theme';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../screens/navigation/types';

type Props = {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode; // optional right-side content (icon, button, etc.)
};

export default function AppHeader({ title, onBack, right }: Props) {

  return (
    <View style={s.topbar}>
      <TouchableOpacity
        onPress={onBack}
        style={s.back}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <FontAwesome5
          iconStyle="solid"
          name="chevron-left"
          size={18}
          color='#fff'
        />
      </TouchableOpacity>

      <View style={s.titleWrapper}>
        <Text style={s.title}>{title}</Text>
      </View>
      {/* optional right side to balance spacing */}
      <View style={s.right}>{right}</View>
    </View>

  );
}

const s = StyleSheet.create({
  topbar: {
    height: 48,
    backgroundColor: COLORS.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  back: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.overlay,
    borderRadius: 14,
    opacity: 0.6,
  },
  titleWrapper: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontWeight: '800',
    fontSize: 22,
    letterSpacing: 2,
    color: COLORS.white,
  },
  right: {
    width: 28, // keeps center balance if no right element
    alignItems: 'center',
    justifyContent: 'center',
  },
});

