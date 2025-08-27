// screens/ConnectDevicesScreen.tsx
import React, { useState, useMemo } from 'react';
import {
      View, Text, StyleSheet, TouchableOpacity, Image, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authorize, refresh, revoke, AuthorizeResult } from 'react-native-app-auth';
import AppleHealthKit, { HealthValue } from 'react-native-health';
import AppHeader from '../../components/AppHeader';

const C = { green: '#0B5733', white: '#FFF', text: '#232323', sub: '#6F6F6F', chip: '#F4F5F6', ok: '#1FA56A' };

// ---- Fitbit OAuth config (fill in) ----
const FITBIT = {
      clientId: 'YOUR_FITBIT_CLIENT_ID',
      clientSecret: 'YOUR_FITBIT_CLIENT_SECRET',           // optional for PKCE= false
      redirectUrl: 'your.app://oauthredirect',
      serviceConfiguration: {
            authorizationEndpoint: 'https://www.fitbit.com/oauth2/authorize',
            tokenEndpoint: 'https://api.fitbit.com/oauth2/token',
            revocationEndpoint: 'https://api.fitbit.com/oauth2/revoke',
      },
      scopes: ['activity', 'sleep', 'heartrate', 'weight', 'nutrition', 'profile'],
      usePKCE: true,
};

// ---- Apple Health permissions (iOS only) ----
const HK_PERMS = {
      permissions: {
            read: [
                  AppleHealthKit.Constants.Permissions.StepCount,
                  AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
                  AppleHealthKit.Constants.Permissions.SleepAnalysis,
                  AppleHealthKit.Constants.Permissions.HeartRate,
                  AppleHealthKit.Constants.Permissions.Height,
                  AppleHealthKit.Constants.Permissions.Weight,
            ],
            write: [],
      },
};

type Steps = { today: number; last7: { date: string; value: number }[] };

export default function ConnectDevicesScreen({ navigation }: any) {
      const [fitbitAuth, setFitbitAuth] = useState<AuthorizeResult | null>(null);
      const [fitbitSteps, setFitbitSteps] = useState<Steps | null>(null);

      const [hkReady, setHkReady] = useState<boolean>(false);
      const [hkSteps, setHkSteps] = useState<Steps | null>(null);

      // ----- Fitbit -----
      const connectFitbit = async () => {
            try {
                  const res = await authorize(FITBIT as any);
                  setFitbitAuth(res);
                  await loadFitbitSteps(res.accessToken);
            } catch (e) {
                  console.warn('Fitbit auth error', e);
            }
      };

      const loadFitbitSteps = async (token: string) => {
            // last 7 days including today
            const url = 'https://api.fitbit.com/1/user/-/activities/steps/date/today/7d.json';
            const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            const json = await r.json();
            const series: { date: string; value: string }[] = json['activities-steps'] || [];
            const last7 = series.map(s => ({ date: s.dateTime, value: Number(s.value) }));
            const today = last7.length ? last7[last7.length - 1].value : 0;
            setFitbitSteps({ today, last7 });
      };

      // ----- Apple Health (iOS) -----
      const connectAppleHealth = () => {
            if (Platform.OS !== 'ios') return;
            AppleHealthKit.initHealthKit(HK_PERMS, (err) => {
                  if (err) {
                        console.warn('HealthKit init error', err);
                        return;
                  }
                  setHkReady(true);
                  loadHKSteps();
            });
      };

      const loadHKSteps = () => {
            if (Platform.OS !== 'ios') return;
            const now = new Date();
            const start = new Date(now);
            start.setDate(now.getDate() - 6); // last 7 days window
            AppleHealthKit.getDailyStepCountSamples(
                  { startDate: start.toISOString(), endDate: now.toISOString() },
                  (err: string, results: HealthValue[]) => {
                        if (err) { console.warn('HK steps error', err); return; }
                        const last7 = results.map(r => ({ date: r.startDate.slice(0, 10), value: Number(r.value) }));
                        const today = last7.length ? last7[last7.length - 1].value : 0;
                        setHkSteps({ today, last7 });
                  }
            );
      };

      const SectionTitle = ({ t }: { t: string }) => <Text style={s.h2}>{t}</Text>;

      return (
            <SafeAreaView style={{ flex: 1, backgroundColor: C.white }}>
                  <AppHeader title="Connect Fitness Devices" onBack={() => navigation.goBack()} />
                  <View style={s.wrap}>
                        <SectionTitle t="Connect To a Device" />

                        {/* Fitbit */}
                        <DeviceCard
                              icon={<Image source={require('../../assets/banners/chana.jpg')} style={s.icon} />}
                              title="Fitbit"
                              status={fitbitAuth ? 'Connected' : 'SETUP'}
                              onPress={connectFitbit}
                        />
                        {fitbitSteps && (
                              <MetricsRow
                                    label="Steps (Fitbit)"
                                    today={fitbitSteps.today}
                                    last7={fitbitSteps.last7}
                              />
                        )}

                        {/* Apple Health (iOS) */}
                        <DeviceCard
                              icon={<Image source={require('../../assets/banners/chana.jpg')} style={s.icon} />}
                              title={"Apple's Health"}
                              status={hkReady ? 'Connected' : Platform.OS === 'ios' ? 'SETUP' : 'iOS only'}
                              disabled={Platform.OS !== 'ios'}
                              onPress={connectAppleHealth}
                        />
                        {hkSteps && (
                              <MetricsRow
                                    label="Steps (Health)"
                                    today={hkSteps.today}
                                    last7={hkSteps.last7}
                              />
                        )}
                  </View>
            </SafeAreaView>
      );
}

