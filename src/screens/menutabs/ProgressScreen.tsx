import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
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

const items_old = [
      { id: 'steps', label: 'Steps', value: '0', tint: '#E8F2EB', color: '#1E8E5A', image: require('../../assets/icons/running.png'), navigate: 'StepsTracker' },
      { id: 'sleep', label: 'Sleep', value: '0 H 0 M', tint: '#F0E7FA', color: '#7B57C5', image: require('../../assets/icons/moon.webp'), navigate: 'SleepTracker' },
      { id: 'cal', label: 'Calories', value: '0', tint: '#FDF2E3', color: '#F4A300', image: require('../../assets/icons/fire.png'), navigate: 'CaloriesTracker' },
      { id: 'water', label: 'Water', value: '0 Glass', tint: '#EAF3FB', color: '#2C85D8', image: require('../../assets/icons/water-drops.png'), navigate: 'WaterTracker' },
];

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function withRetry<T>(fn: () => Promise<T>, tries = 3): Promise<T> {
      let err: any;
      for (let i = 0; i < tries; i++) {
            try { return await fn(); }
            catch (e: any) {
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
                  try { await t(); } catch { }
                  await delay(this.minGapMs);
            }
            this.running = false;
      }
}

type DaySummary = { steps: string; calories: string; sleepFmt: string; water: string };

function formatYMD(d: Date) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
}

export default function ProgressScreen() {
      const navigate = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
      const [items, setItems] = useState(items_old);

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

      // 401-refresh wrapper
      const fetchWithAuth = useCallback(async <T,>(call: (tok: string) => Promise<T>): Promise<T> => {
            let tok = tokenRef.current as string;
            try { return await call(tok); }
            catch (e: any) {
                  if (e?.response?.status === 401) {
                        const t = await withRetry(() => getValidTokens());
                        tok = t?.accessToken as string;
                        tokenRef.current = tok;
                        if (!tok) throw e;
                        return await call(tok);
                  }
                  throw e;
            }
      }, []);

      const fetchDayUnsafe = useCallback(async (ymd: string): Promise<DaySummary> => {
            const [act, water] = await Promise.all([
                  fetchWithAuth(tok => withRetry(() => getfitBitData(tok, ymd))),
                  fetchWithAuth(tok => withRetry(() => getfitBitWaterLog(tok, ymd))),
            ]);

            if (sleepGoalRef.current == null) {
                  const sg = await fetchWithAuth(tok => withRetry(() => getfitBitSleepgoal(tok)));
                  const mins = parseInt(sg?.goal?.minDuration ?? '0', 10);
                  sleepGoalRef.current = Number.isNaN(mins) ? 0 : mins;
            }

            const steps = String(act?.summary?.steps ?? '0');
            const calories = String(act?.summary?.caloriesOut ?? '0');
            const sleepFmt = computeSleepFmt(sleepGoalRef.current || 0);
            const waterMl = Number(water?.summary?.water ?? 0);
            const glasses = Math.floor(waterMl / 236.587997);
            const waterStr = `${glasses > 0 ? glasses : 0} Glasses`;

            return { steps, calories, sleepFmt, water: waterStr };
      }, [computeSleepFmt, fetchWithAuth]);

      const fetchDay = useCallback((ymd: string, applyIfSelected = false) =>
            new Promise<void>((resolve) => {
                  const cached = cacheRef.current.get(ymd);
                  if (cached) {
                        if (applyIfSelected) safeSetItems(cached);
                        resolve(); return;
                  }
                  queue.enqueue(async () => {
                        try {
                              const d = await fetchDayUnsafe(ymd);
                              cacheRef.current.set(ymd, d);
                              if (applyIfSelected) safeSetItems(d);
                        } catch (e: any) {
                              console.warn('fitbit day fetch err', e?.message ?? e);
                              showToastError(e?.message ?? e);
                        } finally {
                              resolve();
                        }
                  });
            }), [fetchDayUnsafe, queue, safeSetItems]);

      const preloadLast7Days = useCallback(async (selectedYMD: string) => {
            const days: string[] = [];
            const base = new Date();
            for (let i = 0; i < 7; i++) {
                  const d = new Date(base);
                  d.setDate(base.getDate() - i);
                  days.push(formatYMD(d));
            }
            // oldest -> newest; apply today immediately
            for (let i = days.length - 1; i >= 0; i--) {
                  const y = days[i];
                  await fetchDay(y, y === selectedYMD);
            }
      }, [fetchDay]);

      // init
      useEffect(() => {
            if (initOnce.current) return;
            initOnce.current = true;
            (async () => {
                  try {
                        const t = await withRetry(() => getValidTokens());
                        const token = t?.accessToken as string;
                        tokenRef.current = token;
                        if (!token) { navigate.replace('ConnectDevice'); return; }
                        const today = formatYMD(new Date());
                        await preloadLast7Days(today);
                  } catch (e: any) {
                        console.warn('fitbit init err', e?.message ?? e);
                        showToastError(e?.message ?? e);
                  }
            })();
      }, [navigate, preloadLast7Days]);

      // date change handler (stable)
      const handleDateChange = useCallback((ymd: string) => {
            const cached = cacheRef.current.get(ymd);
            if (cached) { safeSetItems(cached); return; }
            fetchDay(ymd, true);
      }, [fetchDay, safeSetItems]);

      return (
            <ScrollView bounces={false} style={{ flex: 1, backgroundColor: COLORS.white }}>
                  <HeaderGreeting name="Sam" />
                  <View style={styles.dayTabs}>
                        <DateTabs onChange={handleDateChange} />
                  </View>
                  <View style={styles.healthMetrics}>
                        <HealthMetrics items={items} />
                  </View>
            </ScrollView>
      );
}

const styles = StyleSheet.create({
      dayTabs: {
            marginTop: 12,
            backgroundColor: COLORS.white,
            borderRadius: RADIUS,
            padding: SPACING / 2,
      },
      healthMetrics: {
            marginTop: 20,
            backgroundColor: COLORS.white,
            borderRadius: RADIUS,
            padding: SPACING / 2,
            paddingHorizontal: SPACING * 2,
      },
});
