import React, { useState, useCallback } from "react";
import {
      View,
      Text,
      StyleSheet,
      Pressable,
      Modal,
      TextInput,
      Dimensions,
      KeyboardAvoidingView,
      Platform,
      TouchableWithoutFeedback,
      Image,
      Button,
      Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import AppHeader from "../../components/AppHeader";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { COLORS as C, SPACING } from "../../ui/theme";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { getValidTokens, getfitBitWeight, setfitBitWeight } from "../../config/fitbitService";
import ContinueIcon from '../../assets/htf-icon/icon-continue.svg';

const { width } = Dimensions.get("window");
const RING_SIZE = Math.min(width * 0.52, 130);
const R = (RING_SIZE - 14) / 2;

export default function WeightTrackerScreen() {
      const [current, setCurrent] = useState(0);
      const [goal, setGoal] = useState(0);
      const [open, setOpen] = useState(false);
      const [startingDate, setStartingDate] = useState('');
      const [curDraft, setCurDraft] = useState(String(current));
      const [goalDraft, setGoalDraft] = useState(String(goal));
      const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [accessToken, setAccessToken] = useState<string | null>(null);
      const navigate = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

      //check connection 
      useFocusEffect(
            useCallback(() => {
                  let alive = true;
                  (async () => {
                        setLoading(true);
                        setError(null);
                        const t = await getValidTokens(); // load/refresh from Keychain
                        setAccessToken(t?.accessToken);
                        if (!alive) return;
                        if (!t) {
                              navigate.replace("ConnectDevice"); // not connected → go connect
                              return;
                        }
                        try {
                              const s = await getfitBitWeight(t.accessToken, '');
                              console.log('fitbit weight data', s);
                              setCurrent(s?.goal.startWeight);
                              setGoal(s?.goal?.weight);
                              setStartingDate(s?.goal?.startDate);

                              if (!alive) return;
                        } catch (e: any) {
                              if (!alive) return;
                              setError(e?.message ?? "Failed to load steps");
                        } finally {
                              if (alive) setLoading(false);
                        }
                  })();
                  return () => { alive = false; };
            }, [navigate])
      );
      const submit = async () => {
            const c = parseInt(curDraft, 10);
            const g = parseInt(goalDraft, 10);

            try {
                  const r = await setfitBitWeight(accessToken, startingDate, c, g);
                  console.log('set weight result', r);
                  setCurrent(c);
                  setGoal(g);
                  Alert.alert("Goal updated", `Weight goal set to ${g.toLocaleString()} lbs.`);
            } catch (e: any) {
                  const msg =
                        typeof e?.message === "string" ? e.message :
                              "Could not update your Fitbit goal. Please try again.";
                  Alert.alert("Fitbit error", msg);
            } finally {
                  setOpen(false);
            }
      };

      //check connection and fetch data
      const showDatePicker = () => {
            setDatePickerVisibility(true);
      };

      const hideDatePicker = () => {
            setDatePickerVisibility(false);
      };

      const handleConfirm = (date) => {
            //format date to yyyy-mm-dd
            date = date.toISOString().slice(0, 10);
            setStartingDate(date);
            hideDatePicker();
      };


      return (
            <SafeAreaView >
                  <AppHeader title="Weight Tracker" onBack={() => { navigate.goBack() }} />
                  <View style={s.container}>


                        {/* Current */}
                        <View style={s.section}>
                              <Image source={require('../../assets/icons/overweight.png')} style={s.img} />
                              <Text style={s.q}>Current Weight?</Text>
                              <Text style={s.value}>
                                    {current} <Text style={s.unit}>lbs</Text>
                              </Text>
                        </View>
                        <View style={s.divider} />

                        {/* Target */}
                        <View style={s.section}>
                              <Image source={require('../../assets/icons/diet.png')} style={s.img} />
                              <Text style={s.q}>Target Weight?</Text>
                              <Text style={s.value}>
                                    {goal} <Text style={s.unit}>lbs</Text>
                              </Text>
                        </View>
                        <View style={s.divider} />

                        {/* Ring */}
                        <View style={s.ringWrap}>
                              <Svg width={RING_SIZE} height={RING_SIZE}>
                                    <Circle
                                          cx={RING_SIZE / 2}
                                          cy={RING_SIZE / 2}
                                          r={R}
                                          stroke="#E6F1EA"
                                          strokeWidth={14}
                                          fill="none"
                                    />
                                    <Circle
                                          cx={RING_SIZE / 2}
                                          cy={RING_SIZE / 2}
                                          r={R}
                                          stroke={C.green}
                                          strokeWidth={5}
                                          fill="none"
                                          // strokeDasharray={[20, 20] as any}
                                          strokeLinecap="round"
                                    />
                              </Svg>
                              <View style={s.ringCenter}>
                                    <Text style={s.diff}>{goal - current}</Text>
                                    <Text style={s.diffUnit}>lbs</Text>
                              </View>
                        </View>

                        {/* CTA */}
                        <Pressable
                              style={s.cta}
                              onPress={() => {
                                    setCurDraft(String(current));
                                    setGoalDraft(String(goal));
                                    setOpen(true);
                              }}
                        >
                              <Text style={s.ctaText}>Update Weight    <ContinueIcon height={24} width={24} style={{ marginLeft: 8 }} /></Text>
                        </Pressable>


                  </View>
                  {/* Modal */}
                  <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
                              <View style={s.backdrop} />
                        </TouchableWithoutFeedback>
                        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.center}>
                              <View style={s.sheet}>
                                    <Text style={s.sheetTitle}>Update Weight</Text>

                                    <Text style={s.label}>Starting Date</Text>
                                    <View style={s.inputWrap}>
                                          <TextInput
                                                keyboardType="number-pad"
                                                value={startingDate.toString()}
                                                style={s.input}
                                                placeholder="yyyy-mm-dd" //2019-03-21
                                                placeholderTextColor="#9AA2AF"

                                                onFocus={showDatePicker} />
                                          <DateTimePickerModal
                                                isVisible={isDatePickerVisible}
                                                mode="date"
                                                onConfirm={handleConfirm}
                                                onCancel={hideDatePicker}
                                          />

                                    </View>
                                    <Text style={s.label}>Current Weight</Text>
                                    <View style={s.inputWrap}>
                                          <TextInput
                                                value={curDraft}
                                                onChangeText={setCurDraft}
                                                keyboardType="number-pad"
                                                style={s.input}
                                                placeholder="200"
                                                placeholderTextColor="#9AA2AF"
                                          />
                                          <View style={s.addon}><Text style={s.addonText}>Lbs</Text></View>
                                    </View>

                                    <Text style={[s.label, { marginTop: 10 }]}>Weight Goal</Text>
                                    <View style={s.inputWrap}>
                                          <TextInput
                                                value={goalDraft}
                                                onChangeText={setGoalDraft}
                                                keyboardType="number-pad"
                                                style={s.input}
                                                placeholder="150"
                                                placeholderTextColor="#9AA2AF"
                                          />
                                          <View style={s.addon}><Text style={s.addonText}>Lbs</Text></View>
                                    </View>

                                    <View style={s.row}>
                                          <Pressable style={[s.btn, s.btnGhost]} onPress={() => setOpen(false)}>
                                                <Text style={[s.btnText, { color: "#333" }]}>Cancel</Text>
                                          </Pressable>
                                          <Pressable style={[s.btn, s.btnPrimary]} onPress={submit}>
                                                <Text style={[s.btnText, { color: "#111" }]}>Submit</Text>
                                          </Pressable>
                                    </View>
                              </View>
                        </KeyboardAvoidingView>
                  </Modal>
            </SafeAreaView>
      );
}

