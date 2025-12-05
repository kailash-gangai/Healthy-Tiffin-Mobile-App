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
} from 'react-native';

import AppHeader from '../../components/AppHeader';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import WaveImageOrder from '../../assets/newicon/img-order.svg';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  addItems,
  removeDayAddons,
  removeItem,
} from '../../store/slice/cartSlice';

import ArrowDown from '../../assets/newicon/icon-down-arrow.svg';
import TrashIcon from '../../assets/newicon/icon-delete.svg';
import Divider from '../../assets/newicon/divider.svg';
import InfoIcon from '../../assets/htf-icon/icon-info.svg';
import LinearGradient from 'react-native-linear-gradient';

import { COLORS, SHADOW } from '../../ui/theme';
import { COLORS as C } from '../../ui/theme';
import MissingCategoryModal from '../../components/MissingCategoryModal';
import { formatDate } from '../../utils/tiffinHelpers';
import OrderNote from '../../components/OrderNote';

const MAIN_CAT_ORDER = ['PROTEINS', 'VEGGIES', 'SIDES', 'PROBIOTICS'];
const REQUIRED_CATS = ['PROTEINS', 'VEGGIES', 'SIDES', 'PROBIOTICS'];
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
  const { byDate } = useAppSelector(state => state.catalog);
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [collapsed, setCollapsed] = useState(true); // Collapsed state for the note section

  const [note, setNote] = useState('');
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>({});
  const [missingOpen, setMissingOpen] = useState(false);

  const toggleDay = (date: string) =>
    setExpandedDays(prev => ({ ...prev, [date]: !prev[date] }));

  const isDayOpen = (date: string) => expandedDays[date] ?? true;

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

  const uniqueDayCount = new Set(lines.map(it => it.date).filter(Boolean)).size;
  const uniqueTiffinCount = new Set(lines.map(it => it.tiffinPlan).filter(Boolean)).size;

  let tiffinPrice = 29 * uniqueDayCount * uniqueTiffinCount;
  if (!hasAnyMain) tiffinPrice = 0;

  const subtotal = mealCost + addons;
  const total = subtotal ;

  const isEmpty = lines.length === 0;

  // ===== Days (Sorted) =====
  const dates = useMemo(() => {
    const byDaySet = [...new Set(lines.map(l => l.date))].filter(Boolean) as string[];
    // Convert string dates to Date objects for proper sorting
    const sortedDates = byDaySet.sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime(); // Sorting in ascending order
    });
    return sortedDates; // Return the sorted dates array
  }, [lines]);


  // ===== Grouped items =====
  const grouped = useMemo(
    () =>
      dates.map(d => {
        const mains = lines.filter(x => x.date === d && x.type === 'main');
        const addons = lines.filter(x => x.date === d && x.type === 'addon');

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

        return { date: d, mains, addons, tiffinPlans };
      }),
    [dates, lines],
  );
  // ===== Missing Items =====
  const missingInfo = useMemo(() => {
    if (!hasAnyMain) return null;

    // Get unique dates from lines
    const datesInCart = [...new Set(lines.map(l => l.date))].filter(Boolean) as string[];
    console.log(datesInCart, 'datesInCart'); // Log the unique dates in cart

    const allMissing: any[] = [];

    // Iterate over each date in the cart
    for (const d of datesInCart) {
      console.log(d, 'date');

      // Get unique tiffin plans for the given date
      const tiffinPlans = [
        ...new Set(
          lines.filter(l => l.date === d && l.type === 'main').map(l => l.tiffinPlan)
        ),
      ].sort();

      // Check for missing categories for each tiffin plan on the date
      for (const plan of tiffinPlans) {
        const catsPresent = new Set(
          lines
            .filter(l => l.date === d && l.type === 'main' && l.tiffinPlan === plan)
            .map(l => String(l.category).toUpperCase()) // Make sure category is in uppercase
        );

        // Find missing categories
        const missing = REQUIRED_CATS.filter(c => !catsPresent.has(c));
        if (missing.length) {
          allMissing.push({ date: d, tiffinPlan: plan, missing });
        }
      }
    }

    console.log(allMissing, 'allMissing');
    return allMissing.length ? allMissing : null; // Return missing info or null if no missing categories
  }, [lines, hasAnyMain]);

  console.log(missingInfo, "missingInfo")
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
  const toggleCollapse = () => {
    setCollapsed(prevState => !prevState);
  };

  // Handle note input change
  const handleNoteChange = (text: string) => {
    setNote(text);
  };
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
          {grouped.map(({ date, mains, addons, tiffinPlans }) => {
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
            const mainExtra = mains
              .filter((x: any) => Number(x.priceAfterThreshold) > 0)
              .reduce(
                (s: number, x: any) => s + Number(x.priceAfterThreshold || 0) * (x.qty ?? 1),
                0,
              )
            const plansCount = new Set(mains.map(m => m.tiffinPlan)).size;
            const dayBase = plansCount > 0 ? 29 * plansCount : 0;
            // const dayTotal = dayBase + dayMainsExtra + dayAddonsTotal;
            const dayTotal = dayMainsExtra + dayAddonsTotal;


            return (
              <View key={date} style={styles.dayCard}>
                <TouchableOpacity
                  style={styles.dayHeader}
                  onPress={() => toggleDay(date)}
                >
                  <Text style={styles.dayText}>{formatDate(date)}</Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.priceTag}>
                      <Text style={styles.priceTagText}>
                        ${(dayTotal - mainExtra).toFixed(2)} {'+ $' + (mainExtra > 0 && mainExtra.toFixed(2))}
                      </Text>
                    </View>

                    <View style={styles.arrowBox}>

                      <ArrowDown style={isDayOpen(date) && { transform: [{ rotate: '180deg' }] }} width={20} height={20} />

                    </View>
                  </View>
                </TouchableOpacity>

                {isDayOpen(date) && (
                  <View style={{ marginTop: 16 }}>
                    <Divider />

                    {/* ------- Tiffin Plans ------- */}
                    {tiffinPlans.map(plan => (
                      <View key={plan.plan} style={styles.section}>
                        <Text style={styles.planTitle}>Tiffin {plan.plan}</Text>
                        <View style={styles.items}>
                          {plan.items.map((item: any) => (
                            <View
                              key={`${item.id}-${item.variantId}-${item.tiffinPlan}-${item.type}-${item.day}-${item.category}-${item.title}`}
                              style={styles.itemRow}
                            >
                              <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={styles.itemCategory}>
                                  <Text >
                                    {item.category}
                                  </Text>
                                </View>
                                <Text> </Text>
                              </View>

                              <View style={styles.itemContent}>
                                <View style={styles.itemContent2}>
                                  <View style={styles.thumb}>
                                    <Image
                                      source={{ uri: item.image }}
                                      style={styles.imgMini}
                                    />
                                  </View>

                                  <View style={styles.content}>
                                    <Text
                                      style={styles.itemName}
                                      numberOfLines={3} // Prevents overflow and truncates text
                                      ellipsizeMode="tail" // Adds "..." when text overflows
                                    >
                                      {item.title}
                                    </Text>

                                    {Number(item.priceAfterThreshold) > 0 && (
                                      <View style={styles.priceBadge}>
                                        <Text style={styles.priceBadgeText}>
                                          +${item.priceAfterThreshold}
                                        </Text>
                                      </View>
                                    )}
                                  </View>
                                </View>

                                <View style={{ display: 'flex', justifyContent: 'center' }}>
                                  <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() =>
                                      dispatch(
                                        removeItem({
                                          id: item.id,
                                          variantId: item.variantId,
                                          tiffinPlan: item.tiffinPlan,
                                          type: item.type,
                                        }),
                                      )
                                    }
                                  >
                                    <TrashIcon height={16} width={16} />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}

                    {/* ------- Add-ons ------- */}
                    {addons.length > 0 && (
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Text style={[styles.sectionChip, styles.addonChip]}>A La Carte</Text>

                          {/* <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => dispatch(removeDayAddons({ date }))}
                          >
                            <TrashIcon width={18} height={18} />
                          </TouchableOpacity> */}
                        </View>

                        {addons.map(item => (
                          <View
                            key={`${item.id}-${item.variantId}-${item.tiffinPlan}-${item.type}-${item.day}-${item.category}-${item.title}`}
                            style={styles.itemRow}
                          >
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                              <View style={styles.itemCategory}>
                                <Text >
                                  {item.category}
                                </Text>
                              </View>
                              <Text> </Text>
                            </View>

                            <View style={styles.itemContent}>
                              <View style={styles.itemContent2}>
                                <View style={styles.thumb}>
                                  <Image
                                    source={{ uri: item.image }}
                                    style={styles.imgMini}
                                  />
                                </View>

                                <View style={styles.content}>
                                  <Text
                                    style={styles.itemName}
                                    numberOfLines={3} // Prevents overflow and truncates text
                                    ellipsizeMode="tail" // Adds "..." when text overflows
                                  >
                                    {item.title}
                                  </Text>

                                  {Number(item.price) > 0 && (
                                    <View style={styles.priceBadge}>
                                      <Text style={styles.priceBadgeText}>
                                        +${item.price}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              </View>

                              <View style={{ display: 'flex', justifyContent: 'center' }}>
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
                                  <TrashIcon height={16} width={16} />
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Remove all mains for the day */}
                    {/* {mains.length > 0 && (
                      <TouchableOpacity
                        style={styles.clearSubBtn}
                        onPress={() => dispatch(removeDayMains({ date }))}
                      >
                        <Text style={styles.clearSubText}>Remove all mains for {date}</Text>
                      </TouchableOpacity>
                    )} */}
                  </View>
                )}
              </View>
            );
          })}

          {missingInfo && (
            <View style={styles.validationBox}>
              <InfoIcon width={20} height={20} />
              <View>
                <Text style={[styles.validationText, { fontWeight: '500', color: '#7f4f06ff' }]}>Some meals are incomplete</Text>
                {missingInfo.map((item, index) => (
                  <View key={index}>
                    <Text style={[styles.validationText, { color: '#666' }]}>
                      {item.date}: Tiffin Plan {item.tiffinPlan} is missing {item.missing.join(', ')}.
                    </Text>
                  </View>
                ))}
              </View>
              {/* <TouchableOpacity
                style={styles.validationBtn}
                onPress={() => setMissingOpen(true)}
              >
                <Text style={styles.validationBtnTxt}>Add</Text>
              </TouchableOpacity> */}
            </View>
          )}
          <OrderNote
            collapsed={collapsed}
            toggleCollapse={toggleCollapse}
            note={note}
            onChangeNote={handleNoteChange}
          />

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
          <WaveImageOrder style={styles.wave} />



        </ScrollView>
      )}

      {/* Footer CTA */}
      {!isEmpty && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>

          <LinearGradient
            colors={['#42D296', '#2AB47B']}
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 1.0, y: 1.0 }}
            locations={[0.0982, 0.9387]}
            style={styles.orderBtn}
          >
            <TouchableOpacity
              disabled={!canProceed}
              onPress={() => navigation.navigate('OrderTrack')}
              style={[styles.orderBtnContent, !canProceed && { opacity: 0.5 }]}
            >
              <Text style={styles.orderText}>
                {canProceed
                  ? `Place Order ($${total.toFixed(2)})`
                  : 'Complete Your Order'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )
      }
    </SafeAreaView >
  );
}

// ===========================================================
// STYLES (Identical to CartSummaryModal)
// ===========================================================

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'F7F7F9' },
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
  dayText: { fontSize: 14, lineHeight: 16, letterSpacing: -0.24, fontWeight: '500', color: C.black },
  priceTag: {
    backgroundColor: C.black,
    paddingVertical: 10,
    paddingHorizontal: 10,
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
  items: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  // Chips
  sectionChip: {
    paddingHorizontal: 0,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: '700',
    fontSize: 12,
  },
  addonChip: { backgroundColor: '#ffff' },
  addonCategory: { color: '#1B4FBF' },

  // Item Row Styles
  itemRow: {
    // flexDirection: 'row',
    // alignItems: 'center',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#ECECEE59',
    // gap: 10
  },
  addonItem: {
    backgroundColor: '#F8FAFF',
    borderColor: '#E0E8FF',
  },
  thumb: {
    position: 'relative',
    marginRight: 12,
    alignItems: 'center',
  },
  imgMini: {
    width: 54,
    height: 54,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  priceBadge: {},
  addonPriceBadge: {
    backgroundColor: '#1B4FBF',
  },
  priceBadgeText: {
    color: '#00020E',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  // In the styles section, update these:
  itemContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemContent2: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',

  },
  content: {
    display: 'flex',
    width: 200,

  },
  itemCategory: {
    textTransform: 'capitalize',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Poppins',
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderColor: '#E0E8FF',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,

  },

  itemName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#00020E',
    lineHeight: 20,
    marginBottom: 4,
    flexWrap: 'wrap',
    width: '100%',
  },
  itemQty: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '600',
  },
  bControls: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#D9E3DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.green,
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.black,
    minWidth: 20,
    textAlign: 'center',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    backgroundColor: '#FFE3E3',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginLeft: 8,
    bottom: 0
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
    borderTopEndRadius: 16,
    borderTopStartRadius: 16,
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
  wave: {
    marginTop: -4,

  },
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
    color: '#000',
    fontWeight: '400',
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
