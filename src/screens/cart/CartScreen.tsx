// ===============================================
// CART SCREEN — NEW UI (MATCHES CartSummaryModal)
// WITHOUT Steel/ECO Toggle
// ===============================================

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';

import AppHeader from '../../components/AppHeader';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  addItems,
  clearCart,
  decreaseItem,
  increaseItem,
  removeDayAddons,
  removeDayMains,
  removeItem,
} from '../../store/slice/cartSlice';

import ArrowUp from '../../assets/htf-icon/icon-up.svg';
import ArrowDown from '../../assets/htf-icon/icon-down.svg';
import TrashIcon from '../../assets/htf-icon/icon-trans.svg';
import Divider from '../../assets/newicon/divider.svg';
import InfoIcon from '../../assets/htf-icon/icon-info.svg';
import LinearGradient from 'react-native-linear-gradient';

import { SHADOW } from '../../ui/theme';
import { COLORS as C } from '../../ui/theme';
import MissingCategoryModal from '../../components/MissingCategoryModal';

const MAIN_CAT_ORDER = ['PROTEIN', 'VEGGIES', 'SIDES', 'PROBIOTICS'];
const REQUIRED_CATS = ['PROTEIN', 'VEGGIES', 'SIDES', 'PROBIOTICS'];
const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
const rotateFromToday = (arr: string[]) => {
  const i = arr.indexOf(todayName);
  if (i < 0) return arr;
  return [...arr.slice(i), ...arr.slice(0, i)];
};

const catRank = (c?: string) => {
  const i = MAIN_CAT_ORDER.indexOf(String(c ?? '').toUpperCase());
  return i === -1 ? 1e9 : i;
};