/* ---------- UI bits ---------- */

function DeviceCard({
      icon, title, status, onPress, disabled,
}: { icon: React.ReactNode; title: string; status: string; disabled?: boolean; onPress: () => void }) {
      return (
            <View style={s.card}>
                  <View style={s.left}>
                        {icon}
                        <Text style={s.title}>{title}</Text>
                  </View>
                  <TouchableOpacity disabled={disabled} onPress={onPress} activeOpacity={0.9}>
                        <Text style={[s.setup, status !== 'SETUP' && { color: C.ok }]}>{status}</Text>
                  </TouchableOpacity>
            </View>
      );
}

function MetricsRow({
      label, today, last7,
}: { label: string; today: number; last7: { date: string; value: number }[] }) {
      return (
            <View style={s.metrics}>
                  <Text style={s.mTitle}>{label}</Text>
                  <Text style={s.mToday}>Today: {today.toLocaleString()}</Text>
                  <View style={{ height: 8 }} />
                  <View style={{ gap: 6 }}>
                        {last7.map(x => (
                              <View key={x.date} style={s.mRow}>
                                    <Text style={s.mDate}>{x.date}</Text>
                                    <Text style={s.mVal}>{x.value.toLocaleString()}</Text>
                              </View>
                        ))}
                  </View>
            </View>
      );
}

/* ---------- styles ---------- */
const s = StyleSheet.create({
      wrap: { padding: 16 },
      h2: { textAlign: 'center', fontSize: 20, fontWeight: '800', color: C.text, marginVertical: 10 },

      card: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            backgroundColor: C.white, borderRadius: 16, padding: 14, marginTop: 12,
            // shadow
            shadowColor: 'rgba(0,0,0,0.10)', shadowOpacity: 1, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4,
      },
      left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
      icon: { width: 44, height: 44, borderRadius: 10, resizeMode: 'contain' },
      title: { color: C.text, fontWeight: '800', fontSize: 16 },
      setup: { color: C.green, fontWeight: '800' },

      metrics: { backgroundColor: C.chip, borderRadius: 12, padding: 12, marginTop: 8 },
      mTitle: { color: C.text, fontWeight: '700', marginBottom: 2 },
      mToday: { color: C.text, fontWeight: '800' },
      mRow: { flexDirection: 'row', justifyContent: 'space-between' },
      mDate: { color: C.sub },
      mVal: { color: C.text, fontWeight: '700' },
});
