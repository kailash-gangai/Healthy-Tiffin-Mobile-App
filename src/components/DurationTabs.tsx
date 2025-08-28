import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { COLORS } from '../ui/theme';

type Props = {
      days: string[];                 // ['Sunday','Monday',...,'Saturday']
      onChange?: (i: number) => void; // callback when selected index changes
};

const ITEM_W = 200; // width of each day card

export default function DurationTabs({ days, onChange }: Props) {
      const listRef = useRef<FlatList<string>>(null);

      const WEEK = ['Today', 'Weekly', 'Monthly', 'Yearly'];

      // figure out today
      const todayIdx = useMemo(() => {
            const js = new Date().getDay(); // 0 = Sunday
            const i = days.map(d => d.toLowerCase()).indexOf(WEEK[js]);
            return i >= 0 ? i : js % days.length;
      }, [days]);

      const [active, setActive] = useState(todayIdx);

      // on mount → scroll today to center
      useEffect(() => {
            setTimeout(() => {
                  listRef.current?.scrollToIndex({ index: todayIdx, viewPosition: 0.5, animated: true });
            }, 0);
            onChange?.(todayIdx);
      }, [todayIdx, onChange]);
      const select = (i: number) => {
            setActive(i);
            onChange?.(i);
            listRef.current?.scrollToIndex({
                  index: i,
                  viewPosition: 0.4,  // <--- centers the item
                  animated: true,
            });
      };

      const renderItem = ({ item, index }: { item: string; index: number }) => {
            const isActive = index === active;
            if (!isActive) {
                  return (
                        <TouchableOpacity activeOpacity={0.8} onPress={() => select(index)} style={s.dimItem}>
                              <Text style={s.dimText}>{item}</Text>
                        </TouchableOpacity>
                  );
            }
            return (
                  <View style={s.activeWrap}>
                        <TouchableOpacity style={[s.chev, { left: 12 }]} onPress={() => select(Math.max(0, index - 1))}>
                              <FontAwesome5 iconStyle='solid' name="chevron-left" size={18} color="#F6D873" />
                        </TouchableOpacity>
                        <View style={{ alignItems: 'center' }}>
                              <Text style={s.day}>{item}</Text>

                        </View>
                        <TouchableOpacity style={[s.chev, { right: 12 }]} onPress={() => select(Math.min(days.length - 1, index + 1))}>
                              <FontAwesome5 iconStyle='solid' name="chevron-right" size={18} color="#F6D873" />
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
            height: 64,
            borderRadius: 12,
            backgroundColor: '#919090ff',
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 6,
      },
      dimText: { color: '#D0D0D0', fontSize: 18, fontWeight: '800' },
      activeWrap: {
            width: ITEM_W,
            height: 64,
            borderRadius: 7,
            backgroundColor: COLORS.green,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 12,
      },
      badge: { position: 'absolute', top: 6, fontSize: 11, fontWeight: '700', color: '#CFE7D6', marginBottom: 2 },
      chev: { position: 'absolute', top: 20, padding: 6 },
      day: { color: '#fff', fontSize: 18, fontWeight: '800' },
      date: { color: '#F6D873', fontSize: 12, fontWeight: '700', marginTop: 2 },
});
