// WaterTrackerScreen.tsx
import React, { useState } from "react";
import {
      View,
      Text,
      StyleSheet,
      Pressable,
      Modal,
      KeyboardAvoidingView,
      Platform,
      TouchableWithoutFeedback,
      ScrollView,
      Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import { COLORS, SPACING } from "../../ui/theme";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import Glass from "../../assets/svg/water-glass.svg";
import DurationTabs from "../../components/DurationTabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type TabKey = "today" | "weekly" | "monthly";

export default function WaterTrackerScreen() {
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
      const [activeTab, setActiveTab] = useState(0); // TAB STATE
      const [count, setCount] = useState(10);
      const [goal, setGoal] = useState(56);
      const [open, setOpen] = useState(false); // modal
      const [draft, setDraft] = useState(String(goal)); // selected value
      const [selectOpen, setSelectOpen] = useState(false); // dropdown open

      const GOAL_OPTIONS = [8, 10, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64];

      const submit = () => {
            const n = parseInt(draft, 10);
            if (!Number.isNaN(n) && n > 0) setGoal(n);
            setOpen(false);
            setSelectOpen(false);
      };


      return (
            <SafeAreaView>
                  <AppHeader title="Water Tracker" onBack={() => navigation.goBack()} />
                  <View style={{ marginVertical: 16 }}>
                        <DurationTabs days={["Today", "Weekly", "Monthly", "Yearly"]} onChange={setActiveTab} />
                  </View>
                  <View style={styles.container}>
                        {/* Tabs */}


                        <View style={styles.imageContainer}>
                              <Image source={require("../../assets/svg/image-drinking.png")} style={styles.image} />
                        </View>



                        {/* Counter Card */}
                        <View style={styles.card}>
                              <Text style={styles.count}>{count}</Text>
                              <Text style={styles.goalText}>
                                    {activeTab === "weekly" ? "Weekly" : activeTab === "today" ? "Daily" : "Monthly"} goal:{" "}
                                    <Text style={{ fontWeight: "700" }}>{goal} glass</Text>
                              </Text>

                              <View style={styles.row}>
                                    <Pressable style={styles.circleBtn} onPress={() => setCount((c) => Math.max(0, c - 1))}>
                                          <FontAwesome5 iconStyle="solid" name="minus" size={16} color={COLORS.black} />

                                    </Pressable>
                                    <Glass />
                                    <Pressable style={styles.circleBtn} onPress={() => setCount((c) => c + 1)}>

                                          <FontAwesome5 iconStyle="solid" name="plus" size={16} color={COLORS.black} />
                                    </Pressable>
                              </View>
                        </View>

                        {/* CTA */}
                        <Pressable
                              style={styles.cta}
                              onPress={() => {
                                    setDraft(String(goal));
                                    setOpen(true);
                                    setSelectOpen(false);
                              }}
                        >
                              <Text style={styles.ctaText}>Update Goal  </Text>
                        </Pressable>

                        {/* Modal with scrollable Select */}
                        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                              <TouchableWithoutFeedback
                                    onPress={() => {
                                          setOpen(false);
                                          setSelectOpen(false);
                                    }}
                              >
                                    <View style={styles.backdrop} />
                              </TouchableWithoutFeedback>

                              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.center}>
                                    <View style={styles.sheet}>
                                          <Text style={styles.sheetTitle}>Update Goal</Text>
                                          <Text style={styles.label}>Select your Goal</Text>

                                          <View style={styles.selectWrap}>
                                                <Pressable style={styles.input} onPress={() => setSelectOpen((v) => !v)}>
                                                      <Text style={styles.selectText}>{draft} Glass</Text>
                                                      <View style={styles.addon}>

                                                            <FontAwesome5 iconStyle='solid' name="chevron-down" size={16} />

                                                      </View>
                                                </Pressable>


                                                {selectOpen && (
                                                      <View style={styles.menu}>
                                                            <ScrollView
                                                                  style={{ maxHeight: 340 }}

                                                            >
                                                                  {GOAL_OPTIONS.map((v) => (
                                                                        <View key={v} >
                                                                              <Pressable
                                                                                    key={v}
                                                                                    style={styles.option}
                                                                                    onPress={() => {
                                                                                          setDraft(String(v));
                                                                                          setSelectOpen(false);
                                                                                    }}
                                                                              >
                                                                                    <Text style={styles.optionText}>{v} Glass</Text>
                                                                              </Pressable>
                                                                        </View>
                                                                  ))}
                                                            </ScrollView>
                                                      </View>
                                                )}
                                          </View>

                                          <View style={styles.rowBtns}>
                                                <Pressable
                                                      onPress={() => {
                                                            setOpen(false);
                                                            setSelectOpen(false);
                                                      }}
                                                      style={[styles.btn, styles.btnGhost]}
                                                >
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
            </SafeAreaView >
      );
}

