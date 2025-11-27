import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, KeyboardAvoidingView, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { SHADOW, SPACING } from '../../ui/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getfitBitFoodLog, getValidTokens, setfitBitFoodLog } from '../../config/fitbitService';
import { showToastError, showToastSuccess } from '../../config/ShowToastMessages';
import { checkHealthKitConnection } from '../../health/healthkit'; // for iOS Apple HealthKit
import AppleHealthKit from 'react-native-health'; // Apple HealthKit for iOS

import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DownArrow from '../../assets/newicon/icon-down-arrow-white.svg';

type LogRow = {
  logId: string | number;
  logDate: string;
  foodName: string;
  calories: number;
  mealTypeId: number;
};

export default function CaloriesScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [mealTypeId, setMealTypeId] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [summary, setSummary] = useState('');
  const [expanded, setExpanded] = useState(true);

  const didRun = useRef(false);
  const lastFetchAt = useRef(0);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    const now = Date.now();
    if (now - lastFetchAt.current < 60_000) return;
    lastFetchAt.current = now;

    (async () => {
      fetchFoodLogs();
    })();
  }, []);


  const saveAppleHealthFoodLog = async (foodData: {
    foodName: string;
    calories: number;
    mealType: string;
    date: string;
  }) => {
    const options = {
      foodName: foodData?.foodName,
      energy: foodData?.calories,
      mealType: foodData?.mealType,
      date: foodData?.date,
    };

    if (!foodData.foodName || !foodData.calories || !foodData.mealType || !foodData.date) {
      showToastError('Invalid food data');
      return;
    }

    AppleHealthKit.saveFood(options, (err: string, result: any) => {
      if (err) {
        // console.log('Error saving ÷food to Healthkit: ', err);
        return;
      }
      // console.log('Successfully saved food to Healthkit: ', result);
    });
  };
  const fetchAppleHealthFoodLog = async (date?: string) => {
    console.log('fetchAppleHealthFoodLog', date);
    const options = {
      startDate: date ? new Date(new Date(date).setHours(0, 0, 0, 0)).toISOString() : new Date(new Date().setHours(0, 0, 0, 0)).toISOString(), // Midnight of the given date
      endDate: date ? new Date(new Date(date).setHours(23, 59, 59, 999)).toISOString() : new Date().toISOString(), // End of the given date (11:59:59.999)
      ascending: false,
      limit: 20,
    };
    return new Promise((resolve, reject) => {
      // Fetching Energy Consumed (calories) samples from Apple HealthKit
      AppleHealthKit.getEnergyConsumedSamples(options, (err, results) => {
        if (err) {
          reject('Error fetching food log from Apple Health.');
        } else {
          // console.log('Fetched food log from Apple Health:', results);
          // You can now process the results
          const totalCalories = results.reduce((total, record) => total + (record.value || 0), 0);
          resolve({
            calories: totalCalories,
            logs: results.map((item: any) => ({
              logId: item.id,
              logDate: item.startDate,
              calories: item.value,
              mealType: item.metadata?.HKFoodMeal,
              foodName: item.metadata?.HKFoodType, // May or may not be available
            })),
          });
        }
      });
    });
  };

  const fetchFoodLogs = async (date?: string) => {
    try {
      if (Platform.OS === 'ios') {
        const appleHealthConnected = await checkHealthKitConnection();
        if (!appleHealthConnected) {
          navigation.replace('ConnectDevice');
          return;
        }
        const healthData = await fetchAppleHealthFoodLog(date);
        setSummary(`${healthData?.calories?.toFixed(0)}`);
        setLogs(healthData?.logs ?? []);
      } else {
        const t = await getValidTokens();
        const token = t?.accessToken as string;
        setAccessToken(token);
        const foods = await getfitBitFoodLog(token);
        setSummary(`${foods.summary?.calories?.toFixed(0)}`);
        const mapped: LogRow[] = foods.foods.map((food: any) => ({
          logDate: food.logDate,
          logId: food.logId,
          foodName: food.loggedFood?.name,
          calories: food.loggedFood?.calories,
          mealTypeId: food.loggedFood?.mealTypeId,
        }));
        setLogs(mapped);
      }
    } catch (e: any) {
      showToastError(e?.message ?? 'Error fetching food logs');
    }
  };


  const updateCalories = async () => {
    if (parseInt(calories, 10) === 0 || !calories || !foodName) {
      showToastError('Invalid food data');
      return;
    }
    if (Platform.OS === 'ios') {
      await saveAppleHealthFoodLog({
        foodName: foodName,
        calories: parseInt(calories, 10) || 0,
        mealType: mealTypeId == 1 ? 'Breakfast' : mealTypeId == 3 ? 'Lunch' : mealTypeId == 4 ? 'Snack' : 'Dinner',
        date: date || new Date().toISOString(),
      })
    } else {
      await setfitBitFoodLog(
        accessToken as string,
        foodName,
        parseInt(calories, 10) || 0,
        mealTypeId || 7,
      );
    }
    setCalories('');
    setFoodName('');
    mealTypeId && setMealTypeId(0);
    //reloadData();
    fetchFoodLogs();
    showToastSuccess('Calories updated successfully');
  };
  const MealType: Record<number, string> = {
    1: 'Breakfast',
    2: 'Lunch',
    3: 'Snack',
    4: 'Dinner',
  };

  const data = expanded ? logs : [];
  // Handle date selection
  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirmDate = (date: Date) => {
    setDate(date.toISOString()); // Set the full date-time string (ISO format)
    hideDatePicker();
    fetchFoodLogs(date);
  };

  const Header = (
    <View style={styles.body}>

      {/* Date Picker */}
      <TouchableOpacity onPress={showDatePicker} style={styles.inputWrap}>
        <Text style={styles.label}>Date & Time</Text>
        <Text style={styles.inputText}>{date || 'Select Date & Time'}</Text>
      </TouchableOpacity>
      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
      />

      {/* Food Name */}
      <TextInput
        style={styles.input}
        value={foodName}
        onChangeText={setFoodName}
        placeholder="Food Name"
      />

      {/* Calories Input */}
      <TextInput
        style={styles.input}
        value={calories}
        onChangeText={setCalories}
        placeholder="Calories"
        keyboardType="numeric"
      />

      {/* Meal Type */}
      <View style={styles.mealTypeContainer}>
        {Object.keys(MealType).map((key) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.mealTypeButton,
              mealTypeId === parseInt(key) && styles.selectedMealType,
            ]}
            onPress={() => setMealTypeId(parseInt(key))}
          >
            <Text
              style={[
                styles.mealTypeButtonText,
                mealTypeId === parseInt(key) && styles.selectedMealTypeText,
              ]}
            >
              {MealType[parseInt(key)]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={() => updateCalories()} activeOpacity={0.8} style={styles.totalBar}>
        <Text style={styles.totalText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setExpanded(v => !v)}
        activeOpacity={0.8}
        style={styles.summaryHeader}
      >
        <Text style={styles.summaryTitle}>Today • Summary</Text>
        <View style={styles.summaryRight}>
          <Text style={styles.summaryTotal}>{summary || '0'}</Text>
          <Text style={styles.chev}><DownArrow style={expanded ? { transform: [{ rotate: '180deg' }] } : {}} width={16} height={16} /></Text>
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

      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
        <FlatList
          data={data}
          keyExtractor={item => String(item.logId)}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rowSub}>{item.logDate}</Text>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.rowTitle}>{item.foodName}</Text>
                <Text style={styles.rowKcal}>{item.calories} cal</Text>
              </View>
            </View>
          )}
          ListHeaderComponent={Header}
          ListEmptyComponent={expanded ? <Text style={styles.empty}>No food logs</Text> : null}
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
    borderRadius: 7,

    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111827',

    marginBottom: 8,
    ...SHADOW,
  },
  inputWrap: {
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    ...SHADOW,
  },
  inputText: { fontSize: 16, color: '#666' },

  mealTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  mealTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    ...SHADOW
  },
  selectedMealType: { backgroundColor: '#F7A500', borderColor: '#F7A500' },
  mealTypeButtonText: { fontSize: 16, color: '#111' },
  selectedMealTypeText: { color: '#fff' },
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
  totalText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
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
