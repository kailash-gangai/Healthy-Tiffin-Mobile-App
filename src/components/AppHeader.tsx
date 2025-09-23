import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../ui/theme';
import LeftArrow from '../assets/htf-icon/icon-left-arrow.svg';
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
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <LeftArrow width={24} height={24} />
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
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 1,
    color: COLORS.white,
  },
  right: {
    width: 28, // keeps center balance if no right element
    alignItems: 'center',
    justifyContent: 'center',
  },
});

