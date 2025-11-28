import React, { useState, useCallback, useEffect } from "react";
import {
      View,
      Text,
      StyleSheet,
      TouchableOpacity,
      Modal,
      TextInput,
      Pressable,
      Alert,
      Platform,
      Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { getValidTokens, getfitBitData, setActivityGoal } from "../../config/fitbitService";
import { checkHealthKitConnection, getTodaySteps } from "../../health/healthkit";
import Svg, { Circle } from "react-native-svg";
import FontAwesome5 from "@react-native-vector-icons/FontAwesome5";
import AppHeader from "../../components/AppHeader";
import { COLORS, SPACING } from "../../ui/theme";
import appleHealthKit from "react-native-health";
import { showToastSuccess } from "../../config/ShowToastMessages";
import { customerMetafieldUpdate } from "../../shopify/mutation/CustomerAuth";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { getCustomerMetaField } from "../../shopify/query/CustomerQuery";

// Constants for the circular progress display
const SIZE = 280;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;
const RING_R = R - STROKE / 2;
const CIRCUM = 2 * Math.PI * RING_R;

export default function StepsTrackerScreen() {
      const user = useSelector((state: RootState) => state.user);
      const navigate = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
      const [goal, setGoal] = useState(0);
      const [steps, setSteps] = useState(0);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [accessToken, setAccessToken] = useState<string | null>(null);
      const [open, setOpen] = useState(false);
      const [draft, setDraft] = useState(String(0));
      const [saving, setSaving] = useState(false);

      // Check connection and fetch data on platform
      useEffect(() => {

            const checkConnectionAndFetchData = async () => {
                  setLoading(true);
                  setError(null);
                  if (user?.customerToken) {
                        const stepsGoal = await getCustomerMetaField(user?.customerToken, 'steps_goal');
                        console.log('stepsGoal', stepsGoal);
                        setGoal(stepsGoal ? Number(stepsGoal) : 0);
                  }
                  if (Platform.OS === "ios") {
                        // iOS: Check Apple HealthKit connection
                        const appleHealthConnected = await checkHealthKitConnection();
                        if (!appleHealthConnected) {
                              navigate.replace("ConnectDevice");
                              setLoading(false);
                              return;
                        }
                        // Fetch steps and goal from Apple Health
                        try {
                              const appleHealthData = await fetchAppleHealthData();
                              setSteps(appleHealthData?.steps);
                        } catch (e) {
                              setError("Failed to load Apple Health data.");
                        }
                  } else {
                        // Android: Check Fitbit connection
                        try {
                              const tokens = await getValidTokens();
                              setAccessToken(tokens?.accessToken);
                              if (!tokens?.accessToken) {
                                    navigate.replace("ConnectDevice");
                                    setLoading(false);
                                    return;
                              }
                              // Fetch steps and goal from Fitbit
                              const fitbitData = await fetchFitbitData(tokens.accessToken);
                              setGoal(fitbitData.goal);
                              setSteps(fitbitData.steps);
                        } catch (e) {
                              setError("Failed to load Fitbit data.");
                        }
                  }
                  setLoading(false);
            };

            checkConnectionAndFetchData();
      }, [navigate]);

      const fetchAppleHealthData = async () => {
            try {
                  // Get today's date
                  const today = new Date();
                  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString(); // Midnight of today
                  const endOfDay = new Date().toISOString(); // Current time

                  // Query options for today's step count
                  const options = {
                        startDate: startOfDay,
                        endDate: endOfDay,
                  };

                  // Fetch step count data from Apple Health
                  return new Promise((resolve, reject) => {
                        appleHealthKit.getDailyStepCountSamples(options, (err, results) => {
                              if (err) {
                                    reject("Failed to fetch steps from Apple Health");
                              } else {
                                    // Summing up the steps for today
                                    const steps = results.reduce((total, item) => total + item.value, 0);
                                    resolve({

                                          steps: steps,
                                    });
                              }
                        });
                  });
            } catch (error) {
                  console.error("Error fetching Apple Health data:", error);
                  throw new Error("Failed to fetch Apple Health data");
            }
      };
      const fetchFitbitData = async (token: string) => {
            // Function to fetch Fitbit data (steps and goal)
            const data = await getfitBitData(token, "");
            return {
                  goal: data?.goals?.steps || 10000, // Fetch steps goal from Fitbit
                  steps: data?.summary?.steps || 0,  // Fetch steps count from Fitbit
            };
      };

      const pct = goal > 0 ? Math.min(steps / goal, 1) : 0;
      const displayPct = Math.round(pct * 100);

      const submit = () => {
            const n = parseInt(draft, 10);
            if (Number.isNaN(n) || n <= 0) {
                  Alert.alert("Invalid goal", "Enter a positive number.");
                  return;
            }
            try {
                  setSaving(true);
                  if (Platform.OS === "android") {
                        // Set goal only for Fitbit (Android)
                        setActivityGoal(accessToken as string, "daily", "steps", n);
                  }
                  let response = customerMetafieldUpdate([
                        { key: 'steps_goal', value: n, type: 'number_integer' },
                  ], user?.id ?? '');
                  response.then(res => {
                        setGoal(n);
                        // console.log('res', res);
                        if (res.metafieldsSet.metafields.length > 0) {
                              showToastSuccess('Goal updated successfully.');
                        }
                  });
                  setOpen(false);
            } catch (e: any) {
                  const msg = typeof e?.message === "string" ? e.message : "An error occurred. Please try again.";
                  Alert.alert("Error", msg);
            } finally {
                  setSaving(false);
            }
      };


      if (loading) {
            return <Text>Loading...</Text>;
      }

      if (error) {
            return <Text>Error: {error}</Text>;
      }

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
                                                <Circle
                                                      cx={SIZE / 2}
                                                      cy={SIZE / 2}
                                                      r={RING_R}
                                                      stroke={COLORS.oranger}
                                                      strokeWidth={6}
                                                      strokeDasharray={`${CIRCUM} ${CIRCUM}`}
                                                      strokeDashoffset={CIRCUM * (1 - pct)}
                                                      strokeLinecap="round"
                                                      fill="transparent"
                                                      transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                                                />
                                          </Svg>

                                          <View style={styles.centerContent}>
                                                <Image source={require("../../assets/icons/running.png")} style={{ width: 25, height: 45 }} />
                                                <Text style={styles.steps}>{steps.toLocaleString()}</Text>
                                                <Text style={styles.goal}>
                                                      GOAL <Text style={styles.goalBold}>{goal.toLocaleString()}</Text>
                                                </Text>
                                                <Text style={styles.goalSub}>STEPS</Text>
                                          </View>
                                    </View>
                              </View>

                              <TouchableOpacity
                                    activeOpacity={0.85}
                                    style={styles.cta}
                                    onPress={() => {
                                          setDraft(String(goal));
                                          setOpen(true);
                                    }}
                              >
                                    <Text style={styles.ctaText}>Update Goal</Text>
                              </TouchableOpacity>
                        </View>
                  </View>

                  <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                        <Pressable onPress={() => setOpen(false)} style={styles.backdrop}>
                              <View style={styles.center}>
                                    <View style={styles.sheet}>
                                          <Text style={styles.sheetTitle}>Update Steps</Text>
                                          <TextInput
                                                value={draft}
                                                onChangeText={(t) => setDraft(t.replace(/[^0-9]/g, ""))}
                                                keyboardType="number-pad"
                                                placeholder="15000"
                                                style={styles.input}
                                          />
                                          <View style={styles.row}>
                                                <Pressable onPress={() => setOpen(false)} style={styles.btn}>
                                                      <Text style={styles.btnText}>Cancel</Text>
                                                </Pressable>
                                                <Pressable onPress={submit} style={[styles.btn, styles.btnPrimary]}>
                                                      <Text style={styles.btnText}>Submit</Text>
                                                </Pressable>
                                          </View>
                                    </View>
                              </View>
                        </Pressable>
                  </Modal>
            </SafeAreaView>
      );
}

