import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import RightArrowIcon from '../assets/newicon/right-arrow-white.svg';
import { COLORS } from '../ui/theme';

type Props = {
  onChange?: (dateYMD: string, index: number) => void;
  defaultYMD?: string; // optional external default
};

const ITEM_W = 200;

const toYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const niceDate = (d: Date) =>
  `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}`;

export default function DateTabs({ onChange, defaultYMD }: Props) {
  const listRef = useRef<FlatList<any>>(null);

  // build last 7 days, oldest -> today
  const items = useMemo(() => {
    const out: { label: string; ymd: string; date: Date }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      out.push({
        label: d.toLocaleDateString('en-US', { weekday: 'long' }),
        ymd: toYMD(d),
        date: d,
      });
    }
    return out;
  }, []);

  const todayIdx = items.length - 1;
  const initialIdx = useMemo(() => {
    if (!defaultYMD) return todayIdx;
    const idx = items.findIndex(x => x.ymd === defaultYMD);
    return idx >= 0 ? idx : todayIdx;
  }, [defaultYMD, items, todayIdx]);

  const [active, setActive] = useState(initialIdx);
  const firedOnceRef = useRef(false);

  // run once: center initial, fire onChange once
  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: initialIdx, viewPosition: 0.5, animated: true });
    });
    if (!firedOnceRef.current) {
      firedOnceRef.current = true;
      onChange?.(items[initialIdx].ymd, initialIdx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // prevent effect re-firing

  const select = useCallback((i: number) => {
    if (i === active) return;
    setActive(i);
    onChange?.(items[i].ymd, i);
    listRef.current?.scrollToIndex({ index: i, viewPosition: 0.4, animated: true });
  }, [active, items, onChange]);

  const onScrollToIndexFailed = (e: { index: number; highestMeasuredFrameIndex: number; }) => {
    const i = Math.min(e.index, e.highestMeasuredFrameIndex);
    setTimeout(() => listRef.current?.scrollToIndex({ index: i, animated: true }), 50);
  };

  const renderItem = ({ item, index }: { item: (typeof items)[number]; index: number }) => {
    const isActive = index === active;
    if (!isActive) {
      return (
        <TouchableOpacity activeOpacity={0.8} onPress={() => select(index)} style={s.dimItem}>
          <Text style={s.dimText}>{item.label}</Text>
          <Text style={s.dimSub}>{niceDate(item.date)}</Text>
        </TouchableOpacity>
      );
    }
    return (
      <View style={s.activeWrap}>
        <Text style={s.badge}>{index === todayIdx ? 'TODAY' : ''}</Text>

        <TouchableOpacity
          style={[s.chev, { left: 12 }]}
          onPress={() => select(Math.max(0, index - 1))}
          disabled={index === 0}
        >
          <RightArrowIcon style={{ transform: [{ rotate: '180deg' }] }} width={24} height={24} stroke='#fff' />
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <Text style={s.day}>{item.label}</Text>
          <Text style={s.date}>{niceDate(item.date)}</Text>
        </View>

        <TouchableOpacity
          style={[s.chev, { right: 12 }]}
          onPress={() => select(Math.min(items.length - 1, index + 1))}
          disabled={index === items.length - 1}
        >
          <RightArrowIcon width={24} height={24} stroke='#fff' />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <FlatList
      ref={listRef}
      horizontal
      data={items}
      renderItem={renderItem}
      keyExtractor={(it, i) => `${it.ymd}-${i}`}
      getItemLayout={(_, i) => ({ length: ITEM_W, offset: ITEM_W * i, index: i })}
      onScrollToIndexFailed={onScrollToIndexFailed}
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
  dimText: { color: '#9AA0A6', fontSize: 16, fontWeight: '800' },
  dimSub: { color: '#B8BDC2', fontSize: 12, fontWeight: '700', marginTop: 2 },

  activeWrap: {
    width: ITEM_W,
    height: 60,
    borderRadius: 12,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  badge: {
    position: 'absolute',
    top: 2,
    left: 80,
    fontSize: 11,
    fontWeight: '700',
    color: '#eef5f0ff',
  },
  chev: { position: 'absolute', top: 16, padding: 6 },
  day: { color: '#fff', fontSize: 15, fontWeight: '800', marginTop: 10 },
  date: { color: '#F6D873', fontSize: 12, fontWeight: '700', marginTop: 2 },
});
