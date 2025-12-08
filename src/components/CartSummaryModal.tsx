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
import ArrowDown from '../assets/newicon/icon-down-arrow.svg';
import TrashIcon from '../assets/newicon/icon-delete.svg';
import Divider from '../assets/newicon/divider.svg';
import WaveImageOrder from '../assets/newicon/img-order.svg';
import { SHADOW } from '../ui/theme';
import LinearGradient from 'react-native-linear-gradient';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  removeItem,
  decreaseItem,
  increaseItem,
  removeDayAddons,
} from '../store/slice/cartSlice';
import { createCart } from '../shopify/mutation/cart';
import { useShopifyCheckoutSheet } from '@shopify/checkout-sheet-kit';
import { catRank, formatDate, rotateFromToday } from '../utils/tiffinHelpers';
import MobileMenubg from '../assets/newicon/mobile-menu-oprn.svg'
import OrderNote from './OrderNote';

const { height } = Dimensions.get('window');
const REQUIRED_CATS = ['PROTEINS', 'VEGGIES', 'SIDES', 'PROBIOTICS'];

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
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8A8A8A',
  green: '#127E51',
  yellow: '#FFCA40',
  bg: 'rgba(0,0,0,0.45)',
  lightGray: '#F4F4F4',
  border: '#EDEDED',
  red: '#FF6B6B',
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
  const [collapsed, setCollapsed] = useState(true); // Collapsed state for the note section
  const [note, setNote] = useState('');
  const { lines } = useAppSelector(state => state.cart);
  const shopifyCheckout = useShopifyCheckoutSheet();
  const { customerToken, email } = useAppSelector(state => state.user);
  const onOrderPress = async () => {
    console.log(lines, 'lines');
    console.log(customerToken, email);

    try {
      const createdCart = await createCart(
        lines,
        customerToken as string,
        email as string,
        note,
      );
      console.log(createdCart, 'cart');
      shopifyCheckout.present(createdCart.checkoutUrl);
    } catch (error) {
      console.log('something went wrong', error);
    }
  };
  const translateY = useRef(new Animated.Value(height)).current;
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [expandedPlans, setExpandedPlans] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedType, setSelectedType] = useState<'Steel' | 'ECO'>('Steel');
  const dispatch = useAppDispatch();

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

  const toggleDayExpand = (date: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setExpandedDays((prev) => {
      const isCurrentlyOpen = prev[date];
      return {
        ...prev,
        [date]: !isCurrentlyOpen
      };
    });
  };


  const togglePlanExpand = (date: string, plan: number) => {
    const key = `${date}:${plan}`;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedPlans(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isDayOpen = (date: string) => expandedDays[date] ?? true;
  const isPlanOpen = (date: string, plan: number) =>
    expandedPlans[`${date}:${plan}`] ?? true;

  const mealCost = lines
    .filter(i => i.type === 'main')
    .reduce((s, x) => s + +x.price * x.qty, 0);

  const uniqueDayCount = new Set(lines.map(it => it.date).filter(Boolean)).size;
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
  const total = subtotal;

  // Group items by date and tiffin plan
  const dates = useMemo(() => {
    const byDaySet = [...new Set(lines.map(l => l.date))].filter(
      Boolean,
    ) as string[];
    const ring = rotateFromToday(WEEK);
    return byDaySet.sort((a, b) => ring.indexOf(a) - ring.indexOf(b));
  }, [lines]);

  const grouped = useMemo(() => {
    const result = dates.map(d => {
      const allMains = lines.filter(x => x.date === d && x.type === 'main');
      const addons = lines.filter(x => x.date === d && x.type === 'addon');

      const plansMap = allMains.reduce((acc: any, item: any) => {
        if (!acc[item.tiffinPlan]) acc[item.tiffinPlan] = [];
        acc[item.tiffinPlan].push(item);
        return acc;
      }, {});

      const tiffinPlans = Object.entries(plansMap)
        .map(([planNumber, items]: any) => ({
          plan: parseInt(planNumber),
          items: items.sort(
            (a: any, b: any) => catRank(a.category) - catRank(b.category)
          ),
        }))
        .sort((a, b) => a.plan - b.plan);

      return { date: d, mains: allMains, tiffinPlans, addons };
    });

    // ORDER BY DATE
    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [dates, lines]);


  // Missing categories validation
  // Missing categories validation
  const missingInfo = useMemo(() => {
    if (!hasAnyMain) return null;

    // Get unique dates from the lines (use the actual date)
    const datesInCart = [...new Set(lines.map(l => l.date))].filter(Boolean) as string[];

    const allMissing: any[] = [];

    // Iterate over each unique date in the cart
    for (const d of datesInCart) {
      const tiffinPlans = [
        ...new Set(
          lines
            .filter(l => l.date === d && l.type === 'main')
            .map(l => l.tiffinPlan),
        ),
      ].sort();

      for (const plan of tiffinPlans) {
        const catsPresent = new Set(
          lines
            .filter(
              l => l.date === d && l.type === 'main' && l.tiffinPlan === plan,
            )
            .map(l => String(l.category).toUpperCase()),
        );
        const missing = REQUIRED_CATS.filter(c => !catsPresent.has(c));
        if (missing.length)
          allMissing.push({ date: d, tiffinPlan: plan, missing });
      }
    }

    return allMissing.length ? allMissing : null;
  }, [lines, hasAnyMain]);

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
  const width = Dimensions.get('window').width;
  const canProceed = !missingInfo && !addonsMinInfo && lines.length > 0;

  // Toggle the collapsed state (expand/collapse the text area)
  const toggleCollapse = () => {
    setCollapsed(prevState => !prevState);
  };

  // Handle note input change
  const handleNoteChange = (text: string) => {
    setNote(text);
  };
  const DayBlock = ({ date, mains, addons, tiffinPlans }: any) => {
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
    const mainExtra = mains
      .filter((x: any) => Number(x.priceAfterThreshold) > 0)
      .reduce(
        (s: number, x: any) => s + Number(x.priceAfterThreshold || 0) * (x.qty ?? 1),
        0,
      )
    const plansCount = new Set(mains.map((m: any) => m.tiffinPlan)).size;
    const dayBase = plansCount > 0 ? 29 * plansCount : 0;
    const dayTotal = dayMainsExtra + dayAddonsTotal;
    // Function to get the day with suffix (st, nd, rd, th)
    return (
      <View style={s.dayCard}>
        <TouchableOpacity
          style={s.dayHeader}
          activeOpacity={0.8}
          onPress={() => toggleDayExpand(date)}
        >
          <Text style={s.dayText}>{formatDate(date)}</Text>
          <View style={s.priceTag}>
            <Text style={s.priceText}>
              ${(dayTotal - mainExtra).toFixed(2)} {'+ $' + (mainExtra > 0 && mainExtra.toFixed(2))}
            </Text>

          </View>
          <View style={s.arrowBox}>

            <ArrowDown style={isDayOpen(date) && { transform: [{ rotate: '180deg' }] }} height={20} width={20} />

          </View>
        </TouchableOpacity>
        <View
          style={{ marginTop: 12, display: isDayOpen(date) ? 'flex' : 'none' }}
        >
          <Divider />
        </View>

        {isDayOpen(date) && (
          <View>
            {/* Mains Section */}
            {mains.length > 0 && (
              <View style={s.section}>
                {tiffinPlans.map((plan: any) => (
                  <View key={`tiffin-${plan.plan}`} style={s.planSection}>
                    <View
                      style={s.planHeader}
                    >
                      <Text style={s.planTitle}>Tiffin {plan.plan}</Text>


                    </View>

                    {isPlanOpen(date, plan.plan) && (
                      <View style={s.planItems}>
                        {plan.items.map((item: any) => (
                          <View
                            key={`${item.id}-${item.variantId}-${item.tiffinPlan}-${item.type}-${item.day}-${item.category}-${item.title}`}
                            style={s.itemRow}
                          >
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                              <View style={s.itemCategory}>
                                <Text >
                                  {item.category}
                                </Text>
                              </View>
                              <Text> </Text>
                            </View>

                            <View style={s.itemContent}>
                              <View style={s.itemContent2}>
                                <View style={s.thumb}>
                                  <Image
                                    source={{ uri: item.image }}
                                    style={s.imgMini}
                                  />
                                </View>

                                <View style={s.content}>
                                  <Text
                                    style={s.itemName}
                                    numberOfLines={3} // Prevents overflow and truncates text
                                    ellipsizeMode="tail" // Adds "..." when text overflows
                                  >
                                    {item.title}
                                  </Text>

                                  {Number(item.priceAfterThreshold) > 0 && (
                                    <View style={s.priceBadge}>
                                      <Text style={s.priceBadgeText}>
                                        +${item.priceAfterThreshold}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              </View>

                              <View style={{ display: 'flex', justifyContent: 'center' }}>
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
                ))}
              </View>
            )}
            {/* Add-ons Section */}

            {addons.length > 0 && (
              <View style={s.section}>
                <View style={s.sectionHeader}>
                  <Text style={[s.sectionChip]}>A La Carte</Text>
                  {/* <TouchableOpacity
                    onPress={() => dispatch(removeDayAddons({ date }))}
                    style={s.trashBtn}
                  >
                    <TrashIcon height={16} width={16} />
                  </TouchableOpacity> */}
                </View>
                <View style={s.planItems}>

                  {addons.map((item: any) => (
                    <View
                      key={`${item.id}-${item.variantId}-${item.tiffinPlan}-${item.type}-${item.day}-${item.category}-${item.title}`}
                      style={s.itemRow}
                    >
                      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={s.itemCategory}>
                          <Text >
                            {item.category}
                          </Text>
                        </View>
                        <Text> </Text>
                      </View>

                      <View style={s.itemContent}>
                        <View style={s.itemContent2}>
                          <View style={s.thumb}>
                            <Image
                              source={{ uri: item.image }}
                              style={s.imgMini}
                            />
                          </View>

                          <View style={s.content}>
                            <Text
                              style={s.itemName}
                              numberOfLines={3} // Prevents overflow and truncates text
                              ellipsizeMode="tail" // Adds "..." when text overflows
                            >
                              {item.title}
                            </Text>

                            {Number(item.price) > 0 && (
                              <View style={s.priceBadge}>
                                <Text style={s.priceBadgeText}>
                                  ${item.price} {item.qty > 1 && `x ${item.qty}`}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>

                        <View style={{ display: 'flex', justifyContent: 'center' }}>
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
      <Animated.View style={[s.sheet, { transform: [{ translateY }], }]}>
        <MobileMenubg height={85} width={width + 5} style={{ position: "absolute", top: -3, left: 0, right: 0 }} />
        <Pressable style={s.handleWrapper} onPress={onClose} onPressIn={onClose}>
          <View style={s.handle}></View>
        </Pressable>

        <View style={{ backgroundColor: '#F7F7F9', }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 16,
              paddingTop: 0,
              paddingBottom: 120,
            }}
          >
            <Text style={s.title}>Cart Summary</Text>
            {/* Container Type */}
            {/* <Text style={s.label}>Select container type</Text>
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
          </View> */}

            {/* Cart Items */}
            {grouped.map(({ date, mains, addons, tiffinPlans }) => (
              <DayBlock
                key={date}
                // day={day}
                date={date}
                mains={mains}
                addons={addons}
                tiffinPlans={tiffinPlans}
              />
            ))}

            {/* Validation Messages */}
            {missingInfo && (
              <View style={s.validationBox}>
                <Text style={s.validationText}>
                  Please complete all tiffins before proceeding
                </Text>
                {missingInfo.map((item, index) => (
                  <View key={index}>
                    <Text style={[s.validationText, { color: '#666' }]}>
                      {item.date}: Tiffin Plan {item.tiffinPlan} is missing {item.missing.join(', ')}.
                    </Text>
                  </View>
                ))}
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

            <OrderNote
              collapsed={collapsed}
              toggleCollapse={toggleCollapse}
              note={note}
              onChangeNote={handleNoteChange}
            />
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
                  <Text style={s.label}>Meal Box</Text>
                  <Text style={s.value}>
                    ${(mealCost).toFixed(2)}
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
            <WaveImageOrder style={s.wave} />

            <LinearGradient
              colors={['#42D296', '#2AB47B']}
              start={{ x: 0.0, y: 0.0 }}
              end={{ x: 1.0, y: 1.0 }}
              locations={[0.0982, 0.9387]}
              style={s.orderBtn}
            >
              <TouchableOpacity
                style={[s.orderBtnContent, !canProceed && { opacity: 0.5 }]}
                activeOpacity={0.9}
                onPress={() => canProceed && onOrderPress()}
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
        </View>
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
    // backgroundColor: '#f7f7f9',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // padding: 20,
    // paddingTop: 0,
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
  toggleText: { fontSize: 16, fontWeight: '600', color: '#333' },
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
  dayText: { fontWeight: '500', color: COLORS.black, fontSize: 12, lineHeight: 20, letterSpacing: -0.24, flex: 1 },
  priceTag: {
    backgroundColor: COLORS.black,
    paddingVertical: 10,
    paddingHorizontal: 10,
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
    marginTop: 6,
    paddingTop: 6,
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
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 12,
    color: '#000',
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
  addonCategory: {
    color: '#1B4FBF',
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
    paddingHorizontal: 16,
    paddingTop: 16,
    marginTop: 6,
    ...SHADOW,
  },
  wave: {
    marginTop: -4,

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

});
