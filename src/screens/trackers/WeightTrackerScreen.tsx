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
      Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import AppHeader from "../../components/AppHeader";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { COLORS as C, SPACING } from "../../ui/theme";
import FontAwesome5 from "@react-native-vector-icons/FontAwesome5";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { getValidTokens, getfitBitWeight, setfitBitWeight } from "../../config/fitbitService";
import { checkHealthKitConnection } from "../../health/healthkit";
import ContinueIcon from '../../assets/htf-icon/icon-continue.svg';
import appleHealthKit from "react-native-health";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { customerMetafieldUpdate } from "../../shopify/mutation/CustomerAuth";
import { showToastSuccess } from "../../config/ShowToastMessages";
import { getCustomerMetaField } from "../../shopify/query/CustomerQuery";
const { width } = Dimensions.get("window");
const RING_SIZE = Math.min(width * 0.52, 130);
const R = (RING_SIZE - 14) / 2;

export default function WeightTrackerScreen() {
      const user = useSelector((state: RootState) => state.user);
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

      // Check connection for both platforms and fetch data
      useFocusEffect(
            useCallback(() => {
                  let alive = true;
                  (async () => {
                        setLoading(true);
                        setError(null);
                        if (user?.customerToken) {
                              const goalWeight = await getCustomerMetaField(user?.customerToken, 'goal_weight');
                              const currentWeight = await getCustomerMetaField(user?.customerToken, 'cur_weight');
                              setGoal(goalWeight ? Number(goalWeight) : 0);
                              setCurrent(currentWeight ? Number(currentWeight) : 0);
                        }
                        // iOS (Apple Health) or Android (Fitbit) platform check
                        if (Platform.OS === "ios") {
                              const appleHealthConnected = await checkHealthKitConnection();
                              if (!appleHealthConnected) {
                                    navigate.replace("ConnectDevice");
                                    setLoading(false);
                                    return;
                              }
                              // Fetch weight data from Apple Health
                              try {
                                    const weightData = await fetchAppleHealthWeight();
                                    console.log('weightData', weightData);
                                    setCurrent(weightData ? Number(weightData) : 0);

                              } catch (e) {
                                    setError("Failed to load Apple Health weight data.");
                              }
                        } else {
                              const t = await getValidTokens(); // load/refresh from Keychain
                              setAccessToken(t?.accessToken as string);
                              if (!alive) return;
                              if (!t) {
                                    navigate.replace("ConnectDevice"); // not connected → go connect
                                    return;
                              }
                              // Fetch weight data from Fitbit (Android)
                              try {
                                    const s = await getfitBitWeight(t.accessToken, "");
                                    setCurrent(s?.goal.startWeight);
                                    setGoal(s?.goal?.weight);
                                    setStartingDate(s?.goal?.startDate);
                              } catch (e) {
                                    setError(e?.message ?? "Failed to load Fitbit weight data.");
                              }
                        }
                        setLoading(false);
                  })();
                  return () => {
                        alive = false;
                  };
            }, [navigate])
      );

      // Fetch weight data from Apple Health (iOS)
      const fetchAppleHealthWeight = async () => {
            const options = {
                  unit: 'kg', // Specify the unit, e.g., 'kg' or 'lbs'
            };

            return new Promise((resolve, reject) => {
                  appleHealthKit.getLatestWeight(options, (err, results) => {
                        if (err) {
                              // console.error('Error getting latest weight: ', err);
                              reject("Error fetching weight from Apple Health.");
                        } else {
                              // console.log('Latest weight: ', results);
                              // Check if results are available and return it
                              if (results && results.value) {
                                    resolve(results.value);
                              } else {
                                    // console.log('No weight data available.');
                                    resolve(0); // Return default 0 if no data available
                              }
                        }
                  });
            });
      };

      // Submit the weight goal for Fitbit (Android) only
      const submit = async () => {
            const c = parseInt(curDraft, 10);
            const g = parseInt(goalDraft, 10);

            try {
                  if (Platform.OS === "android") {
                        const result = await setfitBitWeight(accessToken as string, startingDate, c, g);
                        console.log("Set weight result", result);
                        setCurrent(c);
                        setGoal(g);
                  }
                  let response = customerMetafieldUpdate([
                        { key: 'cur_weight', value: c, type: 'single_line_text_field' },
                        { key: 'goal_weight', value: g, type: 'single_line_text_field' },
                  ], user?.id ?? '');
                  response.then(res => {
                        setCurrent(c);
                        setGoal(g);
                        // console.log('res', res);
                        if (res.metafieldsSet.metafields.length > 0) {
                              showToastSuccess('Weight updated successfully.');
                        }
                  });


            } catch (e: any) {
                  const msg = typeof e?.message === "string" ? e.message : "Could not update your Fitbit goal. Please try again.";
                  Alert.alert("Error", msg);
            } finally {
                  setOpen(false);
            }
      };

      const showDatePicker = () => {
            setDatePickerVisibility(true);
      };

      const hideDatePicker = () => {
            setDatePickerVisibility(false);
      };

      const handleConfirm = (date) => {
            date = date.toISOString().slice(0, 10); // Format date as yyyy-mm-dd
            setStartingDate(date);
            hideDatePicker();
      };

      return (
            <SafeAreaView>
                  <AppHeader title="Weight Tracker" onBack={() => { navigate.goBack() }} />
                  <View style={s.container}>
                        {/* Current Weight */}
                        <View style={s.section}>
                              <Image source={require('../../assets/icons/overweight.png')} style={s.img} />
                              <Text style={s.q}>Current Weight?</Text>
                              <Text style={s.value}>
                                    {current} <Text style={s.unit}>kg</Text>
                              </Text>
                        </View>
                        <View style={s.divider} />

                        {/* Target Weight */}
                        <View style={s.section}>
                              <Image source={require('../../assets/icons/diet.png')} style={s.img} />
                              <Text style={s.q}>Target Weight?</Text>
                              <Text style={s.value}>
                                    {goal} <Text style={s.unit}>kg</Text>
                              </Text>
                        </View>
                        <View style={s.divider} />

                        {/* Progress Ring */}
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
                                          strokeLinecap="round"
                                    />
                              </Svg>
                              <View style={s.ringCenter}>
                                    <Text style={s.diff}>{goal - current}</Text>
                                    <Text style={s.diffUnit}>kg</Text>
                              </View>
                        </View>

                        {/* CTA Button */}
                        <Pressable
                              style={s.cta}
                              onPress={() => {
                                    setCurDraft(String(current));
                                    setGoalDraft(String(goal));
                                    setOpen(true);
                              }}
                        >
                              <Text style={s.ctaText}>Update Weight <ContinueIcon height={24} width={24} style={{ marginLeft: 8 }} /></Text>
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
                                          <View style={s.addon}><Text style={s.addonText}>kg</Text></View>
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
                                          <View style={s.addon}><Text style={s.addonText}>kg</Text></View>
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
