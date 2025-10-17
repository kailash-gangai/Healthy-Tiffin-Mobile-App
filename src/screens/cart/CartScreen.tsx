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
import { COLORS as C } from '../../ui/theme';
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
import CartIcon from '../../assets/htf-icon/icon-cart.svg';
import InfoIcon from '../../assets/htf-icon/icon-info.svg';
import TrashIcon from '../../assets/htf-icon/icon-trans.svg';
import DownArrow from '../../assets/htf-icon/icon-down-arrow.svg';
import CrossIcon from '../../assets/htf-icon/icon-cross.svg';

const MAIN_CAT_ORDER = ['PROTEIN', 'VEGGIES', 'SIDES', 'PROBIOTICS'];
const REQUIRED_CATS = ['PROTEIN', 'VEGGIES', 'SIDES', 'PROBIOTICS'];

const n = (v: any) => Number(v) || 0;
const money = (v: number) => (Math.round(v * 100) / 100).toFixed(2);

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
  const [mode, setMode] = useState<'delivery' | 'pickup'>('delivery'); // kept as-is
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

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

  const nonMember = 0;
  let tiffinPrice = 29 * uniqueDayCount * uniqueTiffinCount;
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

  // missing categories per plan
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

  // add-ons minimum when only addons
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

  // collapsers
  const [openByDay, setOpenByDay] = useState<Record<string, boolean>>({});
  const [openByPlan, setOpenByPlan] = useState<Record<string, boolean>>({});
  const isOpen = (d: string) => openByDay[d] ?? true;
  const toggleDay = (d: string) =>
    setOpenByDay(p => ({ ...p, [d]: !isOpen(d) }));
  const keyPlan = (d: string, p: number) => `${d}:${p}`;
  const isPlanOpen = (d: string, p: number) =>
    openByPlan[keyPlan(d, p)] ?? true;
  const togglePlan = (d: string, p: number) =>
    setOpenByPlan(s => ({ ...s, [keyPlan(d, p)]: !isPlanOpen(d, p) }));

  const onRemoveDayMains = (d: string) => dispatch(removeDayMains({ day: d }));
  const onRemoveDayAddons = (d: string) =>
    dispatch(removeDayAddons({ day: d }));

  const fmt = (n: number) => n.toFixed(2);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.white }}>
      <AppHeader title="My Cart" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={{ padding: 12, paddingBottom: contentBottomPad }}
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
                (s, x) => s + Number(x.price || 0) * (x.qty ?? 1),
                0,
              );

              // per-day mains extras (priced mains)
              const dayMainsExtra = mains
                .filter(x => Number(x.price) > 0)
                .reduce((s, x) => s + Number(x.price || 0) * (x.qty ?? 1), 0);

              // base tiffin price = 29 * number of plans that day
              const plansCount = new Set(mains.map(m => m.tiffinPlan)).size;
              const dayBase = plansCount > 0 ? 29 * plansCount : 0;

              const dayTotal = dayBase + dayMainsExtra + dayAddonsTotal;
              const fmt = (n: number) => (Math.round(n * 100) / 100).toFixed(2);

              return (
                <View key={day} style={s.dayCard}>
                  <TouchableOpacity
                    style={s.dayHdr}
                    onPress={() => toggleDay(day)}
                    activeOpacity={0.9}
                  >
                    <Text style={s.dayTitle}>{day} Summary</Text>
                    {/* isOpen(day) ? 'chevron-up' : 'chevron-down'} */}
                    <DownArrow
                      height={30}
                      width={20}
                      style={{
                        transform: [
                          { rotate: isOpen(day) ? '180deg' : '0deg' },
                        ],
                      }}
                    />
                  </TouchableOpacity>

                  {isOpen(day) && (
                    <>
                      {/* Mains block with collapsible tiffin plans */}
                      {mains.length > 0 && (
                        <View style={s.block}>
                          <View style={s.blockHdRow}>
                            <Text style={s.blockChip}>Main</Text>
                            <TouchableOpacity
                              onPress={() => onRemoveDayMains(day)}
                              style={s.hdrTrashBtn}
                            >
                              <TrashIcon height={20} width={20} />
                            </TouchableOpacity>
                          </View>

                          {tiffinPlans.map(plan => (
                            <View
                              key={`tiffin-${plan.plan}`}
                              style={s.planWrap}
                            >
                              <TouchableOpacity
                                style={s.planHdr}
                                onPress={() => togglePlan(day, plan.plan)}
                              >
                                <Text style={s.planTitle}>
                                  Tiffin {plan.plan}
                                </Text>
                                <DownArrow
                                  width={25}
                                  height={25}
                                  style={{
                                    transform: [
                                      {
                                        rotate: isPlanOpen(day, plan.plan)
                                          ? '180deg'
                                          : '0deg',
                                      },
                                    ],
                                  }}
                                />

                                {/* isPlanOpen(day, plan.plan)
                                      ? 'chevron-up'
                                      : 'chevron-down'
                                  */}
                              </TouchableOpacity>

                              {isPlanOpen(day, plan.plan) && (
                                <View style={{ gap: 6 }}>
                                  {plan.items.map((it: any) => (
                                    <View
                                      key={`${it.id}-${it.variantId}-${it.tiffinPlan}`}
                                      style={s.cardMini}
                                    >
                                      <TouchableOpacity
                                        onPress={() =>
                                          dispatch(
                                            removeItem({
                                              id: it.id,
                                              variantId: it.variantId,
                                              tiffinPlan:
                                                it.tiffinPlan as number,
                                              type: it.type,
                                            }),
                                          )
                                        }
                                        style={s.closeBtn}
                                        accessibilityRole="button"
                                        accessibilityLabel="Remove item"
                                      >
                                        <TrashIcon height={15} width={15} />
                                        {/* <CrossIcon width={25} height={25} stroke="red" /> */}
                                      </TouchableOpacity>

                                      <View style={s.thumbWrap}>
                                        <Image
                                          source={{ uri: it.image }}
                                          style={s.imgMini}
                                        />
                                        {Number(it.price) > 0 ? (
                                          <View style={s.priceBadge}>
                                            <Text style={s.priceText}>
                                              +{'('}${it.price}
                                              {')'}
                                            </Text>
                                          </View>
                                        ) : null}
                                      </View>

                                      <View style={s.cardContentMini}>
                                        <View style={s.rowTop}>
                                          <Text style={s.catPill}>
                                            {it.category}
                                          </Text>
                                        </View>

                                        <Text
                                          style={s.itemTitleMini}
                                          numberOfLines={2}
                                        >
                                          {it.title}
                                        </Text>

                                        <View style={s.qtyPill}>
                                          {/* <TouchableOpacity
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
                                            style={s.pillBtn}
                                          >
                                            <Text style={s.pillBtnTxt}>−</Text>
                                          </TouchableOpacity> */}

                                          <Text style={s.qtyNum}>
                                            {it.qty} Qty
                                          </Text>
                                          {/* <TouchableOpacity
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
                                            style={s.pillBtn}
                                          >
                                            <Text style={s.pillBtnTxt}>+</Text>
                                          </TouchableOpacity> */}
                                        </View>
                                      </View>
                                    </View>
                                  ))}
                                </View>
                              )}
                            </View>
                          ))}

                          {!missingInfo && (
                            <View style={[s.tiffinTotalBox, { marginTop: 8 }]}>
                              <Text style={s.tiffinTotalTxt}>
                                {day} total: ${fmt(dayBase)} + ($
                                {fmt(dayMainsExtra)}) = ${fmt(dayTotal)}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}

                      {/* Add-ons block: flat compact cards */}
                      {addons.length > 0 && (
                        <View style={s.block}>
                          <View style={s.blockHdRow}>
                            <Text style={s.blockChipAlt}>Add-ons</Text>
                            <TouchableOpacity
                              onPress={() => onRemoveDayAddons(day)}
                              style={s.hdrTrashBtn}
                            >
                              <TrashIcon height={20} width={20} />
                            </TouchableOpacity>
                          </View>

                          {addons.map(it => (
                            <View
                              key={`${it.id}-${it.variantId}-${it.tiffinPlan}-${it.day}`}
                              style={s.cardMiniAlt}
                            >
                              <TouchableOpacity
                                onPress={() =>
                                  dispatch(
                                    removeItem({
                                      id: it.id,
                                      variantId: it.variantId,
                                      tiffinPlan: it.tiffinPlan as number,
                                      type: it.type,
                                    }),
                                  )
                                }
                                style={s.closeBtn}
                                accessibilityRole="button"
                                accessibilityLabel="Remove add-on"
                              >
                                <TrashIcon height={15} width={15} />
                              </TouchableOpacity>

                              <View style={s.thumbWrap}>
                                <Image
                                  source={{ uri: it.image }}
                                  style={s.imgMini}
                                />
                                <View style={s.priceBadgeAlt}>
                                  <Text style={s.priceText}>${it.price}</Text>
                                </View>
                              </View>

                              <View style={s.cardContentMini}>
                                <View style={s.rowTop}>
                                  <Text style={s.catPillAlt}>
                                    {it.category}
                                  </Text>
                                </View>

                                <Text style={s.itemTitleMini} numberOfLines={2}>
                                  {it.title}
                                </Text>

                                <View style={s.qtyPillAlt}>
                                  <TouchableOpacity
                                    onPress={() => {
                                      dispatch(
                                        decreaseItem({
                                          id: it.id,
                                          variantId: it.variantId,
                                          tiffinPlan: it.tiffinPlan as number,
                                          type: it.type,
                                        }),
                                      );
                                    }}
                                    style={s.pillBtnAlt}
                                  >
                                    <Text style={s.pillBtnTxtAlt}>−</Text>
                                  </TouchableOpacity>
                                  <Text style={s.qtyNumAlt}>{it.qty}</Text>
                                  <TouchableOpacity
                                    onPress={() =>
                                      dispatch(
                                        increaseItem({
                                          id: it.id,
                                          variantId: it.variantId,
                                          tiffinPlan: it.tiffinPlan as number,
                                          type: it.type,
                                        }),
                                      )
                                    }
                                    style={s.pillBtnAlt}
                                  >
                                    <Text style={s.pillBtnTxtAlt}>+</Text>
                                  </TouchableOpacity>
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
              );
            })}

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
                <Row k="Total" v={`$${subtotal + tiffinPrice}`} bold />
              </View>
            )}
          </>
        )}
      </ScrollView>

      {!isEmpty && (
        <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
          {missingInfo && (
            <View style={s.missRow}>
              <View style={s.missIcon}>
                <InfoIcon height={24} width={24} />
              </View>
              <View style={s.missTxtWrap}>
                <Text>
                  Missing meal for{' '}
                  {[
                    ...new Set((missingInfo as any).map((m: any) => m.day)),
                  ].join(', ')}
                </Text>
              </View>
              <TouchableOpacity
                style={s.missCta}
                activeOpacity={0.9}
                onPress={() => setMissingOpen(!missingOpen)}
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
              onAdd={payload => dispatch(addItems([payload] as any))}
            />
          )}

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
                <Text>{addonsMinInfo.message}</Text>
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
              >
                <Text style={s.missCtaTxt}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={s.totalRow}>
            <Text style={s.totalK}>TOTAL:</Text>
            <Text style={[s.totalV, { fontSize: missingInfo ? 15 : 22 }]}>
              {missingInfo
                ? 'Please select missing item'
                : `$ ${subtotal + tiffinPrice}`}
            </Text>
          </View>

          <TouchableOpacity
            style={s.payBtn}
            disabled={isEmpty || !!missingInfo || !!addonsMinInfo}
            onPress={() => navigation.navigate('OrderTrack')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={[
                  s.payTxt,
                  (isEmpty || !!missingInfo || !!addonsMinInfo) &&
                    s.payBtnDisabled,
                ]}
              >
                To Payment
              </Text>
              <CartIcon height={22} width={22} style={{ marginLeft: 6 }} />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <View
      style={[
        s.row,
        bold && { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8 },
      ]}
    >
      <Text style={[s.k, bold && { fontWeight: '800', fontSize: 20 }]}>
        {k}
      </Text>
      <Text style={[s.v, bold && { fontWeight: '800', fontSize: 20 }]}>
        {v}
      </Text>
    </View>
  );
}

/* styles */
const s = StyleSheet.create({
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.white,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },

  dayCard: {
    backgroundColor: '#F7F8F7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
    overflow: 'hidden',
  },
  dayHdr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#EFEFEF',
  },
  dayTitle: { fontWeight: '800', color: C.black, fontSize: 15 },

  block: {
    margin: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDE3DE',
    backgroundColor: C.white,
    padding: 6,
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
  },
  blockChipAlt: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#FFF4E8',
    color: C.oranger,
    fontWeight: '800',
  },
  hdrTrashBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* tiffin collapsers */
  planWrap: { marginBottom: 6 },
  planHdr: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 6,
    backgroundColor: '#F4F5F4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E7EBE8',
  },
  planTitle: { fontSize: 12, fontWeight: '800', color: C.black },

  /* compact item card */
  cardMini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E6EAE7',
  },
  cardMiniAlt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  closeBtn: { position: 'absolute', right: -2, top: -4, padding: 6 },
  thumbWrap: { position: 'relative', marginRight: 8 },
  imgMini: { width: 56, height: 48, borderRadius: 8, resizeMode: 'cover' },
  priceBadge: {
    position: 'absolute',
    right: 3,
    bottom: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#0B5733',
  },
  priceBadgeAlt: {
    position: 'absolute',
    right: 3,
    bottom: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#1B4FBF',
  },
  priceText: { color: '#FFF', fontSize: 10, fontWeight: '800' },

  cardContentMini: { flex: 1 },
  rowTop: {
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
    fontWeight: '700',
    fontSize: 10,
  },
  typeBadgeAlt: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#F6F6F6',
    color: C.black,
    fontWeight: '700',
    fontSize: 10,
  },
  catPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#EAF1FF',
    color: '#3A6AE3',
    fontWeight: '700',
    fontSize: 10,
  },
  catPillAlt: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#FFF0F0',
    color: '#C44',
    fontWeight: '700',
    fontSize: 10,
  },
  itemTitleMini: {
    color: C.black,
    fontWeight: '700',
    fontSize: 12,
    marginTop: 4,
  },

  qtyPill: {
    marginTop: 6,
    alignSelf: 'flex-start',
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F2F7F4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    gap: 6,
  },
  pillBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: '#D9E3DC',
  },
  pillBtnTxt: { fontSize: 13, fontWeight: '800', color: C.green },
  qtyNum: {
    minWidth: 16,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    color: C.black,
  },

  qtyPillAlt: {
    marginTop: 6,
    alignSelf: 'flex-start',
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F6F7FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    gap: 6,
  },
  pillBtnAlt: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: '#D9E3FC',
  },
  pillBtnTxtAlt: { fontSize: 13, fontWeight: '800', color: '#1B4FBF' },
  qtyNumAlt: {
    minWidth: 16,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    color: C.black,
  },

  /* totals and misc */
  caption: {
    color: C.black,
    marginTop: 6,
    marginBottom: 6,
    fontSize: 15,
    fontWeight: '800',
  },
  note: {
    minHeight: 70,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    padding: 10,
    color: C.black,
    marginBottom: 10,
  },
  summary: {
    backgroundColor: C.gray,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  k: { color: C.black, fontWeight: '600', fontSize: 15 },
  v: { color: C.black, fontWeight: '800', fontSize: 15 },

  clearCartBtn: {
    height: 48,
    borderRadius: 12,
    borderColor: C.red,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  clearCart: { color: C.red, fontWeight: '700', fontSize: 16 },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  totalK: { color: C.sub, fontWeight: '700' },
  totalV: { color: C.black, fontWeight: '900' },

  payBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: C.oranger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payTxt: { fontWeight: '800', color: C.white, fontSize: 18 },
  payBtnDisabled: { opacity: 0.5 },

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

  tiffinTotalBox: {
    backgroundColor: '#FFF6E5',
    borderColor: '#FFD699',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 6,
  },
  tiffinTotalTxt: { fontWeight: '800', fontSize: 14, color: '#8A5A00' },

  addonTotalBox: {
    backgroundColor: '#EAF1FF',
    borderColor: '#CFE0FF',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 6,
    marginBottom: 8,
  },
  addonTotalTxt: { fontWeight: '800', fontSize: 14, color: '#1B4FBF' },
});
