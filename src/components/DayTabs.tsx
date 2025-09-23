import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';

import { COLORS } from '../ui/theme';
import ArrowLeftIcon from '../assets/htf-icon/icon-left.svg';
import ArrowRightIcon from '../assets/htf-icon/icon-right.svg';

type Props = {
  days: string[]; // e.g. ['Thursday','Friday','Saturday','Sunday']
  onChange?: (i: number) => void; // index in this filtered list
};

const ITEM_W = 200;

export default function DayTabs({ days, onChange }: Props) {
  const listRef = useRef<FlatList<string>>(null);
  const WEEK = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  // today within the PROVIDED list: if today exists, pick it, else fall back to 0
  const todayIdx = useMemo(() => {
    const js = new Date().getDay(); // 0=Sun
    const i = days.map(d => d.toLowerCase()).indexOf(WEEK[js]);
    return i >= 0 ? i : 0;
  }, [days]);

  const [active, setActive] = useState(todayIdx);

  const dateForDayName = (name: string) => {
    const idx = WEEK.indexOf(name.toLowerCase());
    const now = new Date();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay()); // start of this week
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + (idx >= 0 ? idx : 0));
    const m = d.toLocaleString('en-US', { month: 'short' });
    return `${d.getDate()} ${m}`;
  };

  useEffect(() => {
    // center initial
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index: todayIdx,
        viewPosition: 0.5,
        animated: true,
      });
    });
    onChange?.(todayIdx);
  }, [todayIdx, onChange]);

  const select = (i: number) => {
    setActive(i);
    onChange?.(i);
    listRef.current?.scrollToIndex({
      index: i,
      viewPosition: 0.4,
      animated: true,
    });
  };

  const renderItem = ({ item, index }: { item: string; index: number }) => {
    const isActive = index === active;
    if (!isActive) {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => select(index)}
          style={s.dimItem}
        >
          <Text style={s.dimText}>{item}</Text>
        </TouchableOpacity>
      );
    }
    return (
      <View style={s.activeWrap}>
        <Text style={s.badge}>{index === todayIdx ? 'TODAY' : ''}</Text>
        {/* No past days in the list, so left chevron disables at 0 */}
        <TouchableOpacity
          style={[s.chev, { left: 12 }]}
          onPress={() => select(Math.max(0, index - 1))}
          disabled={index === 0}
        >
          <ArrowLeftIcon width={24} height={24} />
        </TouchableOpacity>

        <View
          style={{
            alignItems: 'center',
          }}
        >
          <Text style={s.day}>{item}</Text>
          <Text style={s.date}>{dateForDayName(item)}</Text>
        </View>

        <TouchableOpacity
          style={[s.chev, { right: 12 }]}
          onPress={() => select(Math.min(days.length - 1, index + 1))}
          disabled={index === days.length - 1}
        >
          <ArrowRightIcon width={24} height={24} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <FlatList
      ref={listRef}
      horizontal
      data={days}
      renderItem={renderItem}
      keyExtractor={(d, i) => `${d}-${i}`}
      getItemLayout={(_, i) => ({
        length: ITEM_W,
        offset: ITEM_W * i,
        index: i,
      })}
      initialScrollIndex={todayIdx}
      showsHorizontalScrollIndicator={false}
    />
  );
}

const s = StyleSheet.create({
  dimItem: {
    width: ITEM_W,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#EDEDED',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  dimText: { color: '#D0D0D0', fontSize: 18, fontWeight: '800' },
  activeWrap: {
    width: ITEM_W,
    height: 60,
    borderRadius: 12,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 'auto',
  },
  badge: {
    position: 'absolute',
    top: 2,
    left: 80,
    fontSize: 11,
    fontWeight: '700',
    color: '#eef5f0ff',
  },
  chev: { position: 'absolute', top: 20, padding: 6 },
  day: { color: '#fff', fontSize: 15, fontWeight: '800', marginTop: 10 },
  date: { color: '#F6D873', fontSize: 12, fontWeight: '700', marginTop: 2 },
});