export default function CartScreen({ navigation }: any) {
  const { lines } = useAppSelector(state => state.cart);
  const { byDay } = useAppSelector(state => state.catalog);
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const [note, setNote] = useState('');
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>({});
  const [missingOpen, setMissingOpen] = useState(false);

  const toggleDay = (day: string) =>
    setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));

  const isDayOpen = (day: string) => expandedDays[day] ?? true;

  const hasAnyMain = useMemo(
    () => lines.some(l => l.type === 'main'),
    [lines],
  );
  const hasAnyAddon = useMemo(
    () => lines.some(l => l.type === 'addon'),
    [lines],
  );

  const mealCost = lines
    .filter(i => i.type === 'main')
    .reduce((s, x) => s + +x.price * x.qty, 0);

  const addons = lines
    .filter(i => i.type === 'addon')
    .reduce((s, x) => s + +x.price * x.qty, 0);

  const uniqueDayCount = new Set(lines.map(it => it.day).filter(Boolean)).size;
  const uniqueTiffinCount = new Set(lines.map(it => it.tiffinPlan).filter(Boolean)).size;

  let tiffinPrice = 29 * uniqueDayCount * uniqueTiffinCount;
  if (!hasAnyMain) tiffinPrice = 0;

  const subtotal = mealCost + addons;
  const total = subtotal + tiffinPrice;

  const isEmpty = lines.length === 0;

  // ===== Days (Sorted) =====
  const days = useMemo(() => {
    const byDaySet = [...new Set(lines.map(l => l.day))].filter(Boolean) as string[];
    const ring = rotateFromToday(WEEK);
    return byDaySet.sort((a, b) => ring.indexOf(a) - ring.indexOf(b));
  }, [lines]);

  // ===== Grouped items =====
  const grouped = useMemo(
    () =>
      days.map(d => {
        const mains = lines.filter(x => x.day === d && x.type === 'main');
        const addons = lines.filter(x => x.day === d && x.type === 'addon');

        const plansMap = mains.reduce((acc: any, item: any) => {
          if (!acc[item.tiffinPlan]) acc[item.tiffinPlan] = [];
          acc[item.tiffinPlan].push(item);
          return acc;
        }, {});

        const tiffinPlans = Object.entries(plansMap)
          .map(([planNumber, items]: any) => ({
            plan: parseInt(planNumber),
            items: items.sort(
              (a: any, b: any) => catRank(a.category) - catRank(b.category),
            ),
          }))
          .sort((a, b) => a.plan - b.plan);

        return { day: d, mains, addons, tiffinPlans };
      }),
    [days, lines],
  );

  // ===== Missing Items =====
  const missingInfo = useMemo(() => {
    if (!hasAnyMain) return null;

    const ring = rotateFromToday(WEEK);
    const daysInCart = [...new Set(lines.map(l => l.day))].filter(Boolean) as string[];
    const scan = ring.filter(d => daysInCart.includes(d));

    const allMissing: any[] = [];
    for (const d of scan) {
      const tiffinPlans = [
        ...new Set(
          lines.filter(l => l.day === d && l.type === 'main').map(l => l.tiffinPlan),
        ),
      ].sort();

      for (const plan of tiffinPlans) {
        const catsPresent = new Set(
          lines
            .filter(
              l => l.day === d && l.type === 'main' && l.tiffinPlan === plan,
            )
            .map(l => String(l.category).toUpperCase()),
        );
        const missing = REQUIRED_CATS.filter(c => !catsPresent.has(c));
        if (missing.length) allMissing.push({ day: d, tiffinPlan: plan, missing });
      }
    }

    return allMissing.length ? allMissing : null;
  }, [lines, hasAnyMain]);

  // ===== A La Carte Minimum =====
  const ADDONS_MIN = 29;
  const addonsOnly = hasAnyAddon && !hasAnyMain;

  const addonsMinInfo = useMemo(() => {
    if (!addonsOnly) return null;
    if (addons >= ADDONS_MIN) return null;

    const remaining = Math.max(0, ADDONS_MIN - addons);
    return {
      total: addons,
      remaining,
      message: `Minimum $${ADDONS_MIN} for A La Carte orders`,
    };
  }, [addonsOnly, addons]);

  const canProceed = !missingInfo && !addonsMinInfo && !isEmpty;

  // =======================================
  // RENDER
  // =======================================

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <AppHeader title="My Cart" onBack={() => navigation.goBack()} />

      {isEmpty ? (
        <ScrollView contentContainerStyle={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.emptyBtnTxt}>Start ordering</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 180 }}
        >
          {grouped.map(({ day, mains, addons, tiffinPlans }) => {
            const dayAddonsTotal = addons.reduce(
              (s, x) => s + Number(x.price) * (x.qty ?? 1),
              0,
            );
            const dayMainsExtra = mains
              .filter(x => Number(x.price) > 0)
              .reduce(
                (s, x) => s + Number(x.price) * (x.qty ?? 1),
                0,
              );

            const plansCount = new Set(mains.map(m => m.tiffinPlan)).size;
            const dayBase = plansCount > 0 ? 29 * plansCount : 0;
            const dayTotal = dayBase + dayMainsExtra + dayAddonsTotal;

            return (
              <View key={day} style={styles.dayCard}>
                <TouchableOpacity
                  style={styles.dayHeader}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={styles.dayText}>{day}</Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.priceTag}>
                      <Text style={styles.priceTagText}>${dayTotal.toFixed(2)}</Text>
                    </View>

                    <View style={styles.arrowBox}>
                      {isDayOpen(day) ? (
                        <ArrowUp width={20} height={20} />
                      ) : (
                        <ArrowDown width={20} height={20} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {isDayOpen(day) && (
                  <View style={{ marginTop: 16 }}>
                    <Divider />

                    {/* ------- Tiffin Plans ------- */}
                    {tiffinPlans.map(plan => (
                      <View key={plan.plan} style={styles.section}>
                        <Text style={styles.planTitle}>Tiffin {plan.plan}</Text>

                        {plan.items.map((item: any) => (
                          <View
                            key={`${item.id}-${item.variantId}-${item.tiffinPlan}`}
                            style={styles.itemRow}
                          >
                            <View style={styles.itemContent}>
                              <View style={styles.itemLeft}>
                                <Image source={{ uri: item.image }} style={styles.imgMini} />

                                <View style={styles.itemDetails}>
                                  <Text style={styles.itemCategory}>{item.category}</Text>
                                  <Text style={styles.itemName}>{item.title}</Text>
                                  {Number(item.price) > 0 && (
                                    <Text style={styles.itemPrice}>
                                      +${item.price}
                                    </Text>
                                  )}
                                </View>
                              </View>

                              <TouchableOpacity
                                style={styles.deleteBtn}
                                onPress={() =>
                                  dispatch(
                                    removeItem({
                                      id: item.id,
                                      variantId: item.variantId,
                                      tiffinPlan: item.tiffinPlan as number,
                                      type: item.type as 'main' | 'addon',
                                    }),
                                  )
                                }
                              >
                                <TrashIcon width={18} height={18} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                    ))}

                    {/* ------- Add-ons ------- */}
                    {addons.length > 0 && (
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Text style={[styles.sectionChip, styles.addonChip]}>Add-ons</Text>

                          <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => dispatch(removeDayAddons({ day }))}
                          >
                            <TrashIcon width={18} height={18} />
                          </TouchableOpacity>
                        </View>

                        {addons.map(item => (
                          <View
                            key={`${item.id}-${item.variantId}`}
                            style={styles.itemRow}
                          >
                            <View style={styles.itemContent}>
                              <View style={styles.itemLeft}>
                                <Image source={{ uri: item.image }} style={styles.imgMini} />

                                <View style={styles.itemDetails}>
                                  <Text style={[styles.itemCategory, styles.addonCategory]}>
                                    {item.category}
                                  </Text>
                                  <Text style={styles.itemName}>{item.title}</Text>

                                  <Text style={styles.itemExtra}>${item.price}</Text>
                                </View>
                              </View>

                              <View style={styles.bControls}>
                                <TouchableOpacity
                                  style={styles.qtyBtn}
                                  onPress={() =>
                                    dispatch(
                                      decreaseItem({
                                        id: item.id,
                                        variantId: item.variantId,
                                        tiffinPlan: item.tiffinPlan as number,
                                        type: item.type,
                                      }),
                                    )
                                  }
                                >
                                  <Text style={styles.qtyBtnText}>−</Text>
                                </TouchableOpacity>

                                <Text style={styles.qtyText}>{item.qty}</Text>

                                <TouchableOpacity
                                  style={styles.qtyBtn}
                                  onPress={() =>
                                    dispatch(
                                      increaseItem({
                                        id: item.id,
                                        variantId: item.variantId,
                                        tiffinPlan: item.tiffinPlan as number,
                                        type: item.type,
                                      }),
                                    )
                                  }
                                >
                                  <Text style={styles.qtyBtnText}>+</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={styles.deleteBtn}
                                  onPress={() =>
                                    dispatch(
                                      removeItem({
                                        id: item.id,
                                        variantId: item.variantId,
                                        tiffinPlan: item.tiffinPlan as number,
                                        type: item.type,
                                      }),
                                    )
                                  }
                                >
                                  <TrashIcon width={18} height={18} />
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Remove all mains for the day */}
                    {mains.length > 0 && (
                      <TouchableOpacity
                        style={styles.clearSubBtn}
                        onPress={() => dispatch(removeDayMains({ day }))}
                      >
                        <Text style={styles.clearSubText}>Remove all mains for {day}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}

          <View style={styles.noteWrap}>
            <Text style={styles.noteLabel}>Add delivery instructions</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Add a note"
              placeholderTextColor={C.sub}
              multiline
              value={note}
              onChangeText={setNote}
            />
          </View>

          {/* Summary */}
          <View style={styles.summaryCard}>
            {(addonsMinInfo || missingInfo) && (
              <View style={styles.noticeBox}>
                <Text style={styles.noticeText}>
                  {addonsMinInfo && addonsMinInfo.message}
                  {missingInfo && 'Please complete all tiffins before proceeding'}
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Meal box</Text>
              <Text style={styles.summaryValue}>${(mealCost + tiffinPrice).toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Add-ons</Text>
              <Text style={styles.summaryValue}>${addons.toFixed(2)}</Text>
            </View>

            <Divider style={{ marginVertical: 12 }} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total Payable</Text>
              <Text style={styles.summaryTotalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Missing Category Modal */}
          {missingInfo && (
            <MissingCategoryModal
              visible={missingOpen}
              onClose={() => setMissingOpen(false)}
              dataByDay={byDay}
              missingList={missingInfo}
              onAdd={payload => dispatch(addItems([payload] as any))}
            />
          )}
        </ScrollView>
      )}

      {/* Footer CTA */}
      {!isEmpty && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          {missingInfo && (
            <View style={styles.validationBox}>
              <InfoIcon width={20} height={20} />
              <Text style={styles.validationText}>Some meals are incomplete</Text>
              <TouchableOpacity
                style={styles.validationBtn}
                onPress={() => setMissingOpen(true)}
              >
                <Text style={styles.validationBtnTxt}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          <LinearGradient
            colors={canProceed ? ['#5FBC9B', '#1E9E64'] : ['#CCCCCC', '#999999']}
            style={styles.orderBtn}
          >
            <TouchableOpacity
              disabled={!canProceed}
              onPress={() => navigation.navigate('OrderTrack')}
              style={styles.orderBtnContent}
            >
              <Text style={styles.orderText}>
                {canProceed
                  ? `Place Order ($${total.toFixed(2)})`
                  : 'Complete Your Order'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </SafeAreaView>
  );
}

// ===========================================================
// STYLES (Identical to CartSummaryModal)
// ===========================================================

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },

  // Empty
  emptyWrap: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.black, marginBottom: 20 },
  emptyBtn: {
    backgroundColor: C.green,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyBtnTxt: { color: '#FFF', fontWeight: '700' },

  // Day Card
  dayCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EDEDED',
    ...SHADOW,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayText: { fontSize: 16, fontWeight: '700', color: C.black },
  priceTag: {
    backgroundColor: C.black,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  priceTagText: { color: '#FFF', fontWeight: '600' },
  arrowBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#d7f3e7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  section: { marginTop: 12 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  planTitle: { fontSize: 14, fontWeight: '700', color: C.black },

  // Chips
  sectionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#EAF6EF',
    color: C.green,
    fontWeight: '700',
    fontSize: 12,
  },
  addonChip: { backgroundColor: '#FFF4E8', color: C.oranger },
  addonCategory: { color: '#1B4FBF' },

  // Items
  itemRow: { marginTop: 10 },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  imgMini: { width: 54, height: 54, borderRadius: 16, resizeMode: 'cover' },
  itemDetails: { marginLeft: 12, width: 150 },
  itemCategory: { fontSize: 11, fontWeight: '700', color: C.green },
  itemName: { fontSize: 12, fontWeight: '600', marginTop: 2, color: C.black },
  itemExtra: { fontSize: 12, color: C.gray, marginTop: 4 },

  deleteBtn: {
    width: 32,
    height: 32,
    backgroundColor: '#FFECEC',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },

  // Addon qty controls
  bControls: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D9E3DC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { fontSize: 12, fontWeight: '700', color: C.green },
  qtyText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.black,
    minWidth: 20,
    textAlign: 'center',
    marginHorizontal: 4,
  },

  // Remove per-day items
  clearSubBtn: { marginTop: 8 },
  clearSubText: { fontSize: 12, fontWeight: '700', color: C.red },

  // Note
  noteWrap: { marginTop: 20 },
  noteLabel: { fontWeight: '700', fontSize: 15, marginBottom: 8 },
  noteInput: {
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 12,
    padding: 12,
    minHeight: 70,
    textAlignVertical: 'top',
  },

  // Summary
  summaryCard: {
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    ...SHADOW,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 14, fontWeight: '600', color: C.black },
  summaryValue: { fontSize: 14, fontWeight: '700', color: C.black },

  summaryTotalLabel: { fontSize: 16, fontWeight: '700', color: C.black },
  summaryTotalValue: { fontSize: 18, fontWeight: '800', color: C.black },

  noticeBox: {
    backgroundColor: '#ececee',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  noticeText: { color: '#000', textAlign: 'center' },

  // Footer
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
  },

  validationBox: {
    backgroundColor: '#FFF6E5',
    borderColor: '#FFD699',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  validationText: {
    color: '#8A5A00',
    fontWeight: '700',
    flex: 1,
    marginLeft: 10,
  },
  validationBtn: {
    backgroundColor: C.green,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  validationBtnTxt: { color: '#FFF', fontWeight: '800' },

  orderBtn: {
    borderRadius: 12,
    marginTop: 10,
  },
  orderBtnContent: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: { color: '#FFF', fontWeight: '700', fontSize: 16 },

  // Item Price
  itemPrice: { fontSize: 12, fontWeight: '600', color: C.subText, marginTop: 4 },
});
