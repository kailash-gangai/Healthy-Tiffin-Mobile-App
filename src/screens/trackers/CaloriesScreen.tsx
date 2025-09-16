// CaloriesScreen.tsx
import React, { useMemo, useCallback, useState, memo, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, Platform, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import { SPACING } from "../../ui/theme";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type FieldProps = {
      label: string;
      value: string;
      onChange: (t: string) => void;
      autoUpdated?: boolean;
};

// define once, memoize to avoid remount
const Field = memo(({ label, value, onChange, autoUpdated }: FieldProps) => (
      <View style={styles.fieldWrap}>
            <View style={styles.fieldHeader}>
                  <Text style={styles.label}>{label}</Text>
                  {autoUpdated ? <Text style={styles.auto}>Auto Updated</Text> : null}
            </View>
            <TextInput
                  value={value}
                  onChangeText={onChange}
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

      const [breakfast, setBreakfast] = useState("200");
      const [lunch, setLunch] = useState("300");
      const [snack, setSnack] = useState("200");
      const [dinner, setDinner] = useState("200");

      // sanitize once
      const onlyDigits = useCallback((t: string) => t.replace(/[^0-9]/g, ""), []);
      const onBreakfast = useCallback((t: string) => setBreakfast(onlyDigits(t)), [onlyDigits]);
      const onLunch = useCallback((t: string) => setLunch(onlyDigits(t)), [onlyDigits]);
      const onSnack = useCallback((t: string) => setSnack(onlyDigits(t)), [onlyDigits]);
      const onDinner = useCallback((t: string) => setDinner(onlyDigits(t)), [onlyDigits]);

      const total = useMemo(() => {
            const n = (...v: string[]) => v.reduce((s, x) => s + (parseInt(x, 10) || 0), 0);
            return n(breakfast, lunch, snack, dinner);
      }, [breakfast, lunch, snack, dinner]);
      function logCalories({
            breakfast,
            lunch,
            snack,
            dinner,
            total,
      }: {
            breakfast: string;
            lunch: string;
            snack: string;
            dinner: string;
            total: number;
      }) {
            const data = {
                  breakfast: parseInt(breakfast || "0", 10),
                  lunch: parseInt(lunch || "0", 10),
                  snack: parseInt(snack || "0", 10),
                  dinner: parseInt(dinner || "0", 10),
                  total,
                  date: new Date().toISOString(),
            };
            console.log("Calories data:", data);
      }
      useEffect(() => {
            logCalories({ breakfast, lunch, snack, dinner, total });
      }, [breakfast, lunch, snack, dinner, total]);
      return (
            <SafeAreaView style={styles.container}>
                  <AppHeader title="Calories Tracker" onBack={() => navigation.goBack()} />
                  <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={{ flex: 1 }}>
                        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
                              <Field label="Breakfast Calories" value={breakfast} onChange={onBreakfast} />
                              <Field label="Lunch Calories" value={lunch} onChange={onLunch} />
                              <Field label="Snack Calories" value={snack} onChange={onSnack} />
                              <Field label="Dinner Calories" value={dinner} onChange={onDinner} />
                        </ScrollView>
                  </KeyboardAvoidingView>

                  {/* Sticky total */}
                  <View style={styles.totalBar}>
                        <Text style={styles.totalText}>
                              Total Calories : <Text style={styles.totalStrong}>{total}</Text>
                              <Text style={styles.totalUnit}>cal</Text>
                        </Text>
                  </View>
            </SafeAreaView>
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
            height: 58,
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
            bottom: 40,
            backgroundColor: "#F7A500",
            paddingVertical: 14,
            alignItems: "center",
      },
      totalText: { color: "#2b2b2b", fontSize: 16, fontWeight: "600" },
      totalStrong: { fontSize: 24, fontWeight: "900", color: "#111" },
      totalUnit: { fontSize: 12, fontWeight: "800", marginLeft: 2 },
});
