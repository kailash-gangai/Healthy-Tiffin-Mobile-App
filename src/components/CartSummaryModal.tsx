import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
  StyleSheet,
  Dimensions,
  Pressable,
  LayoutAnimation,
  UIManager,
  Platform,
  Image,
} from 'react-native';
import ArrowUp from '../assets/htf-icon/icon-up.svg';
import ArrowDown from '../assets/htf-icon/icon-down.svg';
import TrashIcon from '../assets/htf-icon/icon-trans.svg';
import Divider from '../assets/newicon/divider.svg';
import WaveImageOrder from '../assets/newicon/img-order.svg';
import { SHADOW } from '../ui/theme';
import LinearGradient from 'react-native-linear-gradient';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addItems,
  removeItem,
  clearCart,
  decreaseItem,
  increaseItem,
  removeDayMains,
  removeDayAddons,
} from '../store/slice/cartSlice';
import { SvgUri } from 'react-native-svg';

const { height } = Dimensions.get('window');
const MAIN_CAT_ORDER = ['PROTEIN', 'VEGGIES', 'SIDES', 'PROBIOTICS'];
const REQUIRED_CATS = ['PROTEIN', 'VEGGIES', 'SIDES', 'PROBIOTICS'];

const WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COLORS = {
  white: '#ffffff',
  black: '#000000',
  gray: '#8A8A8A',
  green: '#0B5733',
  yellow: '#FFCA40',
  bg: 'rgba(0,0,0,0.45)',
  lightGray: '#F4F4F4',
  border: '#EDEDED',
  red: '#FF6B6B',
};
const width = Dimensions.get('window').width;

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

