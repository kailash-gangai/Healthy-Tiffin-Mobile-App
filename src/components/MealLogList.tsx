// MealLogList.tsx
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
      View, Text, SectionList, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions, NativeSyntheticEvent, NativeScrollEvent,
} from "react-native";

type Item = { logDate: string; logId: number; name: string; calories: number; mealTypeId: number };

const MEAL_NAME: Record<number, string> = {
      1: "Breakfast", 2: "Morning Snack", 3: "Lunch", 4: "Afternoon Snack", 5: "Dinner", 7: "Anytime",
};
const ORDER = [7, 5, 4, 3, 1, 2];
const fmt = new Intl.NumberFormat();

export default function MealLogList({
      logs,
      summaryText = "Today • Over budget",
      summary = "summary",
}: {
      logs?: Item[];
      summaryText?: string;
      summary: string;
}) {
      const data = Array.isArray(logs) ? logs : [];

      const sections = useMemo(() => {
            const grouped = data.reduce<Record<number, Item[]>>((acc, it) => {
                  (acc[it.mealTypeId] ??= []).push(it);
                  return acc;
            }, {});
            return Object.entries(grouped)
                  .map(([k, items]) => {
                        const id = Number(k);
                        const total = items.reduce((s, x) => s + (x.calories || 0), 0);
                        return { mealTypeId: id, title: MEAL_NAME[id]?.toUpperCase() ?? "UNKNOWN", total, data: items };
                  })
                  .sort((a, b) => ORDER.indexOf(a.mealTypeId) - ORDER.indexOf(b.mealTypeId));
      }, [data]);

      // ── collapse / expand ────────────────────────────────────────────────────────
      const screenH = Dimensions.get("window").height;
      const EXPANDED_H = Math.round(screenH * 0.45);
      const COLLAPSED_H = 64; // just the summary bar
      const [collapsed, setCollapsed] = useState(false);
      const heightAnim = useRef(new Animated.Value(EXPANDED_H)).current;

      const animateTo = (to: number) => {
            Animated.timing(heightAnim, {
                  toValue: to,
                  duration: 200,
                  easing: Easing.out(Easing.quad),
                  useNativeDriver: false,
            }).start();
      };

      const collapse = () => { if (!collapsed) { setCollapsed(true); animateTo(COLLAPSED_H); } };
      const expand = () => { if (collapsed) { setCollapsed(false); animateTo(EXPANDED_H); } };
      const toggle = () => (collapsed ? expand() : collapse());

      // keep height correct on first render and on orientation change
      useEffect(() => { animateTo(EXPANDED_H); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

      const onListTouchStart = () => expand();
      const onScrollBeginDrag = (_e: NativeSyntheticEvent<NativeScrollEvent>) => expand();

      return (
            <Animated.View style={[styles.panel, { height: heightAnim }]}>
                  <TouchableOpacity activeOpacity={0.85} onPress={toggle}>
                        <View style={styles.summaryBar}>
                              <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Text style={styles.summaryLeft}>{summaryText}</Text>
                                    <FontAwesome5
                                          iconStyle="solid"
                                          name={collapsed ? "chevron-up" : "chevron-down"}
                                          size={16}
                                          color="#FFF"
                                          style={styles.chev}
                                    />
                              </View>
                              <Text style={styles.summaryRight}>{summary}</Text>

                        </View>
                  </TouchableOpacity>

                  {/* When collapsed, visually hide list but keep layout smooth */}
                  {!collapsed && (
                        <SectionList
                              style={styles.list}
                              sections={sections}
                              keyExtractor={(item) => String(item.logId)}
                              renderSectionHeader={({ section }) => (
                                    <View style={styles.sectionHeader}>
                                          <Text style={styles.sectionTitle}>{section.title}</Text>
                                          <Text style={styles.sectionTotal}>{fmt.format(section.total)} calories</Text>
                                    </View>
                              )}
                              renderItem={({ item }) => (
                                    <View style={styles.row}>
                                          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                          <Text style={styles.itemCal}>{fmt.format(item.calories)}</Text>
                                    </View>
                              )}
                              ItemSeparatorComponent={() => <View style={styles.separator} />}
                              stickySectionHeadersEnabled
                              contentContainerStyle={styles.content}
                              // expand when user touches or scrolls the list
                              onTouchStart={onListTouchStart}
                              onScrollBeginDrag={onScrollBeginDrag}
                              keyboardShouldPersistTaps="handled"
                              showsVerticalScrollIndicator
                        />
                  )}
            </Animated.View>
      );
}

const styles = StyleSheet.create({
      panel: {
            position: "absolute",
            left: 0, right: 0, bottom: 45,
            // borderTopLeftRadius: 16, borderTopRightRadius: 16,
            overflow: "hidden",
            backgroundColor: "#FFFFFF",
      },
      summaryBar: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: "#E5E7EB",
            backgroundColor: "#0B5733",
      },
      chev: { marginLeft: 8 },

      summaryLeft: { color: "#FFF", fontWeight: "800", letterSpacing: 0.2, fontSize: 13 },
      summaryRight: { color: "#FFF", fontWeight: "600", fontSize: 13 },

      list: { flex: 1 },
      content: { paddingBottom: 16 },

      sectionHeader: {
            backgroundColor: "#fff",
            paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6,
            flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end",
      },
      sectionTitle: { fontSize: 12, fontWeight: "900", color: "#111827" },
      sectionTotal: { fontSize: 12, color: "#9CA3AF", fontWeight: "800" },

      row: {
            paddingHorizontal: 16, paddingVertical: 12,
            flexDirection: "row", justifyContent: "space-between", alignItems: "center",
      },
      itemName: { fontSize: 14, color: "#111827", fontWeight: "600", maxWidth: "75%" },
      itemCal: { fontSize: 16, color: "#111827", fontWeight: "800" },
      separator: { height: StyleSheet.hairlineWidth, backgroundColor: "#E5E7EB", marginLeft: 16 },
});
