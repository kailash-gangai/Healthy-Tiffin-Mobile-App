import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SHADOW, RADIUS, SPACING } from '../ui/theme';
import { Use } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../screens/navigation/types';
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import {
  getfitBitData,
  getfitBitSleepgoal,
  getfitBitWaterLog,
  getfitBitWeight,
  getValidTokens,
} from '../config/fitbitService';
import { showToastError } from '../config/ShowToastMessages';
const width = Dimensions.get('window').width;
const DIAMETER = width / 5 - 10;
const items_old = [
  {
    value: '0',
    unit: 'kg',
    type: 'Weight',
    bgColor: '#DDE3F6',
    color: '#3B49DF',
    navigate: 'WeightTracker',
  },
  {
    value: '0',
    unit: '',
    type: 'Steps',
    bgColor: '#DDEEE2',
    color: '#0B5733',
    navigate: 'StepsTracker',
  },
  {
    value: '8',
    unit: '',
    type: 'Sleep',
    bgColor: '#EDE7FB',
    color: '#6A4CDB',
    navigate: 'SleepTracker',
  },
  {
    value: '16',
    unit: 'Glass',
    type: 'Water',
    bgColor: '#EAF3FB',
    color: '#0B73B3',
    navigate: 'WaterTracker',
  },
  {
    value: '0',
    unit: 'Cal',
    type: 'Calories',
    bgColor: '#FDF1D9',
    color: '#D27C00',
    navigate: 'CaloriesTracker',
  },
];
function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
async function withRetry<T>(fn: () => Promise<T>, tries = 3): Promise<T> {
  let err: any;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      err = e;
      const retryAfter = Number(e?.response?.headers?.['retry-after']) || 0;
      const wait = retryAfter ? retryAfter * 1000 : 400 * 2 ** i;
      if (e?.response?.status !== 429 && e?.response?.status < 500) break;
      await delay(wait);
    }
  }
  throw err;
}
export default function StatsCard() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = React.useState(items_old);
  const didRun = useRef(false);
  const lastFetchAt = useRef(0);

  useEffect(() => {
    // Guard React 18 StrictMode double invoke and add a 60s throttle.
    if (didRun.current) return;
    didRun.current = true;
    const now = Date.now();
    if (now - lastFetchAt.current < 60_000) return;
    lastFetchAt.current = now;

    (async () => {
      try {
        const t = await withRetry(() => getValidTokens());
        const token = t?.accessToken as string;
        console.log('fitbit data chips', token);
        const [s, weight, sleep, water] = await Promise.all([
          withRetry(() => getfitBitData(token, '')),
          withRetry(() => getfitBitWeight(token, '')),
          withRetry(() => getfitBitSleepgoal(token)),
          withRetry(() => getfitBitWaterLog(token, '')), // today
        ]);

        const steps = String(s?.summary?.steps ?? '');
        const calories = String(s?.summary?.caloriesOut ?? '');
        const wt = String(weight?.goal?.startWeight ?? '');
        const sleepMin = parseInt(sleep?.goal?.minDuration ?? '0', 10);
        const sleepFmt = `${Math.floor(sleepMin / 60)} H ${sleepMin % 60} M`;
        const waterCount = Math.floor((water?.summary?.water ?? 0) / 236);
        // Single state update
        setItems(prev =>
          prev.map(i => {
            switch (i.type) {
              case 'Steps':
                return { ...i, value: steps };
              case 'Calories':
                return { ...i, value: calories };
              case 'Weight':
                return { ...i, value: wt };
              case 'Sleep':
                return { ...i, value: sleepFmt };
              case 'Water':
                return { ...i, value: String(waterCount > 0 ? waterCount : 0) };
              default:
                return i;
            }
          }),
        );
      } catch (e: any) {
        console.warn('fitbit data err', JSON.stringify(e));
        // showToastError(e?.message ?? e);
      }
    })();
  }, [setItems]);
  return (
    <View style={s.cardWrap}>
      <View style={s.card}>
        <View style={s.rowStats}>
          {items.map((it, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(it.navigate)}
            >
              <View
                key={i}
                style={[s.pill, s.circle, { backgroundColor: it.bgColor }]}
              >
                <Text style={s.value}>
                  <Text style={[s.value, { color: it.color }]}>
                    {' '}
                    {it.value}
                  </Text>
                  {it.unit ? (
                    <Text style={[s.unit, { color: it.color }]}>
                      {' '}
                      {it.unit}
                    </Text>
                  ) : null}
                </Text>
                <Text style={s.label}>{it.type}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  cardWrap: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    marginTop: -20,
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
  },
  card: {
    marginVertical: 26,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
    ...SHADOW,
  },
  rowStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'space-around',
  },
  pill: { alignItems: 'center', justifyContent: 'center' },
  value: { fontWeight: '800', fontSize: 12 },
  unit: { fontSize: 12 },
  label: { fontSize: 12, color: '#000', fontWeight: '800' },
  circle: {
    width: DIAMETER,
    height: DIAMETER,
    borderRadius: DIAMETER / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