const s = StyleSheet.create({
      container: { paddingHorizontal: SPACING * 2 },

      section: { alignItems: "center", paddingVertical: 16 },
      img: { width: 85, height: 85, resizeMode: "contain" },
      q: { fontSize: 22, color: C.black, marginVertical: 6, fontWeight: "600" },
      value: { fontSize: 24, color: C.green, fontWeight: "800" },
      unit: { fontSize: 16, color: C.green, fontWeight: "600" },
      divider: { height: 1, backgroundColor: "#8b8686ff", marginHorizontal: 12 },

      ringWrap: { marginTop: 18, alignItems: "center", justifyContent: "center" },
      ringCenter: { position: "absolute", alignItems: "center", justifyContent: "center" },
      diff: { fontSize: 40, color: C.green, fontWeight: "800" },
      diffUnit: { color: "#8BA799", marginTop: -4 },

      cta: {
            marginTop: 24, backgroundColor: C.green, paddingVertical: 16, borderRadius: 12,
            alignItems: "center", justifyContent: "center",
      },
      ctaText: { color: C.white, fontSize: 18, fontWeight: "700", letterSpacing: 0.5 },

      // modal
      backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
      center: { flex: 1, justifyContent: "center", paddingHorizontal: 22 },
      sheet: {
            backgroundColor: C.white, borderRadius: 16, padding: 18,
            shadowColor: C.black, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 16,
      },
      sheetTitle: { fontSize: 18, fontWeight: "700", color: "#111", textAlign: "center", marginBottom: 8 },
      label: { color: "#555", marginTop: 2, marginBottom: 6 },

      inputWrap: { position: "relative" },
      input: {
            borderWidth: 1, borderColor: "#E1E5EC", borderRadius: 12, paddingHorizontal: 14, height: 48,
            fontSize: 16, color: C.black, backgroundColor: C.white, paddingRight: 60,
      },
      addon: {
            position: "absolute", right: 6, top: 6, height: 36, minWidth: 48, paddingHorizontal: 10,
            borderRadius: 10, backgroundColor: "#E2F0E8", alignItems: "center", justifyContent: "center",
      },
      addonText: { color: C.green, fontWeight: "700" },
      row: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
      btn: { flex: 1, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
      btnGhost: { borderWidth: 1, borderColor: "#E1E5EC", marginRight: 10, backgroundColor: C.white },
      btnPrimary: { backgroundColor: C.oranger, marginLeft: 10 },
      btnText: { fontSize: 16, fontWeight: "700" },
});
