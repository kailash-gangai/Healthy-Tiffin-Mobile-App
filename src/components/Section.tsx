import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SHADOW, SPACING } from '../ui/theme';
import ArrowUpIcon from '../assets/newicon/icon-down-arrow.svg';
import ArrowDownIcon from '../assets/newicon/icon-down-arrow.svg';
import Divider from '../assets/newicon/divider.svg';
const COLORS = {
  bg: '#FFFFFF',
  text: '#232323',
  sub: '#9E9E9E',
  green: '#0B5733',
  border: '#F0F0F0',
  mint: '#DFF3EB',
};

export type SectionProps = {
  title: string;
  note?: string;
  collapsed?: boolean;
  children?: React.ReactNode;
  onToggle?: (open: boolean) => void;
  open?: boolean;
  setOpen?: (v: boolean) => void;
};

export default function Section({
  title,
  note,
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
      {/* HEADER */}
      <TouchableOpacity style={s.header} onPress={toggle} activeOpacity={0.8}>
        <Text style={s.title}>{title}:</Text>

        {!!note && (
          <View style={s.notePill}>
            <Text style={s.noteText}>{note}</Text>
          </View>
        )}

        <View style={s.iconBtn}>
          {open ? (
            <ArrowUpIcon width={16} height={16} />
          ) : (
            <ArrowDownIcon style={{ transform: [{ rotate: '180deg' }] }} width={16} height={16} />
          )}
        </View>
      </TouchableOpacity>

      {/* BODY */}
      {open && <View style={s.body}><Divider style={{ marginBottom: 16 }} /><Text>{children}</Text></View>}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    borderRadius: 24,
    marginHorizontal: SPACING,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border, 
    ...SHADOW,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  title: {
    flex: 1,
    fontWeight: '500',
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 20
  },
  notePill: {
    backgroundColor: '#ECECEE',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '300',
    lineHeight: 20,
    letterSpacing: -0.24
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
