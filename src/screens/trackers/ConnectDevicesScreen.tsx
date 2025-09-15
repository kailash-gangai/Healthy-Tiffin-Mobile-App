// screens/ConnectDevicesScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { connectFitbit, getValidTokens } from '../../config/fitbitService';
import { initHealth } from '../../health/healthkit';

const C = {
  green: '#0B5733',
  white: '#FFF',
  text: '#232323',
  sub: '#6F6F6F',
  chip: '#F4F5F6',
  ok: '#1FA56A',
};

export default function ConnectDevicesScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<any>(null);
  const redirected = useRef(false); // prevent loops

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const t = await getValidTokens(); // load/refresh from Keychain
        if (!alive) return;
        setTokens(t);
        if (t && !redirected.current) {
          redirected.current = true;
          navigation.reset({ index: 0, routes: [{ name: 'StepsTracker' }] });
          return;
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []); // no nav dep → run once

  const onConnectFitbit = async () => {
    try {
      setLoading(true);
      const t = await connectFitbit(); // OAuth + save tokens securely
      setTokens(t);
      if (!redirected.current) {
        redirected.current = true;
        navigation.reset({ index: 0, routes: [{ name: 'StepsTracker' }] });
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
      // Triggers system prompt on first run. Returns fast if already authorized.
      await initHealth();
    } catch (e: any) {
      // If permission was denied earlier, iOS won’t show the popup again.
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
        onBack={() => navigation.goBack()}
      />
      <View style={s.wrap}>
        <SectionTitle t="Connect To a Device" />

        <DeviceCard
          icon={
            <Image
              source={require('../../assets/banners/chana.jpg')}
              style={s.icon}
            />
          }
          title="Fitbit"
          status={tokens ? 'Connected' : 'SETUP'}
          onPress={onConnectFitbit}
        />

        <DeviceCard
          icon={
            <Image
              source={require('../../assets/banners/chana.jpg')}
              style={s.icon}
            />
          }
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
        <Text style={[s.setup, status !== 'SETUP' && { color: C.ok }]}>
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
    color: C.text,
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
  icon: { width: 44, height: 44, borderRadius: 10, resizeMode: 'contain' },
  title: { color: C.text, fontWeight: '800', fontSize: 16 },
  setup: { color: C.green, fontWeight: '800' },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
});
