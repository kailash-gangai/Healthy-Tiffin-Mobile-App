import React, { useMemo, useState } from "react";
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
      Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { COLORS, SHADOW, SPACING } from "../../ui/theme";
import SleepSVG from "../../assets/svg/Sleep-analysis-amico.svg";

type Clock = { h: number; m: number; am: boolean };

const pad = (n: number) => String(n).padStart(2, "0");
const to12 = (h24: number) => {
      const am = h24 < 12;
      const h = h24 % 12 === 0 ? 12 : h24 % 12;
      return { h, am };
};
const to24 = (h12: number, am: boolean) => {
      const h = h12 % 12;
      return am ? h : (h + 12) % 24;
};
const fmt = (t: Clock) => `${pad(t.h === 0 ? 12 : t.h)}:${pad(t.m)} ${t.am ? "AM" : "PM"}`;

export default function SleepTrackerScreen() {
      const navigate = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

      // defaults: 12:00 AM -> 8:00 AM
      const [bed, setBed] = useState<Clock>({ h: 12, m: 0, am: true });
      const [wake, setWake] = useState<Clock>({ h: 8, m: 0, am: true });

      const [open, setOpen] = useState<null | "bed" | "wake">(null);
      const editing = open === "bed" ? bed : wake;

      const [hDraft, setHDraft] = useState(String(editing.h));
      const [mDraft, setMDraft] = useState(pad(editing.m));
      const [amDraft, setAmDraft] = useState(editing.am);

      const total = useMemo(() => {
            const bedMins = to24(bed.h === 12 ? 0 : bed.h, bed.am) * 60 + bed.m;
            const wakeMins = to24(wake.h === 12 ? 0 : wake.h, wake.am) * 60 + wake.m;
            const diff = (wakeMins - bedMins + 24 * 60) % (24 * 60);
            const hrs = Math.floor(diff / 60);
            const mins = diff % 60;
            return { hrs, mins };
      }, [bed, wake]);

      const openModal = (which: "bed" | "wake") => {
            const t = which === "bed" ? bed : wake;
            setHDraft(String(t.h));
            setMDraft(pad(t.m));
            setAmDraft(t.am);
            setOpen(which);
      };

      const submit = () => {
            const h = Math.max(1, Math.min(12, parseInt(hDraft || "0", 10) || 12));
            const mNum = Math.max(0, Math.min(59, parseInt(mDraft || "0", 10) || 0));
            const next: Clock = { h, m: mNum, am: amDraft };
            if (open === "bed") setBed(next);
            if (open === "wake") setWake(next);
            setOpen(null);
      };

      const Card = ({ title, value, onPress, icon }: { title: string; value: string; onPress: () => void; icon: string }) => (
            <Pressable style={styles.card} onPress={onPress}>
                  <Image source={icon} style={styles.cardIcon} />
                  <Text style={styles.cardTitle}>{title}</Text>
                  <Text style={styles.cardValue}>{value}</Text>
            </Pressable>
      );

      return (
            <SafeAreaView>
                  <AppHeader title="Sleep Tracker" onBack={() => navigate.goBack()} />
                  <View style={styles.container}>

                        <View style={styles.header}>
                              <Text style={styles.title}>Select bed and wakeup time to track sleep</Text>
                              <SleepSVG />
                              {/* Cards */}
                              <View style={styles.rowCards}>
                                    <Card title="Bed Time" value={fmt(bed)} onPress={() => openModal("bed")} icon={require("../../assets/icons/moon.png")} />
                                    <Card title="Wake Time" value={fmt(wake)} onPress={() => openModal("wake")} icon={require("../../assets/icons/sun.png")} />
                              </View>
                        </View>


                        {/* Illustration placeholder */}




                        <View>
                              {/* Summary */}
                              <Text style={styles.summary}>
                                    Sleep Hours {total.hrs} hr {total.mins} m
                              </Text>
                              {/* CTA */}
                              <Pressable style={styles.cta} onPress={() => setOpen("bed")}>
                                    <Text style={styles.ctaText}>Update Sleep Data    <FontAwesome5 iconStyle='solid' name="sign-in-alt" size={18} color={COLORS.white} style={{ marginLeft: 8 }} /></Text>
                              </Pressable>
                        </View>

                        {/* Modal */}
                        <Modal visible={open !== null} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
                              <TouchableWithoutFeedback onPress={() => setOpen(null)}>
                                    <View style={styles.backdrop} />
                              </TouchableWithoutFeedback>

                              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.center}>
                                    <View style={styles.sheet}>
                                          <Text style={styles.sheetTitle}>{open === "bed" ? "Bed Time" : "Wake Time"}</Text>

                                          <View style={styles.pickerRow}>
                                                <View style={styles.col}>
                                                      <Text style={styles.label}>Hour</Text>
                                                      <TextInput
                                                            style={[styles.field, styles.bigField, { borderColor: "#0F5C33" }]}
                                                            keyboardType="number-pad"
                                                            value={hDraft}
                                                            onChangeText={(t) => setHDraft(t.replace(/[^0-9]/g, ""))}
                                                            maxLength={2}
                                                      />
                                                </View>

                                                <Text style={styles.colon}>:</Text>

                                                <View style={styles.col}>
                                                      <Text style={styles.label}>Minute</Text>
                                                      <TextInput
                                                            style={[styles.field, styles.bigField]}
                                                            keyboardType="number-pad"
                                                            value={mDraft}
                                                            onChangeText={(t) => setMDraft(t.replace(/[^0-9]/g, "").slice(0, 2))}
                                                            maxLength={2}
                                                      />
                                                </View>

                                                <View style={styles.ampmCol}>
                                                      <Pressable
                                                            style={[styles.amBtn, amDraft && styles.amActive]}
                                                            onPress={() => setAmDraft(true)}
                                                      >
                                                            <Text style={[styles.amText, amDraft && styles.amTextActive]}>AM</Text>
                                                      </Pressable>
                                                      <Pressable
                                                            style={[styles.amBtn, !amDraft && styles.amActive]}
                                                            onPress={() => setAmDraft(false)}
                                                      >
                                                            <Text style={[styles.amText, !amDraft && styles.amTextActive]}>PM</Text>
                                                      </Pressable>
                                                </View>
                                          </View>

                                          <View style={styles.row}>
                                                <Pressable onPress={() => setOpen(null)} style={[styles.btn, styles.btnGhost]}>
                                                      <Text style={[styles.btnText, { color: "#333" }]}>Cancel</Text>
                                                </Pressable>
                                                <Pressable onPress={submit} style={[styles.btn, styles.btnPrimary]}>
                                                      <Text style={[styles.btnText, { color: COLORS.black }]}>Submit</Text>
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
      container: { paddingHorizontal: SPACING, display: "flex", flexDirection: "column", gap: 100 },
      header: {
            alignItems: "center",
            marginVertical: SPACING * 2,
      },
      title: { fontSize: 18, fontWeight: "800", color: COLORS.black, marginBottom: 14 },
      rowCards: { flexDirection: "row", justifyContent: "space-between", marginTop: 18 },
      card: {
            width: "48%",
            borderRadius: 14,
            paddingVertical: 14,
            paddingHorizontal: 12,
            alignItems: "center",
            backgroundColor: COLORS.gray,
            shadowColor: COLORS.white50,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9,
            shadowRadius: 16,
            elevation: 0.5,
            marginHorizontal: 12,
      },
      cardIcon: { marginBottom: 8, height: 96, width: 96, alignItems: "center", justifyContent: "center" },
      cardTitle: { color: "#6B7280", marginBottom: 6, fontWeight: "600" },
      cardValue: { fontSize: 18, fontWeight: "800", color: COLORS.black },

      summary: { textAlign: "center", marginTop: 22, color: COLORS.subText, fontSize: 18, fontWeight: "700" },

      cta: {
            marginTop: 18,
            backgroundColor: COLORS.green,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
      },
      ctaText: { color: COLORS.white, fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },

      // modal
      backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
      center: { flex: 1, justifyContent: "center", paddingHorizontal: 22 },
      sheet: {
            backgroundColor: COLORS.white,
            borderRadius: 16,
            padding: 18,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 16,
      },
      sheetTitle: { fontSize: 18, fontWeight: "700", color: COLORS.black, textAlign: "center", marginBottom: 12 },

      pickerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
      col: { width: 110 },
      colon: { fontSize: 32, marginTop: 18, color: "#6B7280" },
      label: { color: "#6B7280", marginBottom: 6 },
      field: {
            height: 64,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#E1E5EC",
            backgroundColor: COLORS.white,
            paddingHorizontal: 14,
            fontSize: 28,
            fontWeight: "700",
            color: "#0F172A",
      },
      bigField: { textAlign: "center", letterSpacing: 2 },

      ampmCol: { marginLeft: 8, alignItems: "center", justifyContent: "center" },
      amBtn: {
            width: 64,
            height: 32,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#E1E5EC",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: COLORS.white,
            marginVertical: 4,
      },
      amActive: { backgroundColor: "#F7F7F7", borderColor: "#0F5C33" },
      amText: { color: "#6B7280", fontWeight: "700" },
      amTextActive: { color: "#0F5C33" },

      row: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
      btn: { flex: 1, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
      btnGhost: { borderWidth: 1, borderColor: "#E1E5EC", marginRight: 10, backgroundColor: COLORS.white },
      btnPrimary: { backgroundColor: "#F7A500", marginLeft: 10 },
      btnText: { fontSize: 16, fontWeight: "700" },
});
