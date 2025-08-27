// CaloriesScreen.tsx
import React, { useMemo, useState } from "react";
import {
      View,
      Text,
      TextInput,
      StyleSheet,
      ScrollView,

} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import DayTabs from "../../components/DayTabs";
import { SPACING } from "../../ui/theme";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
export default function CaloriesScreen() {
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
      const [breakfast, setBreakfast] = useState("200");
      const [lunch, setLunch] = useState("300");
      const [snack, setSnack] = useState("200");
      const [dinner, setDinner] = useState("200");

      const total = useMemo(() => {
            const n = (...v: string[]) =>
                  v.reduce((s, x) => s + (parseInt(x, 10) || 0), 0);
            return n(breakfast, lunch, snack, dinner);
      }, [breakfast, lunch, snack, dinner]);

      const Field = ({
            label,
            value,
            onChange,
            autoUpdated,
      }: {
            label: string;
            value: string;
            onChange: (t: string) => void;
            autoUpdated?: boolean;
      }) => (
            <View style={styles.fieldWrap}>
                  <View style={styles.fieldHeader}>
                        <Text style={styles.label}>{label}</Text>
                        {autoUpdated && <Text style={styles.auto}>Auto Updated</Text>}
                  </View>
                  <TextInput
                        value={value}
                        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ""))}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor="#9AA2AF"
                        style={styles.input}
                  />
            </View>
      );

      return (
            <SafeAreaView style={styles.container}>
                  <AppHeader title="Calories Tracker" onBack={() => navigation.goBack()} />


                  <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
                        <Field label="Breakfast Calorie" value={breakfast} onChange={setBreakfast} />
                        <Field label="Lunch Calorie" value={lunch} onChange={setLunch} autoUpdated />
                        <Field label="Snack Calories" value={snack} onChange={setSnack} />
                        <Field label="Dinner Calories" value={dinner} onChange={setDinner} autoUpdated />
                  </ScrollView>

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
