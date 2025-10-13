// CaloriesScreen.tsx
import React, {
  useMemo,
  useCallback,
  useState,
  memo,
  useEffect,
  useRef,
} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { SPACING } from '../../ui/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import {
  getfitBitFoodLog,
  getValidTokens,
  setfitBitFoodLog,
} from '../../config/fitbitService';
import {
  showToastError,
  showToastSuccess,
} from '../../config/ShowToastMessages';

type FieldProps = {
  label: string;
  value: string;
  onChange: (t: string) => void;
  onDone: () => void;
  autoUpdated?: boolean;
};

const Field = memo(
  ({ label, value, onChange, onDone, autoUpdated }: FieldProps) => (
    <View style={styles.fieldWrap}>
      <View style={styles.fieldHeader}>
        <Text style={styles.label}>{label}</Text>
        {autoUpdated ? <Text style={styles.auto}>Auto Updated</Text> : null}
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        onBlur={onDone}
        inputMode="numeric"
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor="#9AA2AF"
        style={styles.input}
        maxLength={5}
        returnKeyType="done"
      />
    </View>
  ),
);

type LogRow = {
  logId: string | number;
  logDate: string;
  name: string;
  calories: number;
  mealTypeId: number;
};

export default function CaloriesScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [snack, setSnack] = useState('');
  const [dinner, setDinner] = useState('');
  const [anytime, setAnyTime] = useState('');

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [summary, setSummary] = useState('');
  const [expanded, setExpanded] = useState(true);

  const onlyDigits = useCallback((t: string) => t.replace(/[^0-9]/g, ''), []);
  const onBreakfast = useCallback(
    (t: string) => setBreakfast(onlyDigits(t)),
    [onlyDigits],
  );
  const onLunch = useCallback(
    (t: string) => setLunch(onlyDigits(t)),
    [onlyDigits],
  );
  const onSnack = useCallback(
    (t: string) => setSnack(onlyDigits(t)),
    [onlyDigits],
  );
  const onDinner = useCallback(
    (t: string) => setDinner(onlyDigits(t)),
    [onlyDigits],
  );
  const onAnyTime = useCallback(
    (t: string) => setAnyTime(onlyDigits(t)),
    [onlyDigits],
  );

  const total = useMemo(() => {
    const n = (...v: string[]) =>
      v.reduce((s, x) => s + (parseInt(x, 10) || 0), 0);
    return n(breakfast, lunch, snack, dinner, anytime);
  }, [breakfast, lunch, snack, dinner, anytime]);

  const didRun = useRef(false);
  const lastFetchAt = useRef(0);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    const now = Date.now();
    if (now - lastFetchAt.current < 60_000) return;
    lastFetchAt.current = now;

    (async () => {
      try {
        const t = await getValidTokens();
        const token = t?.accessToken as string;
        setAccessToken(token);

        const foods = await getfitBitFoodLog(token);
        setSummary(`${foods.summary?.calories?.toFixed(0)}`);
        const mapped: LogRow[] = foods.foods.map((food: any) => ({
          logDate: food.logDate,
          logId: food.logId,
          name: food.loggedFood?.name,
          calories: food.loggedFood?.calories,
          mealTypeId: food.loggedFood?.mealTypeId,
        }));
        setLogs(mapped);
      } catch (e: any) {
        showToastError(e?.message ?? e);
      }
    })();
  }, [breakfast, lunch, snack, dinner, anytime]);

  const updateCalories = async (mealTypeId?: number, calories?: number) => {
    await setfitBitFoodLog(
      accessToken as string,
      'Quick Calories',
      calories ?? 0,
      mealTypeId || 7,
    );
    showToastSuccess('Calories updated successfully');
  };

  // one FlatList = no nested VirtualizedList warning
  const data = expanded ? logs : [];

  const Header = (
    <View style={styles.body}>
      <Field
        label="Breakfast Calories"
        value={breakfast}
        onChange={onBreakfast}
        onDone={() => updateCalories(1, parseInt(breakfast))}
      />
      <Field
        label="Lunch Calories"
        value={lunch}
        onChange={onLunch}
        onDone={() => updateCalories(3, parseInt(lunch))}
      />
      <Field
        label="Snack Calories"
        value={snack}
        onChange={onSnack}
        onDone={() => updateCalories(4, parseInt(snack))}
      />
      <Field
        label="Dinner Calories"
        value={dinner}
        onChange={onDinner}
        onDone={() => updateCalories(5, parseInt(dinner))}
      />
      <Field
        label="Any Time Calories"
        value={anytime}
        onChange={onAnyTime}
        onDone={() => updateCalories(7, parseInt(anytime))}
      />

      {/* total first, not absolute */}
      <View style={styles.totalBar}>
        <Text style={styles.totalText}>
          Total Calories{' '}
          <Text style={styles.totalStrong}>{total <= 0 ? summary : total}</Text>
          <Text style={styles.totalUnit}> cal</Text>
        </Text>
      </View>

      {/* summary toggle */}
      <TouchableOpacity
        onPress={() => setExpanded(v => !v)}
        activeOpacity={0.8}
        style={styles.summaryHeader}
      >
        <Text style={styles.summaryTitle}>Today • Summary</Text>
        <View style={styles.summaryRight}>
          <Text style={styles.summaryTotal}>{summary || '0'}</Text>
          <Text style={styles.chev}>{expanded ? '▴' : '▾'}</Text>
        </View>
      </TouchableOpacity>

      {!expanded && (
        <Text style={styles.collapsedNote}>Expand to view meal logs</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Calories Tracker" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={{ flex: 1 }}
      >
        <FlatList
          data={data}
          keyExtractor={item => String(item.logId)}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowSub}>{item.logDate}</Text>
              </View>
              <Text style={styles.rowKcal}>{item.calories} cal</Text>
            </View>
          )}
          ListHeaderComponent={Header}
          ListEmptyComponent={
            expanded ? <Text style={styles.empty}>No food logs</Text> : null
          }
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { padding: SPACING, paddingBottom: 0 },
  listContent: { paddingBottom: 24 },

  fieldWrap: { marginBottom: 16 },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: { color: '#374151', fontWeight: '600', fontSize: 16 },
  auto: { color: '#0F5C33', fontWeight: '700', fontSize: 12 },
  input: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccccccff',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111827',
  },

  totalBar: {
    backgroundColor: '#F7A500',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  totalText: { color: '#2b2b2b', fontSize: 18, fontWeight: '600' },
  totalStrong: { fontSize: 24, fontWeight: '900', color: '#111' },
  totalUnit: { fontSize: 12, fontWeight: '800', marginLeft: 2 },

  summaryHeader: {
    backgroundColor: '#0B5C2B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: -SPACING,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  summaryRight: { flexDirection: 'row', alignItems: 'center' },
  summaryTotal: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  chev: { color: '#fff', fontSize: 16 },

  row: {
    paddingHorizontal: SPACING,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  rowTitle: { fontSize: 15, color: '#111827', fontWeight: '600' },
  rowSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  rowKcal: { fontSize: 14, color: '#111827', fontWeight: '700' },

  collapsedNote: { paddingVertical: 10, color: '#6b7280', textAlign: 'center' },
  empty: { color: '#6b7280', textAlign: 'center', paddingVertical: 12 },
});