export default function CartSummaryModal({
  visible,
  onClose,
  navigation,
}: {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}) {
  const translateY = useRef(new Animated.Value(height)).current;
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [expandedPlans, setExpandedPlans] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedType, setSelectedType] = useState<'Steel' | 'ECO'>('Steel');
  const dispatch = useAppDispatch();
  const { lines } = useAppSelector(state => state.cart);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 120,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: height,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const toggleDayExpand = (day: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const togglePlanExpand = (day: string, plan: number) => {
    const key = `${day}:${plan}`;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedPlans(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isDayOpen = (day: string) => expandedDays[day] ?? true;
  const isPlanOpen = (day: string, plan: number) =>
    expandedPlans[`${day}:${plan}`] ?? true;

  // Calculate totals and validation
  const mealCost = lines
    .filter(i => i.type === 'main')
    .reduce((s, x) => s + +x.price * x.qty, 0);

  const uniqueDayCount = new Set(lines.map(it => it.day).filter(Boolean)).size;
  const uniqueTiffinCount = new Set(
    lines.map(it => it.tiffinPlan).filter(Boolean),
  ).size;

  const addons = lines
    .filter(i => i.type === 'addon')
    .reduce((s, x) => s + +x.price * x.qty, 0);

  const hasAnyMain = useMemo(() => lines.some(l => l.type === 'main'), [lines]);
  const hasAnyAddon = useMemo(
    () => lines.some(l => l.type === 'addon'),
    [lines],
  );

  let tiffinPrice = 29 * uniqueDayCount * uniqueTiffinCount;
  if (!hasAnyMain) tiffinPrice = 0;

  const subtotal = mealCost + addons;
  const total = subtotal + tiffinPrice;

  // Group items by day and tiffin plan
  const days = useMemo(() => {
    const byDaySet = [...new Set(lines.map(l => l.day))].filter(
      Boolean,
    ) as string[];
    const ring = rotateFromToday(WEEK);
    return byDaySet.sort((a, b) => ring.indexOf(a) - ring.indexOf(b));
  }, [lines]);

  const grouped = useMemo(
    () =>
      days.map(d => {
        const allMains = lines.filter(x => x.day === d && x.type === 'main');
        const addons = lines.filter(x => x.day === d && x.type === 'addon');

        const plansMap = allMains.reduce((acc: any, item: any) => {
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

        return { day: d, mains: allMains, tiffinPlans, addons };
      }),
    [days, lines],
  );

  // Missing categories validation
  const missingInfo = useMemo(() => {
    if (!hasAnyMain) return null;
    const ring = rotateFromToday(WEEK);
    const daysInCart = [...new Set(lines.map(l => l.day))].filter(
      Boolean,
    ) as string[];
    const scan = ring.filter(d => daysInCart.includes(d));
    const allMissing: any[] = [];

    for (const d of scan) {
      const tiffinPlans = [
        ...new Set(
          lines
            .filter(l => l.day === d && l.type === 'main')
            .map(l => l.tiffinPlan),
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
        if (missing.length)
          allMissing.push({ day: d, tiffinPlan: plan, missing });
      }
    }
    return allMissing.length ? allMissing : null;
  }, [lines, hasAnyMain]);

  // Add-ons minimum validation
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

  const canProceed = !missingInfo && !addonsMinInfo && lines.length > 0;

  const DayBlock = ({ day, mains, addons, tiffinPlans }: any) => {
    const dayAddonsTotal = addons.reduce(
      (s: number, x: any) => s + Number(x.price || 0) * (x.qty ?? 1),
      0,
    );
    const dayMainsExtra = mains
      .filter((x: any) => Number(x.price) > 0)
      .reduce(
        (s: number, x: any) => s + Number(x.price || 0) * (x.qty ?? 1),
        0,
      );
    const plansCount = new Set(mains.map((m: any) => m.tiffinPlan)).size;
    const dayBase = plansCount > 0 ? 29 * plansCount : 0;
    const dayTotal = dayBase + dayMainsExtra + dayAddonsTotal;

    return (
      <View style={s.dayCard}>
        <TouchableOpacity
          style={s.dayHeader}
          activeOpacity={0.8}
          onPress={() => toggleDayExpand(day)}
        >
          <Text style={s.dayText}>{day}</Text>
          <View style={s.priceTag}>
            <Text style={s.priceText}>${dayTotal.toFixed(2)}</Text>
          </View>
          <View style={s.arrowBox}>
            {isDayOpen(day) ? (
              <ArrowDown height={20} width={20} />
            ) : (
              <ArrowUp height={20} width={20} />
            )}
          </View>
        </TouchableOpacity>
        <View
          style={{ marginTop: 12, display: isDayOpen(day) ? 'flex' : 'none' }}
        >
          <Divider />
        </View>

        {isDayOpen(day) && (
          <View>
            {/* Mains Section */}
            {mains.length > 0 && (
              <View style={s.section}>
                {tiffinPlans.map((plan: any) => (
                  <View key={`tiffin-${plan.plan}`} style={s.planSection}>
                    <View
                      style={s.planHeader}
                      // onPress={() => togglePlanExpand(day, plan.plan)}
                    >
                      <Text style={s.planTitle}>Tiffin {plan.plan}</Text>

                      {/* <View style={s.sectionHeader}>
                        <TouchableOpacity
                          onPress={() => dispatch(removeDayMains({ day }))}
                          style={s.trashBtn}
                        >
                          <TrashIcon height={16} width={16} />
                        </TouchableOpacity>
                        {isPlanOpen(day, plan.plan) ? (
                          <ArrowDown height={16} width={16} />
                        ) : (
                          <ArrowUp height={16} width={16} />
                        )}
                      </View> */}
                    </View>

                    {isPlanOpen(day, plan.plan) && (
                      <View style={s.planItems}>
                        {plan.items.map((item: any) => (
                          <View
                            key={`${item.id}-${item.variantId}-${item.tiffinPlan}`}
                            style={s.itemRow}
                          >
                            <View style={s.itemContent}>
                              <View style={s.itemContent2}>
                                <View style={s.thumb}>
                                  <Image
                                    source={{ uri: item.image }}
                                    style={s.imgMini}
                                  />
                                </View>
                                <View style={s.content}>
                                  <Text style={s.itemCategory}>
                                    {item.category}
                                  </Text>
                                  <Text style={s.itemName}>{item.title}</Text>
                                  <Text style={s.itemQty}>
                                    {Number(item.price) > 0 && (
                                      <View style={s.priceBadge}>
                                        <Text style={s.priceBadgeText}>
                                          +${item.price}
                                        </Text>
                                      </View>
                                    )}
                                  </Text>
                                </View>
                              </View>

                              <TouchableOpacity
                                style={s.deleteBtn}
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
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
            {/* Add-ons Section */}
            // Add-ons Section - Changed to same design as Tiffin
            {addons.length > 0 && (
              <View style={s.section}>
                <View style={s.sectionHeader}>
                  <Text style={[s.sectionChip, s.addonChip]}>Add-ons</Text>
                  <TouchableOpacity
                    onPress={() => dispatch(removeDayAddons({ day }))}
                    style={s.trashBtn}
                  >
                    <TrashIcon height={16} width={16} />
                  </TouchableOpacity>
                </View>

                {addons.map((item: any) => (
                  <View key={`${item.id}-${item.variantId}`} style={s.itemRow}>
                    <View style={s.itemContent}>
                      <View style={s.itemContent2}>
                        <View style={s.thumb}>
                          <Image
                            source={{ uri: item.image }}
                            style={s.imgMini}
                          />
                        </View>
                        <View style={s.content}>
                          <Text style={[s.itemCategory, s.addonCategory]}>
                            {item.category}
                          </Text>
                          <Text style={s.itemName}>{item.title}</Text>
                          <Text style={s.itemQty}>
                            <View style={s.priceBadge}>
                              <Text style={s.priceBadgeText}>
                                ${item.price}
                              </Text>
                            </View>
                          </Text>
                        </View>
                      </View>
                      <View style={s.bControls}>
                        <View style={s.qtyControls}>
                          <TouchableOpacity
                            style={s.qtyBtn}
                            onPress={() =>
                              dispatch(
                                decreaseItem({
                                  id: item.id,
                                  variantId: item.variantId,
                                  tiffinPlan: item.tiffinPlan,
                                  type: item.type,
                                }),
                              )
                            }
                          >
                            <Text style={s.qtyBtnText}>−</Text>
                          </TouchableOpacity>
                          <Text style={s.qtyText}>{item.qty}</Text>
                          <TouchableOpacity
                            style={s.qtyBtn}
                            onPress={() =>
                              dispatch(
                                increaseItem({
                                  id: item.id,
                                  variantId: item.variantId,
                                  tiffinPlan: item.tiffinPlan,
                                  type: item.type,
                                }),
                              )
                            }
                          >
                            <Text style={s.qtyBtnText}>+</Text>
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          style={s.deleteBtn}
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
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={s.backdrop} onPress={onClose} />
      <Animated.View style={[s.sheet, { transform: [{ translateY }] }]}>
        <TouchableOpacity style={s.handleWrapper} onPress={onClose}>
          <View style={s.handle}></View>
        </TouchableOpacity>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <Text style={s.title}>Cart Summary</Text>

          {/* Container Type */}
          <Text style={s.label}>Select container type</Text>
          <View style={s.toggleWrap}>
            {['Steel', 'ECO'].map(opt => {
              const isActive = selectedType === opt;
              return (
                <LinearGradient
                  key={opt}
                  colors={
                    isActive ? ['#f2c113', '#e2b517'] : ['#ffff', '#ffff']
                  }
                  style={s.toggleBtn}
                >
                  <TouchableOpacity
                    onPress={() => setSelectedType(opt as any)}
                    style={s.toggleBtnContent}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[s.toggleText, isActive && s.toggleTextActive]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              );
            })}
          </View>

          {/* Cart Items */}
          {grouped.map(({ day, mains, addons, tiffinPlans }) => (
            <DayBlock
              key={day}
              day={day}
              mains={mains}
              addons={addons}
              tiffinPlans={tiffinPlans}
            />
          ))}

          {/* Validation Messages */}
          {missingInfo && (
            <View style={s.validationBox}>
              <Text style={s.validationTitle}>Missing Items</Text>
              <Text style={s.validationText}>
                Please complete all tiffins before proceeding
              </Text>
            </View>
          )}

          {/* {addonsMinInfo && (
            <View style={s.validationBox}>
              <Text style={s.validationTitle}>Minimum Not Met</Text>
              <Text style={s.validationText}>{addonsMinInfo.message}</Text>
              <Text style={s.validationSubtext}>
                Add ${addonsMinInfo.remaining.toFixed(2)} more to proceed
              </Text>
            </View>
          )} */}

          {/* Cart Summary */}
          <View style={s.summaryCard}>
            {(addonsMinInfo || missingInfo) && (
              <View style={s.noticeBox}>
                <Text style={s.noticeText}>
                  {addonsMinInfo && addonsMinInfo.message}
                  {missingInfo &&
                    'Please complete all tiffins before proceeding'}
                </Text>
              </View>
            )}

            <View>
              <View style={s.summaryRow}>
                <Text style={s.label}>Subtotal</Text>
                <Text style={s.value}>
                  ${(mealCost + tiffinPrice).toFixed(2)}
                </Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.label}>Addons</Text>
                <Text style={s.value}>${addons.toFixed(2)}</Text>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Divider />
              </View>

              <View style={s.summaryRow}>
                <Text style={s.totalLabel}>Total Payable</Text>
                <Text style={s.totalValue}>${total.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <LinearGradient
            colors={
              canProceed ? ['#5FBC9B', '#1E9E64'] : ['#CCCCCC', '#999999']
            }
            style={s.orderBtn}
          >
            <TouchableOpacity
              style={s.orderBtnContent}
              activeOpacity={0.9}
              onPress={() => canProceed && navigation.navigate('OrderTrack')}
              disabled={!canProceed}
            >
              <Text style={s.orderText}>
                {canProceed
                  ? `Place an Order ($${total.toFixed(2)})`
                  : 'Complete Your Order'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bg,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#f7f7f9',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 0,
    maxHeight: height * 0.9,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  handleWrapper: {
    width: '100%',
    height: 5,
    paddingVertical: 16,
  },
  handle: {
    width: 50,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    // marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 16,
    // textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 8,
    fontWeight: '600',
  },
  toggleWrap: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#ffff',
    padding: 2,
  },
  toggleBtn: {
    flex: 1,
    borderRadius: 10,
  },
  toggleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#333' },
  toggleTextActive: { color: '#fff' },

  // Day Card Styles
  dayCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayText: { fontWeight: '700', color: COLORS.black, fontSize: 16, flex: 1 },
  priceTag: {
    backgroundColor: COLORS.black,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  priceText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
  arrowBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#d7f3e7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section Styles
  section: {
    marginTop: 12,
    paddingTop: 12,
    // borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#EAF6EF',
    color: COLORS.green,
    fontWeight: '700',
    fontSize: 12,
  },
  addonChip: {
    backgroundColor: '#FFF4E8',
    color: '#E67C24',
  },
  trashBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Plan Section Styles
  planSection: {
    marginBottom: 8,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planTitle: { fontSize: 14, fontWeight: '700', color: COLORS.black },
  planItems: {
    marginTop: 8,
    gap: 8,
  },

  // Item Row Styles
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 2,
  },
  addonItem: {
    backgroundColor: '#F8FAFF',
    borderColor: '#E0E8FF',
  },
  thumb: {
    position: 'relative',
    marginRight: 12,
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
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 20,
  },
  // In the styles section, update these:
  itemContent: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemContent2: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    display: 'flex',
    paddingHorizontal: 8,
    justifyContent: 'center',
    width: 150,
  },
  itemCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.green,
    marginBottom: 2,
  },
  addonCategory: {
    color: '#1B4FBF',
  },
  itemName: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.black,
    lineHeight: 20,
    marginBottom: 4,
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
    backgroundColor: '#FFECEC',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginLeft: 8,
  },

  // Validation Styles
  validationBox: {
    backgroundColor: '#FFF6E5',
    borderColor: '#FFD699',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  validationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8A5A00',
    marginBottom: 4,
  },
  validationText: {
    fontSize: 14,
    color: '#8A5A00',
    marginBottom: 4,
  },
  validationSubtext: {
    fontSize: 12,
    color: '#8A5A00',
    fontWeight: '600',
  },

  // Summary Styles
  noticeBox: {
    backgroundColor: '#ececee',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  noticeText: { fontSize: 14, color: '#000000', textAlign: 'center' },
  summaryCard: {
    borderTopEndRadius: 16,
    borderTopStartRadius: 16,
    padding: 16,
    marginTop: 12,
    ...SHADOW,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  value: { fontSize: 14, color: '#111', fontWeight: '700' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#111' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#000' },
  orderBtn: {
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBtnContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  orderText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 12,
    borderRadius: 1,
  },
});
