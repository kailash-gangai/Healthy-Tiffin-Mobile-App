import React, { useCallback, useEffect, useState, useRef } from 'react';
import { ScrollView, View, StyleSheet, Text } from 'react-native';
import { CARTWRAP, COLORS, RADIUS, SPACING } from '../../ui/theme';
import HeaderGreeting from '../../components/HeaderGreeting';
import DayTabs from '../../components/DayTabs';
import HealthMetrics from '../../components/HealthMetrics';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getfitBitData, getfitBitSleepgoal, getfitBitWaterLog, getfitBitWeight, getValidTokens } from '../../config/fitbitService';

import { showToastError } from '../../config/ShowToastMessages';
const items_old = [
      { id: 'steps', label: 'Steps', value: '0', tint: '#E8F2EB', color: '#1E8E5A', image: require('../../assets/icons/running.png'), navigate: 'StepsTracker' },
      { id: 'sleep', label: 'Sleep', value: '0 H 0 M', tint: '#F0E7FA', color: '#7B57C5', image: require('../../assets/icons/moon.webp'), navigate: 'SleepTracker' },
      { id: 'cal', label: 'Calories', value: '0', tint: '#FDF2E3', color: '#F4A300', image: require('../../assets/icons/fire.png'), navigate: 'CaloriesTracker' },
      { id: 'water', label: 'Water', value: '0 Glasses', tint: '#EAF3FB', color: '#2C85D8', image: require('../../assets/icons/water-drops.png'), navigate: 'WaterTracker' }
];

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function withRetry<T>(fn: () => Promise<T>, tries = 3): Promise<T> {
      let err: any;
      for (let i = 0; i < tries; i++) {
            try { return await fn(); } catch (e: any) {
                  err = e;
                  const retryAfter =
                        Number(e?.response?.headers?.["retry-after"]) || 0;
                  const wait = retryAfter ? retryAfter * 1000 : 400 * 2 ** i;
                  if (e?.response?.status !== 429 && e?.response?.status < 500) break;
                  await delay(wait);
            }
      }
      throw err;
}
const ProgressScreen: React.FC = () => {
      const navigate = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

      const [accessToken, setAccessToken] = useState<string | null>(null);
      const [items, setItems] = useState(items_old);
      const didRun = useRef(false);
      const lastFetchAt = useRef(0);

      useEffect(() => {
            // Guard React 18 StrictMode double invoke and add a 60s throttle.
            if (didRun.current) return; didRun.current = true;
            const now = Date.now();
            if (now - lastFetchAt.current < 60_000) return;
            lastFetchAt.current = now;

            (async () => {
                  try {
                        const t = await withRetry(() => getValidTokens());
                        const token = t?.accessToken as string;
                        setAccessToken(token);
                        if (!token) {
                              navigate.replace("ConnectDevice");
                              return;
                        }
                        console.log('fitbit data progress');
                        // Fetch all in parallel
                        const [s, sleep, water] = await Promise.all([
                              withRetry(() => getfitBitData(token, "")),
                              withRetry(() => getfitBitSleepgoal(token)),
                              withRetry(() => getfitBitWaterLog(token, "")), // today
                        ]);
                        const steps = String(s?.summary?.steps ?? "");
                        const calories = String(s?.summary?.caloriesOut ?? "");
                        const sleepMin = parseInt(sleep?.goal?.minDuration ?? "0", 10);
                        const sleepFmt = `${Math.floor(sleepMin / 60)} H ${sleepMin % 60} M`;
                        const waterCount = Math.floor((water?.summary?.water ?? 0) / 236.587997);

                        // Single state update
                        setItems(prev =>
                              prev.map(i => {
                                    switch (i.id) {
                                          case "steps": return { ...i, value: steps };
                                          case "cal": return { ...i, value: calories };
                                          case "sleep": return { ...i, value: sleepFmt };
                                          case "water": return { ...i, value: String(waterCount > 0 ? waterCount : 0) + " Glasses" };
                                          default: return i;
                                    }
                              })
                        );
                  } catch (e: any) {
                        console.warn("fitbit data err", e?.message ?? e);
                        showToastError(e?.message ?? e);
                  }
            })();
      }, [setItems]);

      return (
            <ScrollView bounces={false} style={{ flex: 1, backgroundColor: COLORS.white }}>
                  <HeaderGreeting name="Sam" />
                  < View style={[CARTWRAP]} >
                        <View style={styles.dayTabs}>
                              <DayTabs days={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']} />
                        </View>
                  </View>
                  <View style={styles.healthMetrics}>
                        <HealthMetrics items={items} />
                  </View>
            </ScrollView>
      );
};
function formatHoursMinutes(minutes: number): string {
      console.log('minutes', minutes);
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h} H ${m} M`;
}
export default ProgressScreen;
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
