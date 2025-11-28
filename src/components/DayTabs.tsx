import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import ArrowLeftIcon from '../assets/newicon/left-arrow.svg';
import ArrowRightIcon from '../assets/newicon/right-arrow.svg';
import { COLORS, SHADOW, SPACING } from '../ui/theme';
import LinearGradient from 'react-native-linear-gradient';
import Divider from '../assets/newicon/divider.svg';
const ITEM_W = 60;

export default function DayTabs({
  days,
  onChange,
  activeDay, // Accept activeDay as a prop
}: {
  days: string[];
  onChange?: (i: number) => void;
  activeDay?: number;
}) {
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

  const filteredDays = useMemo(
    () => days.filter(d => !['saturday', 'sunday'].includes(d.toLowerCase())),
    [days],
  );

  const todayIdx = useMemo(() => {
    const js = new Date().getDay();
    const i = filteredDays.map(d => d.toLowerCase()).indexOf(WEEK[js]);
    return i >= 0 ? i : 0;
  }, [filteredDays]);

  const [active, setActive] = useState(activeDay);

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
      `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', {
        month: 'long',
      })}`;
    return `${fmt(monday)} - ${fmt(sunday)} ${monday.getFullYear()}`;
  }, []);

  // useEffect(() => {
  //   listRef.current?.scrollToIndex({ index: todayIdx, viewPosition: 0.5, animated: true });
  //   onChange?.(todayIdx);
  // }, [todayIdx, onChange]);

  useEffect(() => {
    // Update the active state when the parent changes the active day
    setActive(activeDay);
    listRef.current?.scrollToIndex({
      index: todayIdx,
      viewPosition: 0.5,
      animated: true,
    });
  }, [activeDay, todayIdx]);
  const select = (i: number) => {
    if (i < 0 || i >= filteredDays.length) return;
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
    const { day } = dateForDayName(item);
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => select(index)}
        style={s.dayItem}
      >
        <Text style={[s.dayName, isActive && s.activeDayName]}>
          {item.slice(0, 3).toUpperCase()}
        </Text>

        {isActive ? (
          <LinearGradient
            colors={['#F9C711', '#DFB318']}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={[s.dateBox, s.dateBoxActive]}
          >
            <Text style={[s.dateText, s.dateTextActive]}>{day}</Text>
            <View style={s.dot} />
          </LinearGradient>
        ) : (
          <View style={[s.dateBox, s.dateBoxInactive]}>
            <Text style={s.dateText}>{day}</Text>
            <View style={s.dot} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.wrapper}>
      <View style={s.header}>
        <LinearGradient
          colors={[
            'rgba(66, 210, 150, 0.2)', // start color
            'rgba(42, 180, 123, 0.2)', // end color
          ]}
          start={{ x: 0.3, y: 0 }} // roughly matches 189.66° angle
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 8 }}
        >
          <TouchableOpacity
            onPress={() => select(active - 1)}
            disabled={active === 0}
            style={[s.iconWrap, active === 0 && { opacity: 0.3 }]}
          >
            <View>
              <ArrowLeftIcon width={16} height={16} />
            </View>
          </TouchableOpacity>
        </LinearGradient>
        <Text style={s.rangeText}>{weekRangeLabel}</Text>
        <LinearGradient
          colors={[
            'rgba(66, 210, 150, 0.2)', // start color
            'rgba(42, 180, 123, 0.2)', // end color
          ]}
          start={{ x: 0.3, y: 0 }} // roughly matches 189.66° angle
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 8 }}
        >
          <TouchableOpacity
            onPress={() => select(active + 1)}
            disabled={active === filteredDays.length - 1}
          >
            <View
              style={[
                s.iconWrap,
                active === filteredDays.length - 1 && { opacity: 0.3 },
              ]}
            >
              <ArrowRightIcon width={16} height={16} />
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </View>
      <Divider />

      <FlatList
        ref={listRef}
        horizontal
        data={filteredDays}
        renderItem={renderItem}
        keyExtractor={(d, i) => `${d}-${i}`}
        getItemLayout={(_, i) => ({
          length: ITEM_W,
          offset: ITEM_W * i,
          index: i,
        })}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.listContainer}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    marginHorizontal: SPACING,
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
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  rangeText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#7C7C7C',
    fontFamily: 'Poppins',
    lineHeight: 20,
    letterSpacing: -0.24,
  },
  listContainer: { justifyContent: 'center', gap: 8, width: '100%' },
  dayItem: { alignItems: 'center', marginTop: 16 },
  dayName: { fontSize: 12, fontWeight: '400', color: '#000', marginBottom: 6 },
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
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffff',
    position: 'absolute',
    bottom: 6,
  },
});
