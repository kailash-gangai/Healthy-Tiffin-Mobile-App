// screens/ConnectDevicesScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { connectFitbit, getValidTokens } from '../../config/fitbitService';
import { initHealth } from '../../health/healthkit';
import { COLORS as C } from '../../ui/theme';
import FitbitLogo from '../../assets/logo-fitbit.svg';
import AppleHealthLogo from '../../assets/logo-apple-health.svg';

export default function ConnectDevicesScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<any>(null);
  const redirected = useRef(false); // prevent loops

  // Initial token check → go Home if already connected
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const t = await getValidTokens();
        if (!alive) return;
        setTokens(t);
        if (t && !redirected.current) {
          redirected.current = true;
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          return;
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [navigation]);

  // Android hardware back → Splash (not Home)
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return () => {};

      // 1) Catch physical back button
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        return true; // consume event
      });

      // 2) Also guard against default "goBack" (gestures or system back fallback)
      const removeBeforeRemove = navigation.addListener(
        'beforeRemove',
        (e: any) => {
          // Intercept only the implicit back action
          if (Platform.OS === 'android' && e.data.action?.type === 'GO_BACK') {
            e.preventDefault();
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          }
        },
      );

      return () => {
        sub.remove();
        removeBeforeRemove();
      };
    }, [navigation]),
  );

  const onConnectFitbit = async () => {
    if (Platform.OS === 'ios') {
      Alert.alert('Fitbit supported only on Android');
      return;
    }
    try {
      setLoading(true);
      const t = await connectFitbit();
      setTokens(t);
      if (!redirected.current) {
        redirected.current = true;
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      }
    } catch (e) {
      console.warn('Fitbit connect error', e);
      setLoading(false);
    }
  };

  const SectionTitle = ({ t }: { t: string }) => <Text style={s.h2}>{t}</Text>;

  const onPressConnect = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Apple Health supported only on IOS');
      return;
    }
    try {
      await initHealth();
    } catch (e: any) {
      console.warn('Health init error', e);
      Alert.alert(
        'Permission needed',
        'Allow step access in Settings > Health > Data Access & Devices.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => Linking.openURL('app-settings:'),
          },
        ],
      );
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.white }}>
      <AppHeader
        title="Connect Fitness Devices"
        // Header back button → Home
        onBack={() => navigation.navigate('Home')}
      />

      <View style={s.wrap}>
        <SectionTitle t="Connect To a Device" />

        <DeviceCard
          icon={<FitbitLogo width={44} height={44} />}
          title="Fitbit"
          status={tokens ? 'Connected' : 'SETUP'}
          onPress={onConnectFitbit}
        />

        <DeviceCard
          icon={<AppleHealthLogo width={44} height={44} />}
          title="Apple Health"
          status={tokens ? 'Connected' : 'SETUP'}
          onPress={onPressConnect}
        />
      </View>

      {loading && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator />
        </View>
      )}
    </SafeAreaView>
  );
}

/* ---------- UI bits ---------- */
function DeviceCard({
  icon,
  title,
  status,
  onPress,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  status: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <View style={s.card}>
      <View style={s.left}>
        {icon}
        <Text style={s.title}>{title}</Text>
      </View>
      <TouchableOpacity
        disabled={disabled}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Text style={[s.setup, status !== 'SETUP' && { color: C.black }]}>
          {status}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------- styles ---------- */
const s = StyleSheet.create({
  wrap: { padding: 16 },
  h2: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: C.black,
    marginVertical: 10,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    shadowColor: 'rgba(0,0,0,0.10)',
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { color: C.black, fontWeight: '800', fontSize: 16 },
  setup: { color: C.green, fontWeight: '800' },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
});
