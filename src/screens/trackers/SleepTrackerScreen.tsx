import React, { useMemo, useState, useCallback } from "react";
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
      Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { COLORS, SPACING } from "../../ui/theme";
import SleepSVG from "../../assets/svg/Sleep-analysis-amico.svg";
import { getValidTokens, getfitBitSleepgoal, setfitBitSleepgoal } from "../../config/fitbitService";
import { checkHealthKitConnection } from "../../health/healthkit";
import AppleHealthKit from "react-native-health";
import { customerMetafieldUpdate } from "../../shopify/mutation/CustomerAuth";
import { showToastSuccess } from "../../config/ShowToastMessages";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { getCustomerMetaField } from "../../shopify/query/CustomerQuery";

type Clock = { h: number | null; m: number | null; am: boolean | null };

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
const fmt = (t: Clock) => `${pad((t.h ?? 12) === 0 ? 12 : (t.h ?? 12))}:${pad(t.m ?? 0)} ${t.am ? "AM" : "PM"}`;
const fmt24 = (t: Clock) => {
      let h = (t.h ?? 12) % 12;
      if (!t.am) h += 12;
      return `${pad(h)}:${pad(t.m ?? 0)}`;
};

export default function SleepTrackerScreen() {
      const user = useSelector((state: RootState) => state.user);
      const navigate = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
      const [bed, setBed] = useState<Clock>({ h: null, m: null, am: null });
      const [wake, setWake] = useState<Clock>({ h: null, m: null, am: null });

      const [open, setOpen] = useState<null | "bed" | "wake">(null);
      const editing = open === "bed" ? bed : wake;
      const [hDraft, setHDraft] = useState(String(editing.h));
      const [mDraft, setMDraft] = useState(pad(editing.m ?? 0));
      const [amDraft, setAmDraft] = useState(editing.am);
      const [accessToken, setAccessToken] = useState<string | null>(null);
      const [saving, setSaving] = useState(false);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);

      const total = useMemo(() => {
            const bedHour = bed.h === null ? 12 : bed.h;
            const bedMinute = bed.m === null ? 0 : bed.m;
            const bedAm = bed.am === null ? true : bed.am;
            const wakeHour = wake.h === null ? 8 : wake.h;
            const wakeMinute = wake.m === null ? 0 : wake.m;
            const wakeAm = wake.am === null ? true : wake.am;

            const bedMins = to24(bedHour === 12 ? 0 : bedHour, bedAm) * 60 + bedMinute;
            const wakeMins = to24(wakeHour === 12 ? 0 : wakeHour, wakeAm) * 60 + wakeMinute;
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

      useFocusEffect(
            useCallback(() => {
                  let alive = true;
                  (async () => {
                        setLoading(true);
                        setError(null);
                        if (user?.customerToken) {
                              const bed_time = await getCustomerMetaField(user?.customerToken, 'bed_time');
                              const wake_up_time = await getCustomerMetaField(user?.customerToken, 'wake_up_time');
                              if (bed_time) {
                                    const [b_hrs, b_mins] = bed_time.split(":").map(Number);
                                    setBed({
                                          h: to12(b_hrs).h,
                                          m: b_mins,
                                          am: to12(b_hrs).am,
                                    });
                              }
                              if (wake_up_time) {
                                    const [w_hrs, w_mins] = wake_up_time.split(":").map(Number);
                                    setWake({
                                          h: to12(w_hrs).h,
                                          m: w_mins,
                                          am: to12(w_hrs).am,
                                    });
                              }
                        }
                        // iOS (Apple Health) or Android (Fitbit) platform check
                        if (Platform.OS === "ios") {
                              const appleHealthConnected = await checkHealthKitConnection();
                              if (!appleHealthConnected) {
                                    navigate.replace("ConnectDevice");
                                    setLoading(false);
                                    return;
                              }

                        } else {
                              const t = await getValidTokens(); // load/refresh from Keychain
                              setAccessToken(t?.accessToken ?? null);
                              if (!alive) return;
                              if (!t) {
                                    navigate.replace("ConnectDevice"); // not connected → go connect
                                    return;
                              }
                              // Fetch sleep goal data from Fitbit (Android)
                              // try {
                              //       const goals = await getfitBitSleepgoal(t.accessToken);
                              //       const [b_hrs, b_mins] = goals?.goal?.bedtime.split(":").map(Number);
                              //       setBed({
                              //             h: to12(b_hrs).h,
                              //             m: b_mins,
                              //             am: to12(b_hrs).am,
                              //       });
                              //       const [w_hrs, w_mins] = goals?.goal?.wakeupTime.split(":").map(Number);
                              //       setWake({
                              //             h: to12(w_hrs).h,
                              //             m: w_mins,
                              //             am: to12(w_hrs).am,
                              //       });
                              // } catch (e) {
                              //       setError(e?.message ?? "Failed to load Fitbit sleep data.");
                              // }
                        }

                        setLoading(false);
                  })();
                  return () => {
                        alive = false;
                  };
            }, [navigate])
      );

      // For iOS (Apple Health) to fetch sleep goal data
      const fetchAppleHealthSleepgoal = async () => {
            return new Promise((resolve, reject) => {
                  AppleHealthKit.getSleepSamples(
                        { startDate: new Date().toISOString() }, // You can adjust the date range
                        (err, results) => {
                              console.log('Sleep goal data:', results);
                              if (err) {
                                    reject("Error fetching sleep goal from Apple Health.");
                              } else {
                                    resolve(results[0] || { bedtime: "00:00", wakeupTime: "08:00" });
                              }
                        }
                  );
            });
      };

      const submit = () => {
            const h = Math.max(1, Math.min(12, parseInt(hDraft || "0", 10) || 12));
            const mNum = Math.max(0, Math.min(59, parseInt(mDraft || "0", 10) || 0));
            const next: Clock = { h, m: mNum, am: amDraft };

            // convert to ms
            let bedtime = fmt24(bed);
            let wakeupTime = fmt24(wake);
            if (open === "bed") {
                  setBed(next);
                  bedtime = fmt24(next);
            }
            if (open === "wake") {
                  setWake(next);
                  wakeupTime = fmt24(next);
            }

            let minDuration = diffMinutes(bedtime, wakeupTime);
            const minutes = minDuration.hrs * 60 + minDuration.mins;
            console.log('minutes', bedtime);
            let response = customerMetafieldUpdate([
                  { key: open === "bed" ? 'bed_time' : 'wake_up_time', value: open === "bed" ? bedtime.toString() : wakeupTime.toString(), type: 'single_line_text_field' },
            ], user?.id ?? '');
            response.then(res => {

                  if (res.metafieldsSet.metafields.length > 0) {
                        showToastSuccess('Updated successfully.');
                  }
            });
            if (Platform.OS === "android") {
                  setfitBitSleepgoal(accessToken || "", bedtime, wakeupTime, minutes);
            }
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
                                    <Card title="Bed Time" value={fmt(bed)} onPress={() => openModal("bed")} icon={require("../../assets/icons/moon1.png")} />
                                    <Card title="Wake Time" value={fmt(wake)} onPress={() => openModal("wake")} icon={require("../../assets/icons/sun.png")} />
                              </View>
                        </View>

                        <View>
                              <Text style={styles.summary}>
                                    Sleep Hours {total.hrs} hr {total.mins} m
                              </Text>
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
                                                      <Pressable style={[styles.amBtn, amDraft && styles.amActive]} onPress={() => setAmDraft(true)}>
                                                            <Text style={[styles.amText, amDraft && styles.amTextActive]}>AM</Text>
                                                      </Pressable>
                                                      <Pressable style={[styles.amBtn, !amDraft && styles.amActive]} onPress={() => setAmDraft(false)}>
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

function diffMinutes(start: string, end: string) {
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);

      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;

      let diff = endMin - startMin;
      if (diff < 0) diff += 24 * 60; // cross midnight

      const hrs = Math.floor(diff / 60);
      const mins = diff % 60;
      return { hrs, mins };
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