const styles = StyleSheet.create({
      container: {
            paddingHorizontal: SPACING * 2,
      },
      card: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 80,
      },
      progressText: {
            marginTop: 18,
            fontSize: 28,
            fontWeight: "600",
            color: COLORS.black,
            textAlign: "center",
      },
      progressPct: {
            color: COLORS.green,
            fontWeight: "800",
            fontSize: 16,
      },

      // Card Shadow and Circle Progress Styles
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
      centerContent: {
            position: "absolute",
            alignItems: "center",
            justifyContent: "center",
      },
      steps: {
            fontSize: 44,
            fontWeight: "800",
            color: COLORS.oranger,
            letterSpacing: 1,
      },
      goal: {
            marginTop: 2,
            color: "#777",
            fontSize: 13,
            letterSpacing: 0.5,
      },
      goalBold: {
            color: COLORS.black,
            fontWeight: "700",
      },
      goalSub: {
            color: "#9AA2AF",
            fontSize: 12,
            marginTop: -2,
            letterSpacing: 2,
      },

      // CTA Button
      cta: {
            marginTop: 36,
            backgroundColor: "#0F5C33",
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
      },
      ctaText: {
            color: "#E8FFF3",
            fontSize: 16,
            fontWeight: "700",
            letterSpacing: 0.5,
      },

      // Modal Styles
      backdrop: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.55)",
      },
      center: {
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: 22,
      },
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
      sheetTitle: {
            fontSize: 18,
            fontWeight: "700",
            color: COLORS.black,
            textAlign: "center",
            marginBottom: 8,
      },
      label: {
            color: "#555",
            marginTop: 6,
            marginBottom: 8,
      },
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

      // Button Styles in Modal
      row: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 14,
      },
      btn: {
            flex: 1,
            height: 44,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
      },
      btnGhost: {
            borderWidth: 1,
            borderColor: "#E1E5EC",
            marginRight: 10,
            backgroundColor: COLORS.white,
      },
      btnPrimary: {
            backgroundColor: COLORS.oranger,
            marginLeft: 10,
      },
      btnText: {
            fontSize: 16,
            fontWeight: "700",
      },
});

