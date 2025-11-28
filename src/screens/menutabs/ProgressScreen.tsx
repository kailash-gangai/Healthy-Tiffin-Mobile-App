// ==========================================
// PROGRESS SCREEN (Optimized Version)
// Only fetch selected day's data
// Cache-first architecture
// ==========================================

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';

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
import { getCustomerMetaField } from '../../shopify/query/CustomerQuery';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

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

// Delay helper
function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

// Retry helper
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

// Rate limiting queue for Fitbit
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

// Format YYYY-MM-DD
function formatYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ProgressScreen() {
  const user = useSelector((state: RootState) => state.user);
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

  // Update UI safely
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

  // ===============================
  //  APPLE HEALTH (iOS)
  // ===============================
  function calculateSleepMinutes(bed: string, wake: string): number {
    const [bh, bm] = bed.split(':').map(Number);
    const [wh, wm] = wake.split(':').map(Number);

    const bedTotal = bh * 60 + bm;
    const wakeTotal = wh * 60 + wm;

    // If wake time is next day (crossed midnight)
    if (wakeTotal < bedTotal) {
      return (24 * 60 - bedTotal) + wakeTotal;
    }

    return wakeTotal - bedTotal;
  }
  const fetchAppleHealthData = async (ymd: string) => {
    const start = new Date(ymd);
    console.log('start', start);
    const startDate = start.toISOString();
    const endDate = new Date(start.getTime() + 24 * 60 * 60 * 1000).toISOString();


    console.log('startDate', startDate);
    console.log('endDate', endDate);
    const steps = await new Promise(resolve => {
      appleHealthKit.getDailyStepCountSamples(
        { startDate, endDate },
        (err, r) => resolve(r?.[0]?.value ?? '0')
      );
    });

    let sleepHours = 0, sleepMins = 0;
    if (user?.customerToken) {
      const bed_time = await getCustomerMetaField(user.customerToken, 'bed_time');       // "22:30"
      const wake_up_time = await getCustomerMetaField(user.customerToken, 'wake_up_time'); // "07:15"
      if (bed_time && wake_up_time) {
        const sleepMinutes = calculateSleepMinutes(bed_time, wake_up_time);
        sleepHours = Math.floor(sleepMinutes / 60);
        sleepMins = sleepMinutes % 60;
      }
    }
    const sleep = `${sleepHours} H ${sleepMins} M`;

    const calories = await new Promise(resolve => {
      appleHealthKit.getActiveEnergyBurned({ startDate, endDate }, (err, r) =>
        resolve(r?.[0]?.value ?? '0')
      );
    });

    const options = {
      unit: 'litre', // optional: default: litrer
      startDate: startDate, // required
      endDate: endDate, // required
      includeManuallyAdded: true, // optional: default true
      ascending: false, // optional; default false
    }
    const water = await new Promise(resolve => {
      appleHealthKit.getWaterSamples(options, (err, r) => {
        if (err || !r) return resolve(0);
        const total = r.reduce((sum, x) => sum + (x.value || 0), 0);
        resolve(total);
      });
    });

    console.log(
      `Apple Health: ${ymd} Steps: ${steps} Sleep: ${sleep} Calories: ${calories} Water: ${water}`
    )
    const glasses = (Number(water) * 4.22675).toFixed(1);

    return {
      steps: String(steps),
      calories: String(calories),
      sleepFmt: String(sleep),
      water: `${glasses} Glasses`,
    };
  };

  // ===============================
  //  FITBIT (Android)
  // ===============================
  const fetchFitbitData = async (ymd: string) => {
    const [activityData, waterData] = await Promise.all([
      withRetry(() => getfitBitData(tokenRef.current, ymd)),
      withRetry(() => getfitBitWaterLog(tokenRef.current, ymd)),
    ]);

    const steps = String(activityData?.summary?.steps ?? '0');
    const calories = String(activityData?.summary?.caloriesOut ?? '0');
    const sleepFmt = computeSleepFmt(sleepGoalRef.current ?? 0);

    const waterMl = Number(waterData?.summary?.water ?? 0);
    const glasses = Math.floor(waterMl / 236.587);

    return {
      steps,
      calories,
      sleepFmt,
      water: `${glasses} Glasses`,
    };
  };

  // ===================================
  // MASTER: Fetch Day (Cache-FIRST)
  // ===================================
  const fetchDay = useCallback(
    async (ymd: string, apply = false) => {
      // Return cached
      const cached = cacheRef.current.get(ymd);
      if (cached) {
        if (apply) safeSetItems(cached);
        return cached;
      }

      // Fetch new data
      const result = await new Promise<DaySummary>(resolve => {
        queue.enqueue(async () => {
          const d =
            Platform.OS === 'ios'
              ? await fetchAppleHealthData(ymd)
              : await fetchFitbitData(ymd);

          cacheRef.current.set(ymd, d);
          resolve(d);
        });
      });

      if (apply) safeSetItems(result);
      return result;
    },
    [queue, safeSetItems]
  );

  // ==================================
  // PRELOAD LAST 7 DAYS (on init ONLY)
  // ==================================
  const preloadLast7Days = useCallback(
    async (todayYMD: string) => {
      const base = new Date();
      for (let i = 0; i < 7; i++) {
        const d = new Date(base);
        d.setDate(base.getDate() - i);
        const ymd = formatYMD(d);

        await fetchDay(ymd, ymd === todayYMD);
      }
    },
    [fetchDay]
  );

  // ==============================
  // INIT
  // ==============================
  useEffect(() => {
    if (initOnce.current) return;
    initOnce.current = true;

    (async () => {
      try {
        if (Platform.OS === 'ios') {
          const ok = await checkHealthKitConnection();
          if (!ok) return navigate.replace('ConnectDevice');

          const today = formatYMD(new Date());
          setLoadingYMD(today);

          await preloadLast7Days(today);
        } else {
          const t = await withRetry(() => getValidTokens());
          const token = t?.accessToken as string;
          tokenRef.current = token;

          if (!token) return navigate.replace('ConnectDevice');

          sleepGoalRef.current = Number(
            (await getfitBitSleepgoal(tokenRef.current))?.goal?.minDuration || 0
          );

          const today = formatYMD(new Date());
          setLoadingYMD(today);

          await preloadLast7Days(today);
        }
      } catch (e) {
        showToastError('Unable to load health data.');
      } finally {
        setLoadingYMD(null);
        setInitLoading(false);
      }
    })();
  }, [navigate, preloadLast7Days]);

  // ==============================
  // DATE CHANGE HANDLER
  // ==============================
  const handleDateChange = useCallback(
    async (ymd: string) => {
      setLoadingYMD(ymd);
      try {
        await fetchDay(ymd, true);
      } catch (e) {
        showToastError('Failed to load selected day.');
      } finally {
        setLoadingYMD(null);
      }
    },
    [fetchDay]
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