const styles = StyleSheet.create({
      container: { paddingHorizontal: SPACING * 2, display: "flex", flexDirection: "column", justifyContent: "space-between" },
      imageContainer: { alignItems: "center" },
      image: { height: 300, width: 250, marginTop: 14, },
      tabs: { flexDirection: "row", justifyContent: "space-around", marginTop: 16 },
      tab: {
            flex: 1,
            marginHorizontal: 4,
            paddingVertical: 8,
            borderRadius: 6,
            backgroundColor: "#F3F4F6",
            alignItems: "center",
      },
      tabActive: { backgroundColor: "#0F5C33" },
      tabText: { fontWeight: "600", color: "#6B7280" },
      tabTextActive: { color: "#fff" },

      illus: { height: 140, marginTop: 14, borderRadius: 12, backgroundColor: "#FFEBD6" },

      card: {
            borderRadius: 20,
            padding: 18,
            marginTop: 20,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: COLORS.gray,
            marginVertical: 4,
      },
      count: { fontSize: 40, fontWeight: "800", color: "#111" },
      goalText: { marginTop: 4, fontSize: 14, color: "#6B7280" },
      row: { flexDirection: "row", alignItems: "center", marginTop: 14, gap: 50 },
      circleBtn: {
            width: 55,
            height: 55,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: "#D1D5DB",
            alignItems: "center",
            justifyContent: "center",
      },
      circleText: { fontSize: 32, fontWeight: "700" },
      glass: { width: 50, height: 70, backgroundColor: "#FACC15", marginHorizontal: 16, borderWidth: 2, borderColor: "#111" },

      cta: { marginTop: 24, backgroundColor: "#0F5C33", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
      ctaText: { color: "#fff", fontSize: 22, fontWeight: "700" },

      // modal
      backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
      center: { flex: 1, justifyContent: "center", paddingHorizontal: 22 },
      sheet: {
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 18,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 16,
      },
      sheetTitle: { fontSize: 18, fontWeight: "700", color: "#111", textAlign: "center", marginBottom: 8 },
      label: { marginBottom: 6, color: "#555" },

      // select
      selectWrap: { position: "relative", zIndex: 1 },
      input: {
            borderWidth: 1,
            borderColor: "#E1E5EC",
            borderRadius: 10,
            paddingHorizontal: 14,
            height: 48,
            justifyContent: "center",
            backgroundColor: "#fff",
            paddingRight: 60,
      },
      selectText: { fontSize: 16, color: "#111" },

      addon: {
            position: "absolute",
            right: 6,
            top: 8,
            height: 32,
            width: 32,
            borderRadius: 16,
            backgroundColor: COLORS.white,
            alignItems: "center",
            justifyContent: "center",
            // paddingHorizontal: 10,
            borderColor: COLORS.green,
            borderWidth: 1
      },

      menu: {
            // position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#E1E5EC",
            borderRadius: 10,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 20, // make sure it stays on top on Android

      },
      option: { paddingVertical: 12, paddingHorizontal: 14 },
      optionText: { fontSize: 16, color: "#111" },

      rowBtns: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
      btn: { flex: 1, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
      btnGhost: { borderWidth: 1, borderColor: "#E1E5EC", marginRight: 10, backgroundColor: "#fff" },
      btnPrimary: { backgroundColor: "#F7A500", marginLeft: 10 },
      btnText: { fontSize: 16, fontWeight: "700" },
});
