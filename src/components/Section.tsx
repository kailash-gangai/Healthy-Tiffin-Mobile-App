import React, { useImperativeHandle } from 'react';

import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { SHADOW } from '../ui/theme';
import PlusIcon from '../assets/htf-icon/icon-add.svg';
import MinusIcon from '../assets/htf-icon/icon-remove.svg';

const COLORS = {
  bg: '#FFFFFF',
  card: '#FFFFFF',
  text: '#232323',
  sub: '#8E8E8E',
  green: '#0B5733',
  divider: '#EEEEEE',
  shadow: 'rgba(0,0,0,0.08)',
};

export type SectionProps = {
  title: string;
  note?: string;
  hero: any;
  collapsed?: boolean;
  children?: React.ReactNode;
  onToggle?: (open: boolean) => void;

  // new (controlled)
  open?: boolean;
  setOpen?: (v: boolean) => void;
};

export default function Section({
  title,
  note,
  hero,
  collapsed = true,
  children,
  onToggle,
  open: controlledOpen,
  setOpen: setControlledOpen,
}: SectionProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(!collapsed);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? setControlledOpen! : setUncontrolledOpen;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    onToggle?.(next);
  };

  return (
    <View style={s.wrap}>
      <TouchableOpacity style={s.header} onPress={toggle} activeOpacity={0.8}>
        <Image source={hero} style={s.hero} />
        <View style={{ flex: 1 }}>
          <View style={s.titleRow}>
            <View style={s.dot} />
            <Text style={s.title}>{title}</Text>
          </View>
          {!!note && <Text style={s.note}>{note}</Text>}
        </View>
        <TouchableOpacity onPress={toggle} style={s.addBtn} activeOpacity={0.8}>
          {open ? (
            <MinusIcon width={24} height={24} />
          ) : (
            <PlusIcon width={24} height={24} />
          )}
        </TouchableOpacity>
      </TouchableOpacity>

      {open && <View style={s.body}>{children}</View>}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginVertical: 14,
    borderColor: COLORS.green,
    marginHorizontal: 16,
    ...SHADOW,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
  },
  hero: {
    width: 90,
    height: 80,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#17A34A' },
  title: { fontWeight: '800', color: COLORS.text },
  note: { marginTop: 6, color: COLORS.sub },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  body: { paddingBottom: 12 },
});
