import React, { useEffect, useState } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; // gradient background
import { COLORS, SPACING } from '../ui/theme';
import PlusIcon from '../assets/newicon/icon-plus.svg';
type Props = { index?: 0 | 1; onChange?: (i: 0 | 1) => void };

export default function OrderToggle({ index = 0, onChange }: Props) {
  const [idx, setIdx] = useState<0 | 1>(index);

  useEffect(() => setIdx(index), [index]);

  const select = (i: 0 | 1) => {
    if (i === idx) return;
    setIdx(i);
    onChange?.(i);
  };

  const leftActive = idx === 0;
  const rightActive = idx === 1;

  return (
    <View style={s.container}>
      {/* Left Option */}
      <Pressable
        style={s.option}
        onPress={() => select(0)}
        accessibilityRole="button"
        accessibilityState={{ selected: leftActive }}
      >
        {leftActive ? (
          <LinearGradient
            colors={['#f2c113', '#e2b517']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[s.gradient, { borderRadius: 8 }]}
          >
            <Text style={[s.text, s.textOn]}>Tiffin $29 +</Text>
          </LinearGradient>
        ) : (
          <View style={[s.inactive, { borderRadius: 8 }]}>
            <Text style={[s.text, s.textOff]}>Tiffin $29 +</Text>
          </View>
        )}
      </Pressable>

      {/* Right Option */}
      <Pressable
        style={s.option}
        onPress={() => select(1)}
        accessibilityRole="button"
        accessibilityState={{ selected: rightActive }}
      >
        {rightActive ? (
          <LinearGradient
            colors={['#f2c113', '#e2b517']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[s.gradient, { borderRadius: 8 }]}
          >
            <Text style={[s.text, s.textOn]}>A La Carte</Text>
          </LinearGradient>
        ) : (
          <View style={[s.inactive, { borderRadius: 8 }]}>
            <Text style={[s.text, s.textOff]}>A La Carte</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginHorizontal: SPACING,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    height: 38,
    padding: 2,
    overflow: 'hidden',

  },
  option: {
    flex: 1,
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactive: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 20,
    fontFamily: 'Poppins',
    letterSpacing: 0.24,
  },
  textOn: {
    color: '#FFFFFF',
  },
  textOff: {
    color: '#B4B4B4',
  },
});
