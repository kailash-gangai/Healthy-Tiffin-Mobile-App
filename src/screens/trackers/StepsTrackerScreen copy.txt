// StepsTrackerScreen.tsx
import React, { useState } from "react";
import {
      View,
      Text,
      StyleSheet,
      Pressable,
      Dimensions,
      Image,
      Modal,
      TextInput,
      KeyboardAvoidingView,
      Platform,
      TouchableWithoutFeedback,
      TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import AppHeader from "../../components/AppHeader";
import { COLORS, SPACING } from "../../ui/theme";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

const { width } = Dimensions.get("window");
const SIZE = Math.min(width * 0.7, 280);
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

const RING_R = R - STROKE / 2;
const CIRCUM = 2 * Math.PI * RING_R;
const stepsProp = 60;
const goalProp = 100;
const pct = goalProp > 0 ? Math.min(stepsProp / goalProp, 1) : 0;
const displayPct = Math.round(pct * 100);

type Props = { steps?: number; goal?: number };
export default function StepsTrackerScreen() {
      const navigate = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
      const [steps] = useState(stepsProp);
      const [goal, setGoal] = useState(goalProp);
      const [open, setOpen] = useState(false);
      const [draft, setDraft] = useState(String(goalProp));


      const submit = () => {
            const n = parseInt(draft, 10);
            if (!Number.isNaN(n) && n > 0) setGoal(n);
            setOpen(false);
      };

      return (
            <SafeAreaView>
                  <AppHeader title="Steps Tracker" onBack={() => navigate.goBack()} />
                  <View style={styles.container}>
                        <View style={styles.card}>
                              <View>
                                    <Text style={styles.progressText}>
                                          You have walked{"\n"}
                                          <Text style={styles.progressPct}>{displayPct}%</Text> of your goal
                                    </Text>
                              </View>

                              <View style={styles.cardShadow}>
                                    <View style={styles.circleCard}>
                                          <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                                                <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke="#F3F5F9" strokeWidth={STROKE} fill="white" />
                                                {/* dotted background ring */}
                                                <Circle
                                                      cx={SIZE / 2}
                                                      cy={SIZE / 2}
                                                      r={R - STROKE / 2}
                                                      stroke="#E5E9F2"
                                                      strokeWidth={4}
                                                      strokeDasharray={[2, 10] as any}
                                                      strokeLinecap="round"
                                                      fill="transparent"
                                                      rotation="-90"
                                                      origin={`${SIZE / 2}, ${SIZE / 2}`}
                                                />

                                                {/* percentage progress arc (solid, exact length) */}
                                                <Circle
                                                      cx={SIZE / 2}
                                                      cy={SIZE / 2}
                                                      r={RING_R}
                                                      stroke={COLORS.oranger}
                                                      strokeWidth={6}
                                                      strokeDasharray={`${CIRCUM} ${CIRCUM}`}   // full length
                                                      strokeDashoffset={CIRCUM * (1 - pct)}     // hide the unfilled part
                                                      strokeLinecap="round"
                                                      fill="transparent"
                                                      transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                                                />
                                          </Svg>

                                          <View style={styles.centerContent}>
                                                <Image source={require("../../assets/icons/walk.png")} style={{ width: 25, height: 45 }} />
                                                <Text style={styles.steps}>{steps.toLocaleString()}</Text>
                                                <Text style={styles.goal}>
                                                      GOAL <Text style={styles.goalBold}>{goal.toLocaleString()}</Text>
                                                </Text>
                                                <Text style={styles.goalSub}>STEPS</Text>
                                          </View>
                                    </View>
                              </View>

                              <View>
                                    <TouchableOpacity
                                          activeOpacity={0.85}
                                          style={styles.cta}
                                          onPress={() => {
                                                setDraft(String(goal));
                                                setOpen(true);
                                          }}
                                    >
                                          <Text style={styles.ctaText}>Update Goal   <FontAwesome5 iconStyle='solid' name="sign-in-alt" size={18} color={COLORS.white} style={{ marginLeft: 8 }} /></Text>
                                    </TouchableOpacity>
                              </View>
                        </View>
                  </View>

                  {/* Modal */}
                  <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
                              <View style={styles.backdrop} />
                        </TouchableWithoutFeedback>

                        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.center}>
                              <View style={styles.sheet}>
                                    <Text style={styles.sheetTitle}>Update Steps</Text>
                                    <Text style={styles.label}>Select your Goal</Text>
                                    <TextInput
                                          value={draft}
                                          onChangeText={(t) => setDraft(t.replace(/[^0-9]/g, ""))}
                                          keyboardType="number-pad"
                                          placeholder="15000"
                                          placeholderTextColor="#9AA2AF"
                                          style={styles.input}
                                    />
                                    <View style={styles.row}>
                                          <Pressable onPress={() => setOpen(false)} style={[styles.btn, styles.btnGhost]}>
                                                <Text style={[styles.btnText, { color: "#333" }]}>Cancel</Text>
                                          </Pressable>
                                          <Pressable onPress={submit} style={[styles.btn, styles.btnPrimary]}>
                                                <Text style={[styles.btnText, { color: COLORS.black }]}>Submit</Text>
                                          </Pressable>
                                    </View>
                              </View>
                        </KeyboardAvoidingView>
                  </Modal>
            </SafeAreaView>
      );
}

const styles = StyleSheet.create({
      container: { paddingHorizontal: SPACING * 2 },
      card: { display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 160 },
      progressText: { marginTop: 18, fontSize: 28, fontWeight: "600", color: COLORS.black, textAlign: "center" },
      progressPct: { color: COLORS.green, fontWeight: "800", fontSize: 16 },

      cardShadow: {
            alignItems: "center",
            marginTop: 22,
            shadowColor: "#6B8CFF",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 12,
      },
      circleCard: {
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            backgroundColor: COLORS.white,
            alignItems: "center",
            justifyContent: "center",
      },
      centerContent: { position: "absolute", alignItems: "center", justifyContent: "center" },
      steps: { fontSize: 44, fontWeight: "800", color: COLORS.oranger, letterSpacing: 1 },
      goal: { marginTop: 2, color: "#777", fontSize: 13, letterSpacing: 0.5 },
      goalBold: { color: COLORS.black, fontWeight: "700" },
      goalSub: { color: "#9AA2AF", fontSize: 12, marginTop: -2, letterSpacing: 2 },

      cta: {
            marginTop: 36,
            backgroundColor: "#0F5C33",
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
      },
      ctaText: { color: "#E8FFF3", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },

      // modal styles
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
      sheetTitle: { fontSize: 18, fontWeight: "700", color: COLORS.black, textAlign: "center", marginBottom: 8 },
      label: { color: "#555", marginTop: 6, marginBottom: 8 },
      input: {
            borderWidth: 1,
            borderColor: "#E1E5EC",
            borderRadius: 10,
            paddingHorizontal: 14,
            height: 48,
            fontSize: 16,
            color: COLORS.black,
            backgroundColor: COLORS.white,
      },
      row: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
      btn: { flex: 1, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
      btnGhost: { borderWidth: 1, borderColor: "#E1E5EC", marginRight: 10, backgroundColor: COLORS.white },
      btnPrimary: { backgroundColor: COLORS.oranger, marginLeft: 10 },
      btnText: { fontSize: 16, fontWeight: "700" },
});
