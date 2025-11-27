import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../ui/theme';
import HeaderGreeting from '../../components/HeaderGreeting';
import HealthMetrics from '../../components/HealthMetrics';
import DateTabs from '../../components/DateTabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import {
  getfitBitData,
  getfitBitSleepgoal,
  getfitBitWaterLog,
  getValidTokens,
} from '../../config/fitbitService';
import { showToastError } from '../../config/ShowToastMessages';
import { checkHealthKitConnection } from '../../health/healthkit';
import appleHealthKit from 'react-native-health';

const items_old = [
  {
    id: 'steps',
    label: 'Steps',
    value: '0',
    tint: '#E8F2EB',
    color: '#1E8E5A',
    image: require('../../assets/icons/running.png'),
    navigate: 'StepsTracker',
  },
  {
    id: 'sleep',
    label: 'Sleep',
    value: '0 H 0 M',
    tint: '#F0E7FA',
    color: '#7B57C5',
    image: require('../../assets/icons/moon.webp'),
    navigate: 'SleepTracker',
  },
  {
    id: 'cal',
    label: 'Calories',
    value: '0',
    tint: '#FDF2E3',
    color: '#F4A300',
    image: require('../../assets/icons/fire.png'),
    navigate: 'CaloriesTracker',
  },
  {
    id: 'water',
    label: 'Water',
    value: '0 Glass',
    tint: '#EAF3FB',
    color: '#2C85D8',
    image: require('../../assets/icons/water-drops.png'),
    navigate: 'WaterTracker',
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
      const status = e?.response?.status;
      const retryAfter = Number(e?.response?.headers?.['retry-after']) || 0;
      const wait = retryAfter ? retryAfter * 1000 : 400 * 2 ** i;
      if (status !== 429 && status < 500) break;
      await delay(wait);
    }
  }
  throw err;
}

// serialized queue to avoid burst 429s
class RateQueue {
  private running = false;
  private q: Array<() => Promise<void>> = [];
  constructor(private minGapMs = 700) { }
  enqueue(task: () => Promise<void>) {
    this.q.push(task);
    if (!this.running) this.run();
  }
  private async run() {
    this.running = true;
    while (this.q.length) {
      const t = this.q.shift()!;
      try {
        await t();
      } catch { }
      await delay(this.minGapMs);
    }
    this.running = false;
  }
}

type DaySummary = {
  steps: string;
  calories: string;
  sleepFmt: string;
  water: string;
};

function formatYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ProgressScreen() {
  const navigate =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState(items_old);
  const [loadingYMD, setLoadingYMD] = useState<string | null>(null);
  const [initLoading, setInitLoading] = useState(true);

  const tokenRef = useRef<string | null>(null);
  const cacheRef = useRef<Map<string, DaySummary>>(new Map());
  const sleepGoalRef = useRef<number | null>(null);
  const initOnce = useRef(false);
  const queue = useMemo(() => new RateQueue(700), []);

  const computeSleepFmt = (minutes: number) =>
    `${Math.floor(minutes / 60)} H ${minutes % 60} M`;

  const safeSetItems = useCallback((d: DaySummary) => {
    setItems(prev => {
      const next = prev.map(i => {
        if (i.id === 'steps') return { ...i, value: d.steps };
        if (i.id === 'cal') return { ...i, value: d.calories };
        if (i.id === 'sleep') return { ...i, value: d.sleepFmt };
        if (i.id === 'water') return { ...i, value: d.water };
        return i;
      });
      return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
    });
  }, []);

  const fetchDay = useCallback(
    async (ymd: string, applyIfSelected = false, { silent = false } = {}) =>
      new Promise<void>(resolve => {
        const cached = cacheRef.current.get(ymd);
        if (cached) {
          if (applyIfSelected) safeSetItems(cached);
          resolve();
          return;
        }
        queue.enqueue(async () => {
          try {
            let d;
            if (Platform.OS === 'ios') {
              // Fetch data from Apple Health on iOS
              d = await fetchAppleHealthData(ymd);
            } else {
              // Fetch data from Fitbit on Android
              d = await fetchFitbitData(ymd);
            }
            cacheRef.current.set(ymd, d);
            if (applyIfSelected) safeSetItems(d);
          } finally {
            resolve();
          }
        });
      }),
    [queue, safeSetItems],
  );


  const fetchDayUnsafe = async (ymd: string) => {
    const startOfDay = new Date(ymd);
    startOfDay.setHours(0, 0, 0, 0); // Set to the beginning of the day (00:00:00)

    const endOfDay = new Date(ymd);
    endOfDay.setHours(23, 59, 59, 999); // Set to the end of the day (23:59:59)

    const startDate = startOfDay.toISOString();
    const endDate = endOfDay.toISOString();

    // Fetch data based on platform (iOS or Android)
    if (Platform.OS === 'ios') {
      // Fetch data from Apple Health (iOS)
      const steps = await new Promise((resolve, reject) => {
        appleHealthKit.getDailyStepCountSamples(
          { startDate, endDate },
          (err, results) => {
            if (err) reject(err);
            else resolve(results?.[0]?.value || '0');
          }
        );
      });

      const sleep = await new Promise((resolve, reject) => {
        appleHealthKit.getSleepSamples(
          { startDate, endDate },
          (err, results) => {
            if (err) reject(err);
            else resolve(results?.[0]?.value || '0 H 0 M');
          }
        );
      });

      const calories = await new Promise((resolve, reject) => {
        appleHealthKit.getActiveEnergyBurned(
          { startDate, endDate },
          (err, results) => {
            if (err) reject(err);
            else resolve(results?.[0]?.value || '0');
          }
        );
      });

      const water = await new Promise((resolve, reject) => {
        appleHealthKit.getWater({ startDate, endDate }, (err, results) => {
          if (err) reject(err);
          else resolve(results?.value || '0');
        });
      });
      console.log('Apple Health data', { steps, sleep, calories, water });
      return {
        steps: String(steps),
        sleepFmt: String(sleep),
        calories: String(calories),
        water: `${convertLitersToUSCups(water).toFixed(2)} Glasses`, // Convert water to glasses
      };
    } else {
      // Fetch data from Fitbit (Android)
      const [activityData, waterData] = await Promise.all([
        withRetry(() => getfitBitData(tokenRef.current, ymd)),
        withRetry(() => getfitBitWaterLog(tokenRef.current, ymd)),
      ]);

      const steps = String(activityData?.summary?.steps ?? '0');
      const calories = String(activityData?.summary?.caloriesOut ?? '0');
      const sleepFmt = computeSleepFmt(sleepGoalRef.current || 0);
      const waterMl = Number(waterData?.summary?.water ?? 0);
      const glasses = Math.floor(waterMl / 236.587997); // Convert water to glasses

      return { steps, calories, sleepFmt, water: `${glasses > 0 ? glasses : 0} Glasses` };
    }
  };


  const fetchAppleHealthData = async (ymd: string) => {
    // Placeholder function: Replace with actual Apple Health fetching logic
    const appleHealthData = await fetchDayUnsafe(ymd);
    return appleHealthData;
  };

  const fetchFitbitData = async (ymd: string) => {
    // Fetch data from Fitbit service
    const fitbitData = await fetchDayUnsafe(ymd);
    return fitbitData;
  };


  const preloadLast7Days = useCallback(
    async (selectedYMD: string) => {
      const days: string[] = [];
      const base = new Date();
      for (let i = 0; i < 7; i++) {
        const d = new Date(base);
        d.setDate(base.getDate() - i);
        days.push(formatYMD(d));
      }
      // oldest → newest; apply today immediately
      for (let i = days.length - 1; i >= 0; i--) {
        const y = days[i];
        await fetchDay(y, y === selectedYMD, { silent: true }); // silent during init
      }
    },
    [fetchDay],
  );

  // init
  useEffect(() => {
    if (initOnce.current) return;
    initOnce.current = true;
    (async () => {
      try {
        if (Platform.OS == 'ios') {
          const appleHealthConnected = await checkHealthKitConnection();
          console.log('HealthKit connection status:', appleHealthConnected);
          if (!appleHealthConnected) {
            navigate.replace('ConnectDevice');
            return;
          }
          const today = formatYMD(new Date());
          setLoadingYMD(today);
          await preloadLast7Days(today);
        } else {
          const t = await withRetry(() => getValidTokens());
          const token = t?.accessToken as string;
          tokenRef.current = token;
          if (!token) {
            navigate.replace('ConnectDevice');
            return;
          }
          const today = formatYMD(new Date());
          setLoadingYMD(today);
          await preloadLast7Days(today);
        }

      } catch (e: any) {
        // error already surfaced in fetchWithAuth when not silent
      } finally {
        setLoadingYMD(null);
        setInitLoading(false);
      }
    })();
  }, [navigate, preloadLast7Days]);

      const convertLitersToUSCups = (liters: number): number => {
      const cupsPerLiter = 4.22675;
      return (liters * cupsPerLiter);
    };
  // date change handler with loader
  const handleDateChange = useCallback(
    async (ymd: string) => {
      setLoadingYMD(ymd);
      try {
        await fetchDay(ymd, true, { silent: false });
      } finally {
        setLoadingYMD(null);
      }
    },
    [fetchDay],
  );

  const showSpinner = initLoading || loadingYMD !== null;

  return (
    <ScrollView
      bounces={false}
      style={{ flex: 1, backgroundColor: COLORS.white }}
    >
      <HeaderGreeting name="Sam" />
      <View style={styles.dayTabs}>
        <DateTabs onChange={handleDateChange} />
      </View>
      <View style={styles.healthMetrics}>
        {showSpinner ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <HealthMetrics items={items} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dayTabs: {
    marginTop: 8,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS,
    padding: SPACING,
  },
  healthMetrics: {
    marginTop: 20,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS,
    paddingHorizontal: 16,
    minHeight: 140,
  },
  loaderWrap: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
