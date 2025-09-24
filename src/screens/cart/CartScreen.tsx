import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import AppHeader from '../../components/AppHeader';
import { COLORS as C, SHADOW, SPACING } from '../../ui/theme';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
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
import MissingCategoryModal from '../../components/MissingCategoryModal';
import PlusIcon from '../../assets/htf-icon/icon-add.svg';
import MinusIcon from '../../assets/htf-icon/icon-remove.svg';
import RemoveIcon from '../../assets/htf-icon/icon-cross.svg';
import CartIcon from '../../assets/htf-icon/icon-cart.svg';
import TrashIcon from '../../assets/htf-icon/icon-trans.svg';
import InfoIcon from '../../assets/htf-icon/icon-info.svg';

const MAIN_CAT_ORDER = ['PROTEIN', 'VEGGIES', 'SIDES', 'PROBIOTICS'];
const REQUIRED_CATS = ['PROTEIN', 'VEGGIES', 'SIDES', 'PROBIOTICS'];

const catRank = (c?: string) => {
  const i = MAIN_CAT_ORDER.indexOf(String(c ?? '').toUpperCase());
  return i === -1 ? 1e9 : i;
};
const WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
const rotateFromToday = (arr: string[]) => {
  const i = arr.indexOf(todayName);
  if (i < 0) return arr;
  return [...arr.slice(i), ...arr.slice(0, i)];
};

