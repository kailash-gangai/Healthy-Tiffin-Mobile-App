import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import ArrowLeftIcon from '../assets/htf-icon/icon-left.svg';
import ArrowRightIcon from '../assets/htf-icon/icon-right.svg';
import { COLORS, SHADOW, SPACING } from '../ui/theme';

const ITEM_W = 60;

export default function DayTabs({ days, onChange }: { days: string[]; onChange?: (i: number) => void }) {
  const listRef = useRef<FlatList<string>>(null);
  const WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const filteredDays = useMemo(
    () => days.filter(d => !['saturday', 'sunday'].includes(d.toLowerCase())),
    [days]
  );

  const todayIdx = useMemo(() => {
    const js = new Date().getDay();
    const i = filteredDays.map(d => d.toLowerCase()).indexOf(WEEK[js]);
    return i >= 0 ? i : 0;
  }, [filteredDays]);

  const [active, setActive] = useState(todayIdx);

  const dateForDayName = (name: string) => {
    const idx = WEEK.indexOf(name.toLowerCase());
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: d.toLocaleString('en-US', { month: 'long' }),
    };
  };

  const weekRangeLabel = useMemo(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'long' })}`;
    return `${fmt(monday)} - ${fmt(sunday)} ${monday.getFullYear()}`;
  }, []);

  useEffect(() => {
    listRef.current?.scrollToIndex({ index: todayIdx, viewPosition: 0.5, animated: true });
    onChange?.(todayIdx);
  }, [todayIdx, onChange]);

  const select = (i: number) => {
    if (i < 0 || i >= filteredDays.length) return;
    setActive(i);
    onChange?.(i);
    listRef.current?.scrollToIndex({ index: i, viewPosition: 0.4, animated: true });
  };

  const renderItem = ({ item, index }: { item: string; index: number }) => {
    const isActive = index === active;
    const { day } = dateForDayName(item);
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => select(index)} style={s.dayItem}>
        <Text style={[s.dayName, isActive && s.activeDayName]}>
          {item.slice(0, 3).toUpperCase()}
        </Text>
        <View style={[s.dateBox, isActive ? s.dateBoxActive : s.dateBoxInactive]}>
          <Text style={[s.dateText, isActive && s.dateTextActive]}>{day}</Text>
          <View style={s.dot} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.wrapper}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => select(active - 1)} disabled={active === 0}>
          <View style={[s.iconWrap, active === 0 && { opacity: 0.3 }]}>
            <ArrowLeftIcon width={16} height={16} />
          </View>
        </TouchableOpacity>

        <Text style={s.rangeText}>{weekRangeLabel}</Text>

        <TouchableOpacity onPress={() => select(active + 1)} disabled={active === filteredDays.length - 1}>
          <View style={[s.iconWrap, active === filteredDays.length - 1 && { opacity: 0.3 }]}>
            <ArrowRightIcon width={16} height={16} />
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        horizontal
        data={filteredDays}
        renderItem={renderItem}
        keyExtractor={(d, i) => `${d}-${i}`}
        getItemLayout={(_, i) => ({ length: ITEM_W, offset: ITEM_W * i, index: i })}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.listContainer}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    marginHorizontal: SPACING,
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    ...SHADOW,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 14,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#d7f3e7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeText: { fontSize: 14, fontWeight: '500', color: '#333' },
  listContainer: { justifyContent: 'center', gap:20, width: '100%' },
  dayItem: {  alignItems: 'center' },
  dayName: { fontSize: 11, fontWeight: '600', color: '#000', marginBottom: 6 },
  activeDayName: { color: '#8A8A8A' },
  dateBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dateBoxActive: { backgroundColor: '#FFCA40' },
  dateBoxInactive: {},
  dateText: { fontSize: 15, fontWeight: '700', color: '#000' },
  dateTextActive: { color: '#fff' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#ffff', position: 'absolute', bottom: 6 },
});
