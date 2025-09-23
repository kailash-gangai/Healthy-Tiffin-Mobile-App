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

const MAIN_CAT_ORDER = ['PROTEIN', 'VEGGIES', 'SIDES', 'PROBIOTICS'];
const REQUIRED_CATS = ['PROTEIN', 'VEGGIES', 'SIDES', 'PROBIOTICS'];

const CATALOG = [
  {
    key: 'probiotics',
    value: [
      {
        id: 'gid://shopify/Product/8796777775346',
        variantId: 'gid://shopify/ProductVariant/47804110242034',
        title: 'Basmati Rice',
        description:
          'This traditional cooking method of boiling basmati rice and discarding excess water helps reduce starch content, making it lighter on digestion and lower in glycemic load. Rich in essential carbohydrates for sustained energy, this method preserves the rice’s aromatic flavor while promoting gut health and better blood sugar balance. A wholesome, heart-healthy choice for everyday meals! Calories (8 oz serving): 210 kcalPortion Size: 16 ozaromatic | low-fat | easily digestible',
        tags: ['Gluten free', 'plate method', 'satvik', 'veg', 'VG'],
        image:
          'https://cdn.shopify.com/s/files/1/0772/7094/1938/files/BasmatiRice.jpg?v=1753780861',
        price: '6.0',
      },
      {
        id: 'gid://shopify/Product/8796775186674',
        variantId: 'gid://shopify/ProductVariant/47804105130226',
        title: 'Organic Plain Yogurt (12oz)',
        description:
          'Calories (6 oz serving): 80 kcalPortion Size: 12 ozprobiotic | gut-friendly | calcium-rich | hormone-free | unprocessed dairy',
        tags: ['Dairy', 'Gluten free', 'VG'],
        image:
          'https://cdn.shopify.com/s/files/1/0772/7094/1938/files/Screenshot_2025-07-19_at_9.38.54_AM.png?v=1753780650',
        price: '6.0',
      },
      {
        id: 'gid://shopify/Product/8796763324658',
        variantId: 'gid://shopify/ProductVariant/47804074721522',
        title: 'Add-on! Tamatar Ka Soup',
        description:
          'Tamatar Ka Soup is a light, comforting North Indian-style tomato soup made without cream, onion, or garlic. Simmered with cumin, black pepper, and minimal cold-pressed oil, it’s rich in vitamin C, lycopene, and antioxidants—supporting immunity, digestion, and skin health in a clean, satvik-friendly form. Calories (8 oz serving): 120 kcalPortion Size: 16 ozNorth Indian | antioxidant-rich | hydrating | light | home-style',
        tags: [],
        image:
          'https://cdn.shopify.com/s/files/1/0772/7094/1938/files/TamatarKaSoup.jpg?v=1753779961',
        price: '10.0',
      },
      {
        id: 'gid://shopify/Product/8796780888306',
        variantId: 'gid://shopify/ProductVariant/47804115583218',
        title: 'Malai Chicken kebab',
        description:
          'A creamy, melt-in-the-mouth kebab, marinated in hung curd and light spices, offering calcium-rich, digestion-friendly protein, perfect for a low-oil indulgence. North Indian | Malai | Creamy Texture | High-Protein | Calcium-Rich | Low-Oil | Digestion-Friendly | Indulgent | Organic | Fresh | Local',
        tags: ['fresh', 'Kebab', 'NV', 'organic'],
        image:
          'https://cdn.shopify.com/s/files/1/0772/7094/1938/files/Murghmalaitikka.jpg?v=1753781168',
        price: '4.5',
      },
    ],
  },
  {
    key: 'protein',
    value: [
      {
        id: 'gid://shopify/Product/8796772892914',
        variantId: 'gid://shopify/ProductVariant/47804094808306',
        title: 'Besan Chilla (2pc)',
        description:
          'Rooted in Rajasthani and Punjabi households, this gram flour pancake is packed with plant protein, iron, and fiber. Low in oil and spiced gently, it aids digestion and blood sugar stability, making it a protein-rich, gluten-free choice for breakfasts and light meals.',
        tags: ['Gluten free', 'VG'],
        image:
          'https://cdn.shopify.com/s/files/1/0772/7094/1938/files/BesanKaChilla.jpg?v=1753780523',
        price: '10.0',
      },
      {
        id: 'gid://shopify/Product/8796781478130',
        variantId: 'gid://shopify/ProductVariant/47804116402418',
        title: 'Chicken Changezi',
        description:
          "A Mughlai-style curry with marinated chicken simmered in a rich yogurt, cream, and spice blend. High in protein and flavor, it's indulgent, aromatic, and festive. Calories (8 oz serving): 310 kcalPortion Size: 16 ozMughlai | high-protein | yogurt-based | creamy | slow-cooked",
        tags: ['fresh', 'NV', 'Old Delhi', 'organic'],
        image:
          'https://cdn.shopify.com/s/files/1/0772/7094/1938/files/LOGO_4e14745a-b8ca-4dbb-9b50-146d25f2fad6.png?v=1753781227',
        price: '18.0',
      },
    ],
  },
  {
    key: 'sides',
    value: [
      {
        id: 'gid://shopify/Product/8796763488498',
        variantId: 'gid://shopify/ProductVariant/47804074885362',
        title: 'Add-on! Moroccan Couscous Chickpea Salad',
        description:
          "Couscous & Chickpea Salad is a Mediterranean-inspired bowl of balanced nutrition. Combining fluffy couscous, protein-rich chickpeas, and crisp vegetables, it's tossed with lemon juice and herbs for a light, oil-optional finish. High in fiber, plant protein, and complex carbs, it supports digestion, satiety, and clean, energizing meals.",
        tags: ['VGN'],
        image:
          'https://cdn.shopify.com/s/files/1/0772/7094/1938/files/CouscousSalad.jpg?v=1753779973',
        price: '10.0',
      },
      {
        id: 'gid://shopify/Product/8796763521266',
        variantId: 'gid://shopify/ProductVariant/47804074918130',
        title: 'Add-on! Nutritious! Ashgourd Soup',
        description: '',
        tags: [],
        image: null,
        price: '10.0',
      },
      {
        id: 'gid://shopify/Product/8796782461170',
        variantId: 'gid://shopify/ProductVariant/47804117385458',
        title: 'Punjabi! Chicken Tariwala',
        description:
          "Indulge in the wholesome flavors of Punjabi Chicken Tariwala, a nutritious delight that combines succulent chicken pieces with a rich tomato-based curry. Packed with aromatic spices like cumin, coriander, and garam masala, this dish offers a burst of authentic Punjabi taste. Loaded with lean protein and an array of vitamins from fresh tomatoes, it's a healthy twist to a classic favorite. Enjoy a guilt-free, satisfying meal that nourishes your body and tantalizes your taste buds Punjabi | Organic | Local | Fresh",
        tags: ['fresh', 'NV', 'organic', 'Punjabi'],
        image:
          'https://cdn.shopify.com/s/files/1/0772/7094/1938/files/Screenshot_2025-07-20_at_10.11.21_AM.png?v=1753781307',
        price: '4.5',
      },
    ],
  },
  {
    key: 'veggies',
    value: [
      {
        id: 'gid://shopify/Product/8796762898674',
        variantId: 'gid://shopify/ProductVariant/47804074295538',
        title: 'Add-on! Persian Shirazi Salad',
        description:
          'A light, hydrating Persian classic, this finely diced mix of cucumbers, tomatoes, and red onions is tossed with fresh mint, lemon juice, and olive oil. Rich in vitamin C and antioxidants, it’s a cooling, detoxifying, and naturally low-calorie choice. Calories (8 oz serving): 70 kcalPortion Size: 16 ozPersian | hydrating | digestive support | refreshing | low-calorie',
        tags: ['VGN'],
        image:
          'https://cdn.shopify.com/s/files/1/0772/7094/1938/files/PersianShiraziSalad.jpg?v=1753779931',
        price: '10.0',
      },
      {
        id: 'gid://shopify/Product/8796763226354',
        variantId: 'gid://shopify/ProductVariant/47804074623218',
        title: 'Add-on! Sweet Corn Soup',
        description: '',
        tags: [],
        image: null,
        price: '10.0',
      },
      {
        id: 'gid://shopify/Product/8796763029746',
        variantId: 'gid://shopify/ProductVariant/47804074426610',
        title: 'Add-on! Pumpkin Soup',
        description:
          'Inspired by global wellness cuisine, this pumpkin soup is gently simmered with ginger, herbs, and a touch of cold-pressed olive oil—no cream or heavy seasoning. Naturally rich in beta-carotene, fiber, and vitamin C, it supports immunity, digestion, and skin health while staying light, warming, and comforting. Calories (8 oz serving): 110 kcalPortion Size: 16 ozseasonal | beta-carotene | immune support | gut-soothing',
        tags: [],
        image:
          'https://cdn.shopify.com/s/files/1/0772/7094/1938/files/Pumpkinsoup.jpg?v=1753779944',
        price: '10.0',
      },
    ],
  },
];

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
        const mains = lines
          .filter(x => x.day === d && x.type === 'main')
          .slice()
          .sort((a, b) => catRank(a.category) - catRank(b.category));
        const addons = lines.filter(x => x.day === d && x.type === 'addon');
        return { day: d, mains, addons };
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
    for (const d of scan) {
      const catsPresent = new Set(
        lines
          .filter(l => l.day === d && l.type === 'main')
          .map(l => String(l.category).toUpperCase()),
      );
      const missing = REQUIRED_CATS.filter(c => !catsPresent.has(c));
      if (missing.length > 0) return { day: d, missing };
    }
    return null;
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
                <FontAwesome5
                  iconStyle="solid"
                  name="shopping-bag"
                  size={28}
                  color="#0B5733"
                />
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
            {grouped.map(({ day, mains, addons }) => {
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
                              <Text style={s.blockChip}>Main</Text>
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

                            {mains.map(it => (
                              <View
                                key={`${it.id}-${it.variantId}`}
                                style={s.card}
                              >
                                <TouchableOpacity
                                  onPress={() =>
                                    dispatch(
                                      removeItem({
                                        id: it.id,
                                        variantId: it.variantId,
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
                                  {/* type + category */}
                                  <View style={s.titleRowTight}>
                                    <Text style={s.typeBadge}>
                                      Type: {it.type}
                                    </Text>
                                    <Text style={s.catPill}>{it.category}</Text>
                                  </View>

                                  {/* title */}
                                  <Text style={s.itemTitle} numberOfLines={2}>
                                    {it.title}
                                  </Text>

                                  {/* price below title */}
                                  <Text style={s.priceUnder}>${it.price}</Text>

                                  {/* qty row */}
                                  <View style={s.qtyRow}>
                                    <Round
                                      onPress={() => {
                                        if (it.qty === 1) return;
                                        dispatch(
                                          decreaseItem({
                                            id: it.id,
                                            variantId: it.variantId,
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
                            <View style={s.tiffinTotalBox}>
                              <Text style={s.tiffinTotalTxt}>
                                Total for {day} Tiffin 1 : ${tiffinPrice} + ($
                                {mealCost}) = ${mealCost + tiffinPrice}
                              </Text>
                            </View>
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
                                key={`${it.id}-${it.variantId}`}
                                style={s.cardAlt}
                              >
                                <TouchableOpacity
                                  onPress={() =>
                                    dispatch(
                                      removeItem({
                                        id: it.id,
                                        variantId: it.variantId,
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

            <View style={s.summary}>
              <Row k="Meal box price" v={`$${mealCost + tiffinPrice}`} />
              <Row k="Add on's" v={`$${addons}`} />
              {/* <Row k="Non member shipping" v={`$${nonMember}`} /> */}
              <Row k="Total" v={`$${subtotal + tiffinPrice}`} bold />
            </View>
          </>
        )}
      </ScrollView>

      {!isEmpty && (
        <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
          {/* Missing categories (when mains exist) */}
          {missingInfo && (
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
                <Text style={s.missTitle}>
                  Missing meal for {String(missingInfo.day).toLowerCase()}
                </Text>

                <View style={s.missChipsRow}>
                  {missingInfo.missing.map(x => (
                    <View key={x} style={s.missChip}>
                      <Text style={s.missChipTxt}>{x.toLowerCase()}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={s.missCta}
                activeOpacity={0.9}
                onPress={() => {
                  navigation.navigate('Home');
                }}
                accessibilityRole="button"
                accessibilityLabel="Open suggestions to add items"
              >
                <Text style={s.missCtaTxt}>Add</Text>
              </TouchableOpacity>
            </View>
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
            <Text style={s.totalV}>${subtotal + tiffinPrice}</Text>
          </View>

          <TouchableOpacity
            style={s.payBtn}
            disabled={payDisabled}
            onPress={() => navigation.navigate('OrderTrack')}
          >
            <Text style={[s.payTxt, payDisabled && s.payBtnDisabled]}>
              To Payment{' '}
              <FontAwesome5
                iconStyle="solid"
                name="arrow-right"
                size={16}
                color={C.white}
              />
            </Text>
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
  totalV: { color: C.black, fontWeight: '900', fontSize: 24 },

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
});
