import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
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
import appleHealthKit from 'react-native-health';
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

const fetchAppleHealthData = async (startDate: string, endDate: string) => {
  try {
    const steps = await new Promise((resolve, reject) => {
      appleHealthKit.getDailyStepCountSamples({ startDate, endDate }, (err, results) => {
        if (err) reject(err);
        else resolve(results?.[0]?.value || '0');
      });
    });

    const sleep = await new Promise((resolve, reject) => {
      appleHealthKit.getSleepSamples({ startDate, endDate }, (err, results) => {
        if (err) reject(err);
        else resolve(results?.[0]?.value || '0 H 0 M');
      });
    });

    const calories = await new Promise((resolve, reject) => {
      appleHealthKit.getActiveEnergyBurned({ startDate, endDate }, (err, results) => {
        if (err) reject(err);
        else resolve(results?.[0]?.value || '0');
      });
    });

    const water = await new Promise((resolve, reject) => {
      appleHealthKit.getWater({ startDate, endDate }, (err, results) => {
        if (err) reject(err);
        else resolve(results?.value || '0');
      });
    });
  

    return { steps, sleep, calories, water };
  } catch (error) {
    console.warn('Error fetching Apple Health data', error);
    throw new Error('Error fetching Apple Health data');
  }
};

const fetchFitbitData = async (token: string) => {
  try {
    const [fitbitData, fitbitWeight, fitbitSleep, fitbitWater] = await Promise.all([
      getfitBitData(token, ''),
      getfitBitWeight(token, ''),
      getfitBitSleepgoal(token),
      getfitBitWaterLog(token, ''), // today
    ]);

    const steps = String(fitbitData?.summary?.steps ?? '');
    const calories = String(fitbitData?.summary?.caloriesOut ?? '');
    const wt = String(fitbitWeight?.goal?.startWeight ?? '');
    const sleepMin = parseInt(fitbitSleep?.goal?.minDuration ?? '0', 10);
    const sleepFmt = `${Math.floor(sleepMin / 60)} H ${sleepMin % 60} M`;
    const waterCount = Math.floor((fitbitWater?.summary?.water ?? 0) / 236);

    return { steps, calories, wt, sleepFmt, waterCount };
  } catch (error) {
    console.warn('Error fetching Fitbit data', error);
    throw new Error('Error fetching Fitbit data');
  }
};
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
    const convertLitersToUSCups = (liters: number): number => {
      const cupsPerLiter = 4.22675;
      return (liters * cupsPerLiter);
    };
    const fetchData = async () => {
      try {
        let steps = '0', calories = '0', weight = '0', sleep = '0 H 0 M', water = '0';

        if (Platform.OS === 'ios') {
          const today = new Date();
          const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
          const endDate = new Date().toISOString();
          const appleHealthData = await fetchAppleHealthData(startDate, endDate);
          console.log('appleHealthData', appleHealthData);
          steps = appleHealthData.steps;
          sleep = appleHealthData.sleep;
          calories = appleHealthData.calories;
          water = convertLitersToUSCups(appleHealthData.water).toFixed(2);
        } else {
          const t = await withRetry(() => getValidTokens());
          const token = t?.accessToken as string;
          const fitbitData = await fetchFitbitData(token);
          steps = fitbitData.steps;
          calories = fitbitData.calories;
          weight = fitbitData.wt;
          sleep = fitbitData.sleepFmt;
          water = String(fitbitData.waterCount > 0 ? fitbitData.waterCount : 0);
        }

        // Single state update
        setItems(prev =>
          prev.map(i => {
            switch (i.type) {
              case 'Steps':
                return { ...i, value: steps };
              case 'Calories':
                return { ...i, value: calories };
              case 'Weight':
                return { ...i, value: weight };
              case 'Sleep':
                return { ...i, value: sleep };
              case 'Water':
                return { ...i, value: water };
              default:
                return i;
            }
          }),
        );
      } catch (e: any) {
        console.warn(JSON.stringify(e));
        showToastError(e?.message ?? 'Error fetching data');
      }
    };

    fetchData();
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
    backgroundColor: '#f6f6f8',
    alignItems: 'center',
    marginTop: -10,
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
  },
  card: {
    marginVertical: 8,
    borderRadius: 20,
    paddingVertical: 6,
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
