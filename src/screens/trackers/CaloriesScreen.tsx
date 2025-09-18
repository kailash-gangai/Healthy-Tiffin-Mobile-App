// CaloriesScreen.tsx
import React, { useMemo, useCallback, useState, memo, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import { SPACING } from "../../ui/theme";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { getfitBitFoodLog, getValidTokens, setfitBitFoodLog } from "../../config/fitbitService";
import { showToastError, showToastSuccess } from "../../config/ShowToastMessages";
import MealLogList from "../../components/MealLogList";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

type FieldProps = {
      label: string;
      value: string;
      onChange: (t: string) => void;
      onDone: () => void;
      autoUpdated?: boolean;
};

// define once, memoize to avoid remount
const Field = memo(({ label, value, onChange, onDone, autoUpdated }: FieldProps) => (
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
));

export default function CaloriesScreen() {
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

      const [breakfast, setBreakfast] = useState("");
      const [lunch, setLunch] = useState("");
      const [snack, setSnack] = useState("");
      const [dinner, setDinner] = useState("");
      const [accessToken, setAccessToken] = useState<string | null>(null);
      const [getFoodLogs, setGetFoodLogs] = useState({});
      const [summary, setSummary] = useState("");
      // sanitize once
      const onlyDigits = useCallback((t: string) => t.replace(/[^0-9]/g, ""), []);
      const onBreakfast = useCallback((t: string) => setBreakfast(onlyDigits(t)), [onlyDigits]);
      const onLunch = useCallback((t: string) => setLunch(onlyDigits(t)), [onlyDigits]);
      const onSnack = useCallback((t: string) => setSnack(onlyDigits(t)), [onlyDigits]);
      const onDinner = useCallback((t: string) => setDinner(onlyDigits(t)), [onlyDigits]);
      const [anytime, setAnyTime] = useState("");
      const onAnyTime = useCallback((t: string) => setAnyTime(onlyDigits(t)), [onlyDigits]);

      const total = useMemo(() => {
            const n = (...v: string[]) => v.reduce((s, x) => s + (parseInt(x, 10) || 0), 0);
            return n(breakfast, lunch, snack, dinner, anytime);
      }, [breakfast, lunch, snack, dinner, anytime]);

      useEffect(() => {
            (async () => {
                  try {
                        const t = await getValidTokens();
                        const token = t?.accessToken as string;
                        setAccessToken(token);               // keep if other code needs it

                        const foods = await getfitBitFoodLog(token); // use token directly
                        // console.log("fitbit food logs", foods);
                        setSummary(`${foods.summary?.calories?.toFixed(0)}`);
                        const logs = foods.foods.map((food: any) => ({
                              logDate: food.logDate,
                              logId: food.logId,
                              name: food.loggedFood?.name,
                              calories: food.loggedFood?.calories,
                              mealTypeId: food.loggedFood?.mealTypeId,
                        }));
                        setGetFoodLogs(logs);
                        // console.log("grouped foods", logs);
                  } catch (e: any) {
                        showToastError(e?.message ?? e);
                  }
            })();
      }, []);

      const updateCalories = async (mealTypeId?: number, calories?: number) => {
            await setfitBitFoodLog(accessToken as string, 'Quick Calories', calories ?? 0, mealTypeId || 7);
            showToastSuccess("Calories updated successfully");
      }

      return (
            <SafeAreaView style={styles.container}>
                  <AppHeader title="Calories Tracker" onBack={() => navigation.goBack()} />
                  <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={{ flex: 1 }}>
                        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
                              <Field label="Breakfast Calories" value={breakfast} onChange={onBreakfast} onDone={() => updateCalories(1, parseInt(breakfast))} />
                              <Field label="Lunch Calories" value={lunch} onChange={onLunch} onDone={() => updateCalories(3, parseInt(lunch))} />
                              <Field label="Snack Calories" value={snack} onChange={onSnack} onDone={() => updateCalories(4, parseInt(snack))} />
                              <Field label="Dinner Calories" value={dinner} onChange={onDinner} onDone={() => updateCalories(5, parseInt(dinner))} />
                              <Field label="Any Time Calories" value={anytime} onChange={onAnyTime} onDone={() => updateCalories(7, parseInt(anytime))} />

                        </ScrollView>
                  </KeyboardAvoidingView>

                  <MealLogList logs={getFoodLogs} summaryText="Today • Summary" summary={summary} />
                  <View style={styles.totalBar}>
                        <Text style={styles.totalText}>
                              Total Calories : <Text style={styles.totalStrong}>{total <= 0 ? summary : total}</Text>
                              <Text style={styles.totalUnit}>cal</Text>
                        </Text>
                  </View>
            </SafeAreaView >
      );
}

const styles = StyleSheet.create({
      container: { flex: 1 },
      fieldWrap: { marginBottom: 16 },
      fieldHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
      label: { color: "#374151", fontWeight: "600", fontSize: 16 },
      auto: { color: "#0F5C33", fontWeight: "700", fontSize: 12 },
      body: { padding: SPACING },
      input: {
            height: 42,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#ccccccff",
            paddingHorizontal: 14,
            fontSize: 16,
            color: "#111827",
      },
      totalBar: {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#F7A500",
            // paddingVertical: 18,
            alignItems: "center",
      },
      totalText: { color: "#2b2b2b", fontSize: 18, fontWeight: "600", paddingBottom: 24, paddingTop: 12 },
      totalStrong: { fontSize: 24, fontWeight: "900", color: "#111" },
      totalUnit: { fontSize: 12, fontWeight: "800", marginLeft: 2 },
});
