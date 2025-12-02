import React, { useEffect, useRef, useState } from "react";
import { FlatList, Text, TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";
import ArrowLeftIcon from "../assets/newicon/left-arrow.svg";
import ArrowRightIcon from "../assets/newicon/right-arrow.svg";
import LinearGradient from "react-native-linear-gradient";
import Divider from "../assets/newicon/divider.svg";
import { SHADOW, SPACING } from "../ui/theme";
import {
  getAllMetaobjects,
  getMetaObjectByHandle,
} from "../shopify/queries/getMetaObject";

const ITEM_W = 60;
const SCREEN_W = Dimensions.get("window").width;
const SIDE_SPACER = (SCREEN_W - ITEM_W) / 2;

type Field = { key: string; value: string };
type MenuDay = {
  id: string;
  date: string;
  jsDate: Date;
  labelDay: string;
  dayNum: string;
  month: string;
  fields: Field[];
};

export default function DayTabs({
  activeIndex,
  onChange,
}: {
  activeIndex: number;
  onChange?: (data: {
    id: string;
    index: number;
    day: string;
    date: string;
  }) => void;
}) {
  const listRef = useRef<FlatList<MenuDay>>(null);
  const [menuDays, setMenuDays] = useState<MenuDay[]>([]);
  const [active, setActive] = useState(activeIndex);

  /* ============================================================
     1) LOAD METAOBJECTS & APPLY RULES
     ============================================================ */
  useEffect(() => {
    (async () => {
      const metaobjects = await getAllMetaobjects("menu_products_monthly");
      if (!metaobjects?.length) return;

      const allData: any[] = await Promise.all(
        metaobjects.map((m) => getMetaObjectByHandle(m.id))
      );

      const parsed = buildMenuDays(metaobjects, allData);
      setMenuDays(parsed);
    })();
  }, []);

  /** Build the menu days from metaobjects + fields */
  const buildMenuDays = (metaobjects: any[], allData: any[]): MenuDay[] => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const result: MenuDay[] = allData
      .map((fieldsArr, idx) => {
        if (!Array.isArray(fieldsArr)) return null;

        const fields = fieldsArr as Field[];
        const menuDate = fields.find((f) => f.key === "menu_date")?.value;
        if (!menuDate) return null;

        const d = new Date(menuDate);
        d.setHours(0, 0, 0, 0);

        if (d < now) return null;

        return {
          id: metaobjects[idx].id,
          date: menuDate,
          jsDate: d,
          labelDay: d.toLocaleString("en-US", { weekday: "long" }),
          dayNum: String(d.getDate()).padStart(2, "0"),
          month: d.toLocaleString("en-US", { month: "long" }),
          fields,
        };
      })
      .filter(Boolean) as MenuDay[];

    return result.sort((a, b) => a.jsDate.getTime() - b.jsDate.getTime());
  };

  /* ============================================================
     2) SCROLL CENTER UTILITY
     ============================================================ */
  const centerItem = (index: number, animated = true) => {
    if (!menuDays.length) return;

    setTimeout(() => {
      try {
        listRef.current?.scrollToIndex({
          index,
          viewPosition: 0.5, // use spaces for proper centering
          animated,
        });
      } catch {
        listRef.current?.scrollToOffset({
          offset: Math.max(0, index * ITEM_W),
          animated,
        });
      }
    }, 20);
  };

  useEffect(() => {
    if (menuDays.length) {
      // Whenever active changes, scroll to the correct day
      centerItem(active, false);
    }
  }, [menuDays, active]);

  /* ============================================================
     3) SELECT A DAY
     ============================================================ */
  const select = (i: number) => {
    if (i < 0 || i >= menuDays.length) return;

    setActive(i);  // Set the active day index
    centerItem(i);

    const item = menuDays[i];
    onChange?.({
      id: item.id,
      index: i,
      day: item.labelDay,
      date: item.date,
    });
  };

  /* ============================================================
     4) HEADER LABEL
     ============================================================ */
  const weekRangeLabel = () => {
    if (!menuDays.length) return "";
    const first = menuDays[0];
    const last = menuDays[menuDays.length - 1];

    return `${first.dayNum} ${first.month} - ${last.dayNum} ${last.month}`;
  };

  /* ============================================================
     5) RENDER
     ============================================================ */
  const renderItem = ({ item, index }: { item: MenuDay; index: number }) => {
    const isActive = index === active;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => select(index)}
        style={s.dayItem}
      >
        <Text style={[s.dayName, isActive && s.activeDayName]}>
          {item.labelDay.slice(0, 3).toUpperCase()}
        </Text>

        {isActive ? (
          <LinearGradient
            colors={["#F9C711", "#DFB318"]}
            style={[s.dateBox, s.dateBoxActive]}
          >
            <Text style={[s.dateText, s.dateTextActive]}>{item.dayNum}</Text>
            <View style={s.dot} />
          </LinearGradient>
        ) : (
          <View style={[s.dateBox, s.dateBoxInactive]}>
            <Text style={s.dateText}>{item.dayNum}</Text>
            <View style={s.dot} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.wrapper}>
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => select(active - 1)}
          disabled={active === 0}
          style={[s.iconWrap, active === 0 && { opacity: 0.3 }]}
        >
          <ArrowLeftIcon width={16} height={16} />
        </TouchableOpacity>

        <Text style={s.rangeText}>{weekRangeLabel()}</Text>

        <TouchableOpacity
          onPress={() => select(active + 1)}
          disabled={active === menuDays.length - 1}
          style={[
            s.iconWrap,
            active === menuDays.length - 1 && { opacity: 0.3 },
          ]}
        >
          <ArrowRightIcon width={16} height={16} />
        </TouchableOpacity>
      </View>

      <Divider />

      <FlatList
        ref={listRef}
        horizontal
        data={menuDays}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={<View />}
        ListFooterComponent={<View style={{ width: SIDE_SPACER }} />}
      />
    </View>
  );
}

/* ============================================================
   STYLES
   ============================================================ */
const s = StyleSheet.create({
  wrapper: {
    marginHorizontal: SPACING,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: "center",
    ...SHADOW,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 14,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rangeText: {
    fontSize: 16,
    color: "#7C7C7C",
  },
  dayItem: {
    alignItems: "center",
    marginTop: 16,
    width: ITEM_W,
  },
  dayName: {
    fontSize: 12,
    color: "#000",
    marginBottom: 6,
  },
  activeDayName: { color: "#8A8A8A" },
  dateBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  dateBoxActive: { backgroundColor: "#FFCA40" },
  dateBoxInactive: {},
  dateText: { fontSize: 15, fontWeight: "700", color: "#000" },
  dateTextActive: { color: "#fff" },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 6,
  },
});