export default function CartScreen({ navigation }: any) {
  const [missingOpen, setMissingOpen] = useState(false);
  const { byDay } = useAppSelector(state => state.catalog);
  const { lines } = useAppSelector(state => state.cart);

  const [note, setNote] = useState('');
  const [mode, setMode] = useState<'delivery' | 'pickup'>('delivery');
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const handleAddFromModal = (payload: any) => {
    dispatch(addItems([payload]));
  };

  const mealCost = lines
    .filter(i => i.type === 'main')
    .reduce((s, x) => s + +x.price * x.qty, 0);

  const addons = lines
    .filter(i => i.type === 'addon')
    .reduce((s, x) => s + +x.price * x.qty, 0);

  const nonMember = 0;
  let tiffinPrice = 29;
  const hasAnyMain = useMemo(() => lines.some(l => l.type === 'main'), [lines]);
  const hasAnyAddon = useMemo(
    () => lines.some(l => l.type === 'addon'),
    [lines],
  );
  if (!hasAnyMain) tiffinPrice = 0;

  const subtotal = mealCost + addons + nonMember;

  const isEmpty = lines.length === 0;
  const contentBottomPad = isEmpty ? 24 + insets.bottom : 200 + insets.bottom;

  // unique days in cart
  const days = useMemo(() => {
    const byDay = [...new Set(lines.map(l => l.day))].filter(
      Boolean,
    ) as string[];
    const ring = rotateFromToday(WEEK);
    return byDay.sort((a, b) => ring.indexOf(a) - ring.indexOf(b));
  }, [lines]);

  const grouped = useMemo(
    () =>
      days.map(d => {
        const allMains = lines.filter(x => x.day === d && x.type === 'main');
        const addons = lines.filter(x => x.day === d && x.type === 'addon');

        const plansMap = allMains.reduce((acc: any, item: any) => {
          if (!acc[item.tiffinPlan]) {
            acc[item.tiffinPlan] = [];
          }
          acc[item.tiffinPlan].push(item);
          return acc;
        }, {});

        // Convert to sorted array
        const tiffinPlans = Object.entries(plansMap)
          .map(([planNumber, items]: any) => ({
            plan: parseInt(planNumber),
            items: items.sort(
              (a: any, b: any) => catRank(a.category) - catRank(b.category),
            ),
          }))
          .sort((a, b) => a.plan - b.plan);

        return {
          day: d,
          mains: allMains,
          tiffinPlans,
          addons,
        };
      }),
    [days, lines],
  );

  // first missing day per required categories (only when mains exist)
  const missingInfo = useMemo(() => {
    if (!hasAnyMain) return null;
    const ring = rotateFromToday(WEEK);
    const daysInCart = [...new Set(lines.map(l => l.day))].filter(
      Boolean,
    ) as string[];
    const scan = ring.filter(d => daysInCart.includes(d));

    const allMissing = [];

    for (const d of scan) {
      // Get all tiffin plans for this day
      const tiffinPlans = [
        ...new Set(
          lines
            .filter(l => l.day === d && l.type === 'main')
            .map(l => l.tiffinPlan),
        ),
      ].sort();

      // Check each tiffin plan separately
      for (const plan of tiffinPlans) {
        const catsPresent = new Set(
          lines
            .filter(
              l => l.day === d && l.type === 'main' && l.tiffinPlan === plan,
            )
            .map(l => String(l.category).toUpperCase()),
        );

        const missing = REQUIRED_CATS.filter(c => !catsPresent.has(c));

        if (missing.length > 0) {
          allMissing.push({
            day: d,
            tiffinPlan: plan,
            missing,
          });
        }
      }
    }

    // Return all missing info, not just the first one found
    return allMissing.length > 0 ? allMissing : null;
  }, [lines, hasAnyMain]);
  // NEW: Add-ons minimum validation when there are only add-ons
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

  const [openByDay, setOpenByDay] = useState<Record<string, boolean>>({});
  const isOpen = (d: string) => openByDay[d] ?? true;
  const toggleDay = (d: string) =>
    setOpenByDay(p => ({ ...p, [d]: !isOpen(d) }));

  const onRemoveDayMains = (d: string) => dispatch(removeDayMains({ day: d }));
  const onRemoveDayAddons = (d: string) =>
    dispatch(removeDayAddons({ day: d }));

  const payDisabled = isEmpty || !!missingInfo || !!addonsMinInfo;
  const fmt = (n: number) => n.toFixed(2);
  const uniqueDays = [...new Set(missingInfo && missingInfo.map(m => m.day))];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.white }}>
      <AppHeader title="My Cart" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: contentBottomPad }}
        showsVerticalScrollIndicator
      >
        {isEmpty ? (
          <View style={s.emptyBox}>
            <View style={s.emptyInner}>
              <View style={s.emptyIconWrap}>
                <CartIcon height={64} width={64} />
              </View>
              <Text style={s.emptyTitle}>Your cart is empty</Text>
              <Text style={s.emptySub}>No items in cart</Text>
            </View>

            <TouchableOpacity
              style={s.emptyCta}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={s.emptyCtaTxt}>Start ordering</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {grouped.map(({ day, mains, addons, tiffinPlans }) => {
              const dayAddonsTotal = addons.reduce(
                (s, x) => s + +x.price * x.qty,
                0,
              );

              return (
                <View key={day}>
                  <View key={day} style={s.dayCard}>
                    <TouchableOpacity
                      style={s.dayHdr}
                      onPress={() => toggleDay(day)}
                      activeOpacity={0.9}
                    >
                      <Text style={s.dayTitle}>{day} Summary</Text>
                      <FontAwesome5
                        iconStyle="solid"
                        name={isOpen(day) ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={C.black}
                      />
                    </TouchableOpacity>

                    {isOpen(day) && (
                      <>
                        {/* Main block */}
                        {mains.length > 0 && (
                          <View style={s.block}>
                            <View style={s.blockHdRow}>
                              <Text style={s.blockChip}>Main </Text>
                              <TouchableOpacity
                                onPress={() => onRemoveDayMains(day)}
                                style={s.hdrTrashBtn}
                              >
                                <FontAwesome5
                                  iconStyle="solid"
                                  name="trash"
                                  size={16}
                                  color={C.red}
                                />
                              </TouchableOpacity>
                            </View>

                            {tiffinPlans.map(plan => (
                              <View key={`tiffin-${plan.plan}`}>
                                {/* Tiffin Plan Header */}
                                <View style={s.tiffinPlanHeader}>
                                  <Text style={s.tiffinPlanTitle}>
                                    Tiffin {plan.plan}
                                  </Text>
                                </View>

                                {/* Items for this tiffin plan */}
                                {plan.items.map((it: any, i: number) => {
                                  return (
                                    <View key={i} style={s.card}>
                                      <TouchableOpacity
                                        onPress={() =>
                                          dispatch(
                                            removeItem({
                                              id: it.id,
                                              variantId: it.variantId,
                                              tiffinPlan:
                                                it.tiffinPlan as number,
                                            }),
                                          )
                                        }
                                        style={s.priceTrashBtn}
                                        accessibilityRole="button"
                                        accessibilityLabel="Remove item"
                                      >
                                        <FontAwesome5
                                          iconStyle="solid"
                                          name="times"
                                          size={20}
                                          color={C.red}
                                        />
                                      </TouchableOpacity>

                                      <Image
                                        source={{ uri: it.image }}
                                        style={s.img}
                                      />

                                      <View style={s.cardContent}>
                                        <View style={s.titleRowTight}>
                                          <Text style={s.typeBadge}>
                                            Type: {it.type}
                                          </Text>
                                          <Text style={s.catPill}>
                                            {it.category}
                                          </Text>
                                        </View>

                                        {/* title */}
                                        <Text
                                          style={s.itemTitle}
                                          numberOfLines={2}
                                        >
                                          {it.title}
                                        </Text>

                                        {/* price below title */}
                                        <Text style={s.priceUnder}>
                                          ${it.price}
                                        </Text>

                                        {/* qty row */}
                                        <View style={s.qtyRow}>
                                          <Round
                                            onPress={() => {
                                              if (it.qty === 1) return;
                                              dispatch(
                                                decreaseItem({
                                                  id: it.id,
                                                  variantId: it.variantId,
                                                  tiffinPlan:
                                                    it.tiffinPlan as number,
                                                }),
                                              );
                                            }}
                                          >
                                            <Text style={s.sign}>−</Text>
                                          </Round>
                                          <Text style={s.qty}>{it.qty}</Text>
                                          <Round
                                            onPress={() =>
                                              dispatch(
                                                increaseItem({
                                                  id: it.id,
                                                  tiffinPlan:
                                                    it.tiffinPlan as number,

                                                  variantId: it.variantId,
                                                }),
                                              )
                                            }
                                          >
                                            <Text style={s.sign}>＋</Text>
                                          </Round>
                                        </View>
                                      </View>
                                    </View>
                                  );
                                })}
                              </View>
                            ))}
                            {!missingInfo && (
                              <View style={s.tiffinTotalBox}>
                                <Text style={s.tiffinTotalTxt}>
                                  Total for {day} ${tiffinPrice} + ($
                                  {mealCost}) = ${mealCost + tiffinPrice}
                                </Text>
                              </View>
                            )}
                          </View>
                        )}

                        {/* Add-ons block */}
                        {addons.length > 0 && (
                          <View style={s.block}>
                            <View style={s.blockHdRow}>
                              <Text style={s.blockChipAlt}>Add-ons</Text>
                              <TouchableOpacity
                                onPress={() => onRemoveDayAddons(day)}
                                style={s.hdrTrashBtn}
                              >
                                <FontAwesome5
                                  iconStyle="solid"
                                  name="trash"
                                  size={16}
                                  color={C.red}
                                />
                              </TouchableOpacity>
                            </View>

                            {addons.map(it => (
                              <View
                                key={`${it.id}-${it.variantId}-${it.tiffinPlan}-${it.day}`}
                                style={s.cardAlt}
                              >
                                <TouchableOpacity
                                  onPress={() =>
                                    dispatch(
                                      removeItem({
                                        id: it.id,
                                        variantId: it.variantId,
                                        tiffinPlan: it.tiffinPlan as number,
                                      }),
                                    )
                                  }
                                  style={s.priceTrashBtn}
                                  accessibilityRole="button"
                                  accessibilityLabel="Remove add-on"
                                >
                                  <FontAwesome5
                                    iconStyle="solid"
                                    name="times"
                                    size={20}
                                    color={C.red}
                                  />
                                </TouchableOpacity>

                                <Image
                                  source={{ uri: it.image }}
                                  style={s.imgSmall}
                                />

                                <View style={s.cardContent}>
                                  {/* type + category */}
                                  <View style={s.titleRowTight}>
                                    <Text style={s.typeBadgeAlt}>
                                      Type: {it.type}
                                    </Text>
                                    <Text style={s.catPillAlt}>
                                      {it.category}
                                    </Text>
                                  </View>

                                  {/* title */}
                                  <Text style={s.itemTitleSm} numberOfLines={2}>
                                    {it.title}
                                  </Text>

                                  {/* price under title */}
                                  <Text style={s.priceSmUnder}>
                                    ${it.price}
                                  </Text>

                                  <View style={s.qtyRowSm}>
                                    <Round
                                      onPress={() => {
                                        if (it.qty === 1) return;
                                        dispatch(
                                          decreaseItem({
                                            id: it.id,
                                            variantId: it.variantId,
                                            tiffinPlan: it.tiffinPlan as number,
                                          }),
                                        );
                                      }}
                                    >
                                      <Text style={s.sign}>−</Text>
                                    </Round>
                                    <Text style={s.qty}>{it.qty}</Text>
                                    <Round
                                      onPress={() =>
                                        dispatch(
                                          increaseItem({
                                            id: it.id,
                                            variantId: it.variantId,
                                            tiffinPlan: it.tiffinPlan as number,
                                          }),
                                        )
                                      }
                                    >
                                      <Text style={s.sign}>＋</Text>
                                    </Round>
                                  </View>
                                </View>
                              </View>
                            ))}
                            {addons.length > 0 && (
                              <View style={s.addonTotalBox}>
                                <Text style={s.addonTotalTxt}>
                                  Total for {day} A La Carte: $
                                  {fmt(dayAddonsTotal)}
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                      </>
                    )}
                  </View>
                </View>
              );
            })}

            {/* Clear cart + notes + summary + upsell */}
            <TouchableOpacity
              onPress={() => dispatch(clearCart())}
              activeOpacity={0.9}
              style={s.clearCartBtn}
            >
              <Text style={s.clearCart}>Clear cart</Text>
            </TouchableOpacity>

            <Text style={s.caption}>Add delivery instructions</Text>
            <TextInput
              style={s.note}
              value={note}
              onChangeText={setNote}
              multiline
              placeholder="Add a note"
              placeholderTextColor={C.sub}
            />

            {!missingInfo && (
              <View style={s.summary}>
                <Row k="Meal box price" v={`$${mealCost + tiffinPrice}`} />
                <Row k="Add on's" v={`$${addons}`} />
                {/* <Row k="Non member shipping" v={`$${nonMember}`} /> */}
                <Row k="Total" v={`$${subtotal + tiffinPrice}`} bold />
              </View>
            )}
          </>
        )}
      </ScrollView>

      {!isEmpty && (
        <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
          {/* Missing categories (when mains exist) */}
          {missingInfo && (
            <View style={s.missRow}>
              <View style={s.missIcon}>
                <InfoIcon height={24} width={24} />
              </View>

              <View style={s.missTxtWrap}>
                <Text style={s.missTitle}>
                  Missing meal for {uniqueDays.join(', ')}
                </Text>

                <View style={s.missChipsRow}></View>
              </View>

              <TouchableOpacity
                style={s.missCta}
                activeOpacity={0.9}
                onPress={() => {
                  setMissingOpen(!missingOpen);
                }}
                accessibilityRole="button"
                accessibilityLabel="Open suggestions to add items"
              >
                <Text style={s.missCtaTxt}>Add</Text>
              </TouchableOpacity>
            </View>
          )}
          {missingInfo && (
            <MissingCategoryModal
              visible={missingOpen}
              onClose={() => setMissingOpen(false)}
              dataByDay={byDay}
              missingList={missingInfo as any}
              onAdd={payload => {
                // add to cart and keep modal open for more picks, or close if you want
                dispatch(addItems([payload] as any));
              }}
            />
          )}

          {/* NEW: Add-ons minimum notice (when only add-ons and < $29) */}
          {!missingInfo && addonsMinInfo && (
            <View style={s.missRow}>
              <View style={s.missIcon}>
                <FontAwesome5
                  iconStyle="solid"
                  name="exclamation-circle"
                  size={18}
                  color="#8A5A00"
                />
              </View>

              <View style={s.missTxtWrap}>
                <Text style={s.missTitle}>{addonsMinInfo.message}</Text>

                <View style={s.missChipsRow}>
                  <View style={s.missChip}>
                    <Text style={s.missChipTxt}>
                      current: ${fmt(addonsMinInfo.total)}
                    </Text>
                  </View>
                  <View style={s.missChip}>
                    <Text style={s.missChipTxt}>
                      add ${fmt(addonsMinInfo.remaining)} more
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={s.missCta}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('Home')}
                accessibilityRole="button"
                accessibilityLabel="Add more items"
              >
                <Text style={s.missCtaTxt}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={s.totalRow}>
            <Text style={s.totalK}>TOTAL:</Text>
            <Text style={[s.totalV, { fontSize: missingInfo ? 15 : 24 }]}>
              {missingInfo
                ? 'Please select missing item'
                : `$ ${subtotal + tiffinPrice}`}{' '}
            </Text>
          </View>

          <TouchableOpacity
            style={s.payBtn}
            disabled={payDisabled}
            onPress={() => navigation.navigate('OrderTrack')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[s.payTxt, payDisabled && s.payBtnDisabled]}>
                To Payment{' '}
              </Text>
              <CartIcon height={24} width={24} style={{ marginLeft: 6 }} />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

/* small bits */
function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <View
      style={[
        s.row,
        bold && { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8 },
      ]}
    >
      <Text style={[s.k, bold && { fontWeight: '800', fontSize: 22 }]}>
        {k}
      </Text>
      <Text style={[s.v, bold && { fontWeight: '800', fontSize: 22 }]}>
        {v}
      </Text>
    </View>
  );
}
function Round({ children, onPress }: any) {
  return (
    <TouchableOpacity style={s.round} onPress={onPress} activeOpacity={0.8}>
      {children}
    </TouchableOpacity>
  );
}

/* styles */
const s = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 24 },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },

  /* day grouping */
  dayCard: {
    backgroundColor: '#F7F8F7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  dayHdr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#EFEFEF',
  },
  dayTitle: { fontWeight: '800', color: C.black, fontSize: 16 },

  /* section blocks */
  block: {
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDE3DE',
    backgroundColor: C.white,
    padding: 8,
  },
  blockHdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  blockChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#EAF6EF',
    color: C.green,
    fontWeight: '800',
    overflow: 'hidden',
  },
  blockChipAlt: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#FFF4E8',
    color: C.oranger,
    fontWeight: '800',
    overflow: 'hidden',
  },
  hdrTrashBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* main item card (smaller, detailed) */
  card: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E6EAE7',
  },
  priceTrashBtn: {
    position: 'absolute',
    right: -2,
    top: -9,
  },
  img: {
    width: 80,
    height: 68,
    borderRadius: 10,
    marginRight: 10,
    resizeMode: 'cover',
  },
  cardContent: { flex: 1, justifyContent: 'flex-start' },
  titleRowTight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    color: C.black,
    overflow: 'hidden',
    fontWeight: '700',
    fontSize: 11,
  },
  catPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#EAF1FF',
    color: '#3A6AE3',
    overflow: 'hidden',
    fontWeight: '700',
    fontSize: 12,
  },
  itemTitle: { color: C.black, fontWeight: '800', fontSize: 14, marginTop: 6 },
  priceUnder: { color: C.green, fontWeight: '800', fontSize: 16, marginTop: 4 },

  /* qty */
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
  round: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.lightOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sign: { color: C.oranger, fontSize: 16, fontWeight: '800' },
  qty: {
    minWidth: 16,
    textAlign: 'center',
    fontWeight: '800',
    color: C.oranger,
    fontSize: 16,
  },

  /* addon item card (smaller, price under title) */
  cardAlt: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 10,
    paddingTop: 18,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  imgSmall: {
    width: 64,
    height: 56,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: 'cover',
  },
  typeBadgeAlt: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#F6F6F6',
    color: C.black,
    overflow: 'hidden',
    fontWeight: '700',
    fontSize: 11,
  },
  catPillAlt: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#FFF0F0',
    color: '#C44',
    overflow: 'hidden',
    fontWeight: '700',
    fontSize: 12,
  },
  itemTitleSm: {
    color: C.black,
    fontWeight: '700',
    fontSize: 13,
    marginTop: 6,
  },
  priceSmUnder: {
    color: C.black,
    fontWeight: '800',
    fontSize: 15,
    marginTop: 4,
  },
  qtyRowSm: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },

  /* existing */
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  detailText: { color: C.sub, fontSize: 14, marginTop: 4 },
  detailLabel: { fontWeight: '700', color: C.black },

  caption: {
    color: C.black,
    marginTop: 6,
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '800',
  },
  note: {
    minHeight: 70,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    color: C.black,
    marginBottom: 12,
  },

  summary: {
    backgroundColor: C.gray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  k: { color: C.black, fontWeight: '600', fontSize: 16 },
  v: { color: C.black, fontWeight: '800', fontSize: 16 },

  upsellText: {
    textAlign: 'center',
    color: C.sub,
    marginTop: 6,
    marginBottom: 10,
  },
  subBtn: {
    height: 60,
    borderRadius: 12,
    borderColor: C.green,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  subBtnTxt: { color: C.green, fontWeight: '800', fontSize: 22 },

  clearCartBtn: {
    height: 60,
    borderRadius: 12,
    borderColor: C.red,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  clearCart: { color: C.red, fontWeight: '700', fontSize: 18 },

  segment: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 22,
    backgroundColor: C.chip,
    overflow: 'hidden',
    marginBottom: 8,
    fontSize: 16,
  },
  segBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: C.green },
  segTxt: { color: C.black, fontWeight: '700' },
  segTxtOn: { color: C.white },

  saveNote: { textAlign: 'center', color: C.sub, marginBottom: 10 },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  totalK: { color: C.sub, fontWeight: '700' },
  totalV: { color: C.black, fontWeight: '900' },

  payBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: C.oranger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payTxt: { fontWeight: '800', color: C.white, fontSize: 20 },

  emptyBox: { backgroundColor: '#FAFAFA', padding: 16, borderRadius: 16 },
  emptyInner: { alignItems: 'center', paddingVertical: 28 },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#0B5733' },
  emptySub: { marginTop: 6, color: '#5E6D62' },
  emptyCta: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0B5733',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCtaTxt: { color: '#FFFFFF', fontWeight: '800' },

  emptyCartText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: C.sub,
    marginTop: 20,
  },

  /* missing/validation notice */
  missWrap: {
    backgroundColor: '#FFF6E5',
    borderColor: '#FFD699',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  missTitle: { fontWeight: '800', color: '#8A5A00', fontSize: 14 },
  missCats: { marginTop: 2, color: '#8A5A00', fontSize: 13 },
  missBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#0B5733',
  },
  missBtnTxt: { color: '#FFF', fontWeight: '800' },

  payBtnDisabled: { opacity: 0.5 },
  missRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFF6E5',
    borderWidth: 1,
    borderColor: '#FFD699',
    marginBottom: 10,
  },
  missIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFE9C2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  missTxtWrap: { flex: 1 },
  missChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  missChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFEFD1',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FFE0A6',
  },
  missChipTxt: { color: '#8A5A00', fontWeight: '700', fontSize: 12 },

  missCta: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#0B5733',
    marginLeft: 10,
  },
  missCtaTxt: { color: '#FFF', fontWeight: '800' },

  /* total cards */
  tiffinTotalBox: {
    backgroundColor: '#FFF6E5',
    borderColor: '#FFD699',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  tiffinTotalTxt: {
    fontWeight: '800',
    fontSize: 16,
    color: '#8A5A00',
  },

  addonTotalBox: {
    backgroundColor: '#EAF1FF',
    borderColor: '#CFE0FF',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  addonTotalTxt: {
    fontWeight: '800',
    fontSize: 16,
    color: '#1B4FBF',
  },

  tiffinSection: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
  },
  tiffinHeader: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  tiffinHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },

  itemCategory: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  itemQty: {
    fontSize: 12,
    color: '#999',
  },
  planTotal: {
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  planTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },

  tiffinPlanBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tiffinPlanHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tiffinPlanTitle: {
    borderColor: 'green',
    paddingVertical: 5,
    paddingHorizontal: 12,
    fontSize: 10,
    borderWidth: 2,
    borderRadius: 5,
  },
});
