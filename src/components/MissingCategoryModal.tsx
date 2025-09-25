// components/MissingCategoryModal.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import { COLORS as C } from '../ui/theme';

type DayName =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

type CatalogItem = {
  id: string;
  variantId: string;
  title: string;
  description?: string;
  tags?: string[];
  image: string | null;
  price: string | number;
};
type CatalogGroup = {
  key: 'probiotics' | 'protein' | 'sides' | 'veggies';
  value: CatalogItem[];
};
type MissingRow = { day: DayName; tiffinPlan: number; missing: string[] };

export default function MissingCategoryModal({
  visible,
  onClose,
  dataByDay,
  missingList,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  dataByDay: Partial<Record<DayName, CatalogGroup[]>>;
  missingList: MissingRow[];
  onAdd: (payload: {
    id: string;
    variantId: string;
    title: string;
    description?: string;
    tags?: string[];
    image: string | null;
    price: string | number;
    type: 'main';
    category: string;
    qty: number;
    day: DayName;
    tiffinPlan: number;
  }) => void;
}) {
  const days = useMemo(
    () => Array.from(new Set(missingList.map(m => m.day))),
    [missingList],
  );

  const [day, setDay] = useState<DayName>(days[0] || 'Wednesday');
  const plansForDay = useMemo(
    () =>
      missingList
        .filter(m => m.day === day)
        .map(m => m.tiffinPlan)
        .sort((a, b) => a - b),
    [missingList, day],
  );
  const [plan, setPlan] = useState<number>(plansForDay[0] || 1);

  const missingCats = useMemo(() => {
    const row = missingList.find(m => m.day === day && m.tiffinPlan === plan);
    return (row?.missing ?? []).map(s => String(s).toUpperCase());
  }, [missingList, day, plan]);

  const groups = useMemo(() => {
    const src = dataByDay[day] ?? [];
    const want = new Set(missingCats);
    return src.filter(g => want.has(String(g.key).toUpperCase()));
  }, [dataByDay, day, missingCats]);

  const Chip = ({
    label,
    active,
    icon,
    onPress,
  }: {
    label: string;
    active: boolean;
    icon?: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[s.chip, active && s.chipOn]}
      activeOpacity={0.9}
    >
      {icon ? (
        <FontAwesome5
          iconStyle="solid"
          name={icon as any}
          size={12}
          color={active ? '#FFF' : '#0B5733'}
        />
      ) : null}
      <Text style={[s.chipTxt, active && s.chipTxtOn]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.backdrop}>
        <View style={s.sheet}>
          <View style={s.grabberWrap}>
            <View style={s.grabber} />
          </View>

          <View style={s.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.h1}>Finish your box</Text>
              <Text style={s.subH}>
                {day} • Tiffin {plan}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={s.iconBtn}
              hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
            >
              <FontAwesome5
                iconStyle="solid"
                name="times"
                size={18}
                color="#1C1C1C"
              />
            </TouchableOpacity>
          </View>

          {/* day selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.rowChips}
          >
            {days.map(d => (
              <Chip
                key={d}
                label={d}
                icon="calendar-day"
                active={d === day}
                onPress={() => {
                  setDay(d);
                  const first =
                    missingList.find(m => m.day === d)?.tiffinPlan ?? 1;
                  setPlan(first);
                }}
              />
            ))}
          </ScrollView>

          {/* plan selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[s.rowChips, { paddingTop: 6 }]}
          >
            {plansForDay.map(p => (
              <Chip
                key={p}
                label={`Tiffin ${p}`}
                icon="box"
                active={p === plan}
                onPress={() => setPlan(p)}
              />
            ))}
          </ScrollView>

          {/* notice */}
          <View style={s.notice}>
            <FontAwesome5
              iconStyle="solid"
              name="info-circle"
              size={14}
              color="#8A5A00"
            />
            {missingCats.length ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.missRow}
              >
                {missingCats.map(c => (
                  <View key={c} style={s.missPill}>
                    <Text style={s.missPillTxt} numberOfLines={1}>
                      {c}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={s.allSet}>All set for this tiffin.</Text>
            )}
          </View>

          {/* suggestions */}
          <ScrollView contentContainerStyle={{ padding: 12 }}>
            {groups.map(g => (
              <View key={g.key} style={s.group}>
                <View style={s.groupHdr}>
                  <Text style={s.groupTitle}>
                    {String(g.key).toUpperCase()}
                  </Text>
                  <View style={s.groupUnderline} />
                </View>

                {g.value.map(it => (
                  <View key={`${it.id}-${it.variantId}`} style={s.cardSm}>
                    <View style={s.imgWrap}>
                      <Image
                        source={
                          it.image
                            ? { uri: it.image }
                            : require('../assets/LOGO.png')
                        }
                        style={s.imgSm}
                      />
                      <View style={s.priceBadge}>
                        <Text style={s.priceText}>${it.price}</Text>
                      </View>
                    </View>

                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={s.itemTitle} numberOfLines={2}>
                        {it.title}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={s.addBtnSm}
                      activeOpacity={0.92}
                      onPress={() =>
                        onAdd({
                          id: it.id,
                          variantId: it.variantId,
                          title: it.title,
                          description: it.description,
                          tags: it.tags,
                          image: it.image,
                          price: it.price,
                          type: 'main',
                          category: String(g.key).toUpperCase(),
                          qty: 1,
                          day,
                          tiffinPlan: plan,
                        })
                      }
                    >
                      <FontAwesome5
                        iconStyle="solid"
                        name="plus"
                        size={14}
                        color="#FFF"
                      />
                      <Text style={s.addTxt}>Add</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))}

            {!groups.length && (
              <View style={s.empty}>
                <FontAwesome5
                  iconStyle="solid"
                  name="inbox"
                  size={16}
                  color="#8A5A00"
                />
                <Text style={s.emptyTxt}>
                  No suggestions for selected tiffin.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  // backdrop + sheet
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: -6 },
    shadowRadius: 16,
    elevation: 10,
  },
  grabberWrap: { alignItems: 'center', paddingTop: 8 },
  grabber: {
    width: 54,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E8EAE9',
  },

  // header
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  h1: { fontSize: 18, fontWeight: '900', color: '#111' },
  subH: { marginTop: 2, color: '#66736B', fontWeight: '700', fontSize: 12 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F5F4',
  },

  // chips
  rowChips: { paddingHorizontal: 12, paddingTop: 8, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D6E5DC',
    backgroundColor: '#F6FBF8',
    gap: 6,
  },
  chipOn: { backgroundColor: '#0B5733', borderColor: '#0B5733' },
  chipTxt: {
    fontWeight: '800',
    color: '#0B5733',
    fontSize: 12,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  chipTxtOn: { color: '#FFF' },

  // notice
  notice: {
    marginTop: 8,
    marginHorizontal: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFF6E5',
    borderWidth: 1,
    borderColor: '#FFD699',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  missRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  missPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFEFD1',
    borderWidth: 1,
    borderColor: '#FFE0A6',
    alignSelf: 'flex-start',
  },
  missPillTxt: {
    color: '#8A5A00',
    fontWeight: '800',
    fontSize: 12,
    lineHeight: 16,
    includeFontPadding: false,
  },
  allSet: { color: '#8A5A00', fontWeight: '800' },

  // groups
  group: { marginTop: 12 },
  groupHdr: { paddingHorizontal: 12, marginBottom: 8 },
  groupTitle: {
    fontWeight: '900',
    color: '#0B5733',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  groupUnderline: {
    height: 2,
    width: 44,
    backgroundColor: '#CBE8D7',
    borderRadius: 2,
    marginTop: 6,
  },

  // compact card
  cardSm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EAE7',
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  imgWrap: { position: 'relative' },
  imgSm: { width: 58, height: 50, borderRadius: 8, backgroundColor: '#EEF2EF' },
  priceBadge: {
    position: 'absolute',
    right: 3,
    bottom: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#0B5733',
  },
  priceText: { color: '#FFF', fontSize: 10, fontWeight: '800' },

  itemTitle: {
    color: C.black,
    fontWeight: '800',
    fontSize: 13,
    lineHeight: 16,
    includeFontPadding: false,
  },

  addBtnSm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#0B5733',
  },
  addTxt: { color: '#FFF', fontWeight: '900', fontSize: 12 },

  // empty
  empty: {
    marginTop: 8,
    marginHorizontal: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF6E5',
    borderWidth: 1,
    borderColor: '#FFD699',
    alignItems: 'center',
    gap: 6,
  },
  emptyTxt: { color: '#8A5A00', fontWeight: '800' },
});
