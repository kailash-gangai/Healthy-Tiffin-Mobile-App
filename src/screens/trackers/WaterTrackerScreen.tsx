// WaterTrackerScreen.tsx
import React, { useState } from "react";
import {
      View,
      Text,
      StyleSheet,
      Pressable,
      Modal,
      TextInput,
      KeyboardAvoidingView,
      Platform,
      TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import DayTabs from "../../components/DayTabs";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { COLORS } from "../../ui/theme";
export default function WaterTrackerScreen() {
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
      const [count, setCount] = useState(10);
      const [goal, setGoal] = useState(56);
      const [open, setOpen] = useState(false);
      const [draft, setDraft] = useState(String(goal));

      const submit = () => {
            const n = parseInt(draft, 10);
            if (!Number.isNaN(n) && n > 0) setGoal(n);
            setOpen(false);
      };

      return (
            <SafeAreaView>
                  <AppHeader title="Water Tracker" onBack={() => navigation.goBack()} />
                  <View style={styles.container}>


                        {/* Tabs */}
                        <DayTabs days={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']} />

                        {/* Illustration placeholder */}

                        {/* Counter Card */}
                        <View style={styles.card}>
                              <Text style={styles.count}>{count}</Text>
                              <Text style={styles.goalText}>
                                    Weekly goal: <Text style={{ fontWeight: "700" }}>{goal} glass</Text>
                              </Text>

                              <View style={styles.row}>
                                    <Pressable style={styles.circleBtn} onPress={() => setCount((c) => Math.max(0, c - 1))}>
                                          <Text style={styles.circleText}>-</Text>
                                    </Pressable>
                                    <View style={styles.glass} />
                                    <Pressable style={styles.circleBtn} onPress={() => setCount((c) => c + 1)}>
                                          <Text style={styles.circleText}>+</Text>
                                    </Pressable>
                              </View>
                        </View>

                        {/* CTA */}
                        <Pressable style={styles.cta} onPress={() => { setDraft(String(goal)); setOpen(true); }}>
                              <Text style={styles.ctaText}>Update Goal    <FontAwesome5 iconStyle='solid' name="sign-in-alt" size={18} color={COLORS.white} style={{ marginLeft: 8 }} /></Text>
                        </Pressable>

                        {/* Modal */}
                        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                              <TouchableWithoutFeedback onPress={() => setOpen(false)}>
                                    <View style={styles.backdrop} />
                              </TouchableWithoutFeedback>
                              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.center}>
                                    <View style={styles.sheet}>
                                          <Text style={styles.sheetTitle}>Update Goal</Text>
                                          <Text style={styles.label}>Select your Goal</Text>
                                          <View style={styles.inputWrap}>
                                                <TextInput
                                                      style={styles.input}
                                                      keyboardType="number-pad"
                                                      value={draft}
                                                      onChangeText={setDraft}
                                                />
                                                <View style={styles.addon}><Text style={styles.addonText}>Glass</Text></View>
                                          </View>
                                          <View style={styles.rowBtns}>
                                                <Pressable onPress={() => setOpen(false)} style={[styles.btn, styles.btnGhost]}>
                                                      <Text style={[styles.btnText, { color: "#333" }]}>Cancel</Text>
                                                </Pressable>
                                                <Pressable onPress={submit} style={[styles.btn, styles.btnPrimary]}>
                                                      <Text style={[styles.btnText, { color: "#111" }]}>Submit</Text>
                                                </Pressable>
                                          </View>
                                    </View>
                              </KeyboardAvoidingView>
                        </Modal>
                  </View>
            </SafeAreaView>
      );
}

const styles = StyleSheet.create({
      container: { padding: 16 },


      card: {
            alignItems: "center",
      },
      count: { fontSize: 40, fontWeight: "800", color: "#111" },
      goalText: { marginTop: 4, fontSize: 14, color: "#6B7280" },
      row: { flexDirection: "row", alignItems: "center", marginTop: 14 },
      circleBtn: {
            width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: "#D1D5DB",
            alignItems: "center", justifyContent: "center",
      },
      circleText: { fontSize: 22, fontWeight: "700" },
      glass: { width: 50, height: 70, backgroundColor: "#FACC15", marginHorizontal: 16, borderWidth: 2, borderColor: "#111" },

      cta: { marginTop: 24, backgroundColor: "#0F5C33", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
      ctaText: { color: "#fff", fontSize: 16, fontWeight: "700" },

      // modal
      backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
      center: { flex: 1, justifyContent: "center", paddingHorizontal: 22 },
      sheet: {
            backgroundColor: "#fff", borderRadius: 16, padding: 18,
            shadowColor: "#000", shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25, shadowRadius: 20, elevation: 16,
      },
      sheetTitle: { fontSize: 18, fontWeight: "700", color: "#111", textAlign: "center", marginBottom: 8 },
      label: { marginBottom: 6, color: "#555" },
      inputWrap: { position: "relative" },
      input: {
            borderWidth: 1, borderColor: "#E1E5EC", borderRadius: 10, paddingHorizontal: 14,
            height: 48, fontSize: 16, color: "#111", backgroundColor: "#fff", paddingRight: 60,
      },
      addon: {
            position: "absolute", right: 6, top: 6, height: 36, minWidth: 48,
            borderRadius: 8, backgroundColor: "#E5E7EB",
            alignItems: "center", justifyContent: "center", paddingHorizontal: 10,
      },
      addonText: { color: "#111", fontWeight: "700" },

      rowBtns: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
      btn: { flex: 1, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
      btnGhost: { borderWidth: 1, borderColor: "#E1E5EC", marginRight: 10, backgroundColor: "#fff" },
      btnPrimary: { backgroundColor: "#F7A500", marginLeft: 10 },
      btnText: { fontSize: 16, fontWeight: "700" },
});
