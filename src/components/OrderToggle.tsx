import React, { useEffect, useState } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { COLORS } from '../ui/theme';

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
      <Pressable
        style={[s.half, leftActive ? s.active : s.inactiveLeft]}
        onPress={() => select(0)}
        accessibilityRole="button"
        accessibilityState={{ selected: leftActive }}
      >
        <Text style={[s.text, leftActive ? s.textOn : s.textOff]}>Tiffin</Text>
      </Pressable>

      <View style={s.divider} />

      <Pressable
        style={[s.half, rightActive ? s.active : s.inactiveRight]}
        onPress={() => select(1)}
        accessibilityRole="button"
        accessibilityState={{ selected: rightActive }}
      >
        <Text style={[s.text, rightActive ? s.textOn : s.textRightOff]}>
          A La Carte
        </Text>
        <FontAwesome5
          iconStyle="solid"
          name="globe"
          size={14}
          color={rightActive ? COLORS.white : COLORS.green}
          style={{ marginLeft: 8 }}
        />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    height: 46,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: COLORS.green,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  half: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  active: { backgroundColor: COLORS.green },
  inactiveLeft: { backgroundColor: COLORS.white },
  inactiveRight: { backgroundColor: COLORS.white },
  divider: { width: 1, backgroundColor: COLORS.green },
  text: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  textOn: { color: COLORS.white },
  textOff: { color: COLORS.green },
  textRightOff: { color: COLORS.green },
});
