import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PlusIcon from '../../assets/htf-icon/icon-plus.svg';
import RightArrowIcon from '../../assets/htf-icon/icon-right-arriw.svg';
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import { COLORS, SPACING } from '../../ui/theme';
import HeaderGreeting from '../../components/HeaderGreeting';
import StatChips from '../../components/StatChips';
import OrderToggle from '../../components/OrderToggle';
import DayTabs from '../../components/DayTabs';
import Section from '../../components/Section';
import DishCard from '../../components/DishCard';
import PriceSummary from '../../components/PriceSummary';
import CTAButton from '../../components/CTAButton';
import FitnessCarousel from '../../components/FitnessCarousel';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  addItems,
  cartFLag,
  removeDayMains,
} from '../../store/slice/cartSlice';
import { upsertDay } from '../../store/slice/catalogSlice';
import {
  getAllMetaobjects,
  getMetaObjectByHandle,
} from '../../shopify/queries/getMetaObject';
import { getProductsByIds } from '../../shopify/queries/getProducts';
import { getAllArticles } from '../../shopify/queries/blogs';
import AddonDishCard from '../../components/AddonDishCard';
import SkeletonLoading from '../../components/SkeletonLoading';
import EmptyState from '../../components/EmptyState';
import {
  buildEasternCutoff,
  toUSEasternDate,
  US_DAY_INDEX,
} from '../../utils/ESTtime';
import { setAll } from '../../store/slice/priceSlice';
import CartSummaryModal from '../../components/CartSummaryModal';
import Toast from 'react-native-toast-message';

type SectionKey = string;

interface CategoriesProps {
  key: string;
  value: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    image: string;
    price: string | number;
    variantId: string;
  }[];
  _sectionType?: 'main' | 'addon';
}

export type Item = {
  id: string;
  variantId: string;
  title: string;
  description: string;
  type: 'main' | 'addon';
  tags: string[];
  image: string;
  qty?: number;
  category?: string;
  price: string | number;
  day?: string;
  date?: string;
  tiffinPlan?: number;
};

interface BlogProp {
  id: string;
  title: string;
  image?: { url: string | null };
  date: string;
  video?: string | null;
  author?: string;
  content?: string | null;
  excerpt?: string;
}

const ALL_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const ORDER_RANK = ['protein', 'veggies', 'sides', 'probiotics'];
const A_LA_CARTE_RANK = [
  'protein',
  'veggies',
  'sides',
  'probiotics',
  'paranthas',
  'drinks',
  'desserts',
  'kids',
  'oatmeal',
];

function keepDecimals(from: string | number, num: number) {
  const s = String(from);
  const decs = (s.split('.')[1] ?? '').length;
  return decs > 0 ? Number(num.toFixed(decs)) : Math.trunc(num);
}
function rankOf(key: string, ordered: string[]) {
  const i = ordered.indexOf(key.toLowerCase());
  return i === -1 ? 1e9 : i;
}
function getAbsoluteTodayIndex() {
  const js = new Date().getDay();
  const week = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return ALL_DAYS.indexOf(week[js] as (typeof ALL_DAYS)[number]);
}
function toMoney(n: number) {
  return `$${Number.isFinite(n) ? n : 0}`;
}
async function expandCategoryFields(metaObjectId: string) {
  const single: any[] = await getMetaObjectByHandle(metaObjectId);
  const expanded = await Promise.all(
    single
      .filter(d => d.value?.startsWith('[') && d.value?.endsWith(']'))
      .map(async d => {
        if (d.value) d.value = (await getProductsByIds(d.value)) ?? [];
        return d;
      }),
  );
  return expanded.filter(Boolean) as CategoriesProps[];
}

export function applyPriceThresholds(
  categories: CategoriesProps[],
  thresholds: any[],
): CategoriesProps[] {
  const map: Record<string, number> = {};
  for (const t of thresholds) {
    const prefix = t.key.split('_')[0]?.trim();
    if (!prefix) continue;
    const v = parseFloat(t.value);
    if (Number.isFinite(v)) map[prefix] = v;
  }
  return categories.map(cat => {
    const thr = map[cat.key];
    if (!Number.isFinite(thr)) return cat;
    const nextItems = cat.value.map(it => {
      const priceNum = parseFloat(String(it.price));
      if (!Number.isFinite(priceNum)) return it;
      const newNum = Math.max(priceNum - thr, 0);
      return { ...it, price: keepDecimals(it.price, newNum) };
    });
    return { ...cat, value: nextItems };
  });
}

// cutoff helpers
function formatHourValue(num: number) {
  if (num === 0) return '12:00 AM';
  if (num < 12) return `${num}:00 AM`;
  if (num === 12) return '12:00 PM';
  if (num > 12) return `${num - 12}:00 PM`;
  return `${num}:00`;
}
function structureCutoffData(raw: any[]) {
  const obj: Record<string, any> = {};
  raw.forEach(({ key, value }) => {
    if (value === 'true' || value === 'false') {
      obj[key] = value === 'true';
    } else if (!isNaN(Number(value))) {
      obj[key] = formatHourValue(Number(value));
    } else {
      obj[key] = value;
    }
  });
  return obj;
}
function getNumberFromThreshold(ths: any[], key: string, fallback: number) {
  const row = ths?.find(
    (t: any) => String(t.key).toLowerCase() === key.toLowerCase(),
  );
  const v = parseFloat(row?.value);
  return Number.isFinite(v) ? v : fallback;
}

const HomeScreen: React.FC = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { lines } = useAppSelector(state => state.cart);

  const [tab, setTab] = useState<0 | 1>(0);
  const [daysMeta, setDaysMeta] = useState<any[]>([]);
  const [addonsMeta, setAddonsMeta] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoriesProps[]>([]);
  const [addonCategories, setAddonCategories] = useState<CategoriesProps[]>([]);
  const [priceThreshold, setPriceThreshold] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [menuDisabled, setMenuDisabled] = useState(false);

  const [showCart, setShowCart] = useState(false);
  const [filteredIndex, setFilteredIndex] = useState(0);
  const [openByKey, setOpenByKey] = useState<Record<SectionKey, boolean>>({});
  const [previousTiffinPlan, setPreviousTiffinPlan] = useState<number>(1);

  const isOpen = (k: SectionKey) => openByKey[k] ?? true;
  const setOpen = (k: SectionKey, v: boolean) =>
    setOpenByKey(s => ({ ...s, [k]: v }));

  const absoluteTodayIndex = useMemo(() => getAbsoluteTodayIndex(), []);
  const FILTERED_DAYS = useMemo(() => {
    if (absoluteTodayIndex < 0) return ALL_DAYS as unknown as string[];
    return ALL_DAYS.slice(absoluteTodayIndex) as unknown as string[];
  }, [absoluteTodayIndex]);
  const absoluteDayIndex = useMemo(
    () => Math.min(ALL_DAYS.length - 1, absoluteTodayIndex + filteredIndex),
    [absoluteTodayIndex, filteredIndex],
  );
  const currentDay = ALL_DAYS[absoluteDayIndex];
  const lowerDay = currentDay.toLowerCase();

  const currentDayMetaObjectId = useMemo(
    () =>
      daysMeta.find(d => d.handle.toLowerCase() === currentDay.toLowerCase())
        ?.id,
    [daysMeta, currentDay],
  );
  const addonsMetaObjectId = useMemo(
    () =>
      addonsMeta.find(
        (d: any) => d.handle.toLowerCase() === currentDay.toLowerCase(),
      )?.id,
    [addonsMeta, currentDay],
  );

  const sortedCategories = useMemo(
    () =>
      categories
        .slice()
        .sort((a, b) => rankOf(a.key, ORDER_RANK) - rankOf(b.key, ORDER_RANK)),
    [categories],
  );
  const updatedMains = useMemo(
    () => applyPriceThresholds(sortedCategories, priceThreshold),
    [sortedCategories, priceThreshold],
  );

  // Get all tiffin plans for current day
  const dayTiffinPlans = useMemo(() => {
    const dayMainItems = lines.filter(
      (item: any) => item.day === currentDay && item.type === 'main',
    );

    const allTiffinPlans = [
      ...new Set(dayMainItems.map(item => item.tiffinPlan || 1)),
    ];
    return allTiffinPlans.sort((a, b) => a - b);
  }, [lines, currentDay]);

  // Find incomplete tiffin plans (missing categories)
  const incompleteTiffinPlans = useMemo(() => {
    const dayMainItems = lines.filter(
      (item: any) => item.day === currentDay && item.type === 'main',
    );

    return dayTiffinPlans.filter(tiffinPlan => {
      const itemsForPlan = dayMainItems.filter(
        item => item.tiffinPlan === tiffinPlan,
      );
      const categoriesForPlan = itemsForPlan.map(item => item.category);
      const allCategories = updatedMains.map(cat => cat.key.toUpperCase());

      return !allCategories.every(cat => categoriesForPlan.includes(cat));
    });
  }, [lines, currentDay, dayTiffinPlans, updatedMains]);

  // Calculate current tiffin plan - prioritize incomplete ones, then next available
  const currentTiffinPlan = useMemo(() => {
    if (incompleteTiffinPlans.length > 0) {
      // Return the first incomplete tiffin plan
      return incompleteTiffinPlans[0];
    }

    // If all existing tiffin plans are complete, return next available number
    const maxTiffinPlan =
      dayTiffinPlans.length > 0 ? Math.max(...dayTiffinPlans) : 0;
    return maxTiffinPlan + 1;
  }, [incompleteTiffinPlans, dayTiffinPlans]);

  // Show toast when tiffin plan changes
  useEffect(() => {
    if (previousTiffinPlan !== currentTiffinPlan && tab === 0) {
      const message = `Switching to Tiffin ${currentTiffinPlan} for ${currentDay}`;

      // Show toast using react-native-toast-message
      Toast.show({
        type: 'success',
        text1: message,
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
      });

      setPreviousTiffinPlan(currentTiffinPlan);
    }
  }, [currentTiffinPlan, previousTiffinPlan, currentDay, tab]);

  // Get selected item for each category in current tiffin plan
  const getSelectedItemForCategory = useCallback(
    (category: string, tiffinPlan: number) => {
      return lines.find(
        (item: any) =>
          item.day === currentDay &&
          item.category?.toLowerCase() === category.toLowerCase() &&
          item.type === 'main' &&
          item.tiffinPlan === tiffinPlan,
      );
    },
    [lines, currentDay],
  );

  // Check if current tiffin plan is complete
  const isCurrentTiffinComplete = useMemo(() => {
    const allCategories = updatedMains.map(cat => cat.key.toUpperCase());
    return allCategories.every(cat =>
      getSelectedItemForCategory(cat, currentTiffinPlan),
    );
  }, [updatedMains, currentTiffinPlan, getSelectedItemForCategory]);

  // sort addons
  const sortedAddons = useMemo(
    () =>
      addonCategories
        .slice()
        .sort(
          (a, b) =>
            rankOf(a.key, A_LA_CARTE_RANK) - rankOf(b.key, A_LA_CARTE_RANK),
        ),
    [addonCategories],
  );

  const updatedAddons = useMemo(
    () => applyPriceThresholds(sortedAddons, priceThreshold),
    [sortedAddons, priceThreshold],
  );

  const openAllMain = useCallback(() => {
    const next: Record<SectionKey, boolean> = {};
    updatedMains.forEach(cat => {
      const t = (cat as any)._sectionType ?? 'main';
      const k = `${t}:${cat.key}`;
      next[k] = true;
    });
    setOpenByKey(s => ({ ...s, ...next }));
  }, [updatedMains]);

  const closeAllMain = useCallback(() => {
    const next: Record<SectionKey, boolean> = {};
    updatedMains.forEach(cat => {
      const t = (cat as any)._sectionType ?? 'main';
      const k = `${t}:${cat.key}`;
      next[k] = false;
    });
    setOpenByKey(s => ({ ...s, ...next }));
  }, [updatedMains]);

  // Initialize addon sections to always be open
  useEffect(() => {
    if (tab === 1 && updatedAddons.length > 0) {
      const next: Record<SectionKey, boolean> = {};
      updatedAddons.forEach((cat, i) => {
        const key = `addon:${cat.key}-${i}`;
        next[key] = true; // Always keep addon sections open
      });
      setOpenByKey(s => ({ ...s, ...next }));
    }
  }, [tab, updatedAddons]);

  const handleAddNewTiffin = useCallback(() => {
    // When adding new tiffin, we need to calculate the next available tiffin number
    const maxTiffinPlan =
      dayTiffinPlans.length > 0 ? Math.max(...dayTiffinPlans) : 0;
    const nextTiffinPlan = maxTiffinPlan + 1;

    // Show toast for switching to the new tiffin
    Toast.show({
      type: 'success',
      text1: `Switching to Tiffin ${nextTiffinPlan} for ${currentDay}`,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
    });

    // Open all main sections for the new tiffin
    openAllMain();
  }, [dayTiffinPlans, currentDay, openAllMain]);

  const handleGoToNextDay = useCallback(() => {
    // Move to next day if available
    if (filteredIndex < FILTERED_DAYS.length - 1) {
      setFilteredIndex(prev => prev + 1);

      // Show toast for the new day
      const nextDayIndex = Math.min(
        absoluteTodayIndex + filteredIndex + 1,
        ALL_DAYS.length - 1,
      );
      const nextDay = ALL_DAYS[nextDayIndex];

      Toast.show({
        type: 'success',
        text1: `Switching to ${nextDay}`,
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
      });

      // Open all main sections for the new day
      openAllMain();
    } else {
      // If it's the last day, show message
      Toast.show({
        type: 'info',
        text1: 'You have reached the last available day',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
      });
    }
  }, [filteredIndex, FILTERED_DAYS.length, absoluteTodayIndex, openAllMain]);

  const handleItemSelection = useCallback(
    (category: string) => {
      const key = `main:${category}`;
      setOpen(key, false);

      if (isCurrentTiffinComplete) {
        closeAllMain();
      }
    },
    [isCurrentTiffinComplete, closeAllMain],
  );

  const fetchMetaAndData = useCallback(async () => {
    setLoading(true);
    try {
      const [mainList, addonList, thresholdList, cutOffMenu] =
        await Promise.all([
          getAllMetaobjects('main_menus'),
          getAllMetaobjects('addon_menu'),
          getAllMetaobjects('price_threshold'),
          getAllMetaobjects('menu_cut_off_menu'),
        ]);

      setDaysMeta(mainList ?? []);
      setAddonsMeta(addonList ?? []);

      if (thresholdList?.[0]?.id) {
        const priceMetaobject: any = await getMetaObjectByHandle(
          thresholdList[0].id,
        );
        setPriceThreshold(priceMetaobject ?? []);
        dispatch(setAll(priceMetaobject ?? []));
      } else {
        setPriceThreshold([]);
      }

      // Cutoff meta
      const single: any[] = await getMetaObjectByHandle(cutOffMenu?.[0]?.id);
      const structured = structureCutoffData(single);

      const disableKey = `disable_${lowerDay}_menu`;
      if (structured[disableKey] === true) {
        setMenuDisabled(true);
        setCategories([]);
        setAddonCategories([]);
        setLoading(false);
        return;
      }

      const cutoffKey = `${lowerDay}_cut_off_time`;
      const cutoffVal = structured[cutoffKey];
      if (cutoffVal) {
        const deviceNow = new Date();
        const usNow = toUSEasternDate(deviceNow);
        const usDayIdx = usNow.getDay();
        const currentDayIndex = US_DAY_INDEX[lowerDay];
        const cutoffUS = buildEasternCutoff(usNow, cutoffVal);
        if (usDayIdx === currentDayIndex && usNow > cutoffUS) {
          setMenuDisabled(true);
          setCategories([]);
          setAddonCategories([]);
          setLoading(false);
          return;
        }
      }

      setMenuDisabled(false);

      const [mainCat, addOnCat] = await Promise.all([
        currentDayMetaObjectId
          ? expandCategoryFields(currentDayMetaObjectId)
          : Promise.resolve([]),
        addonsMetaObjectId
          ? expandCategoryFields(addonsMetaObjectId)
          : Promise.resolve([]),
      ]);

      setCategories(mainCat);
      setAddonCategories(addOnCat);

      if (mainCat.length)
        dispatch(
          upsertDay({ catalog: mainCat as any, day: currentDay as any }),
        );
    } catch (e) {
      console.error('Error fetching metaobjects:', e);
      setCategories([]);
      setAddonCategories([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentDay,
    currentDayMetaObjectId,
    addonsMetaObjectId,
    dispatch,
    lowerDay,
  ]);

  useEffect(() => {
    dispatch(cartFLag());
    if (currentDay !== 'Saturday' && currentDay !== 'Sunday') {
      fetchMetaAndData();
    } else {
      setCategories([]);
      setAddonCategories([]);
    }
  }, [dispatch, fetchMetaAndData, currentDay]);

  // Calculate cart total
  const cartTotal = useMemo(() => {
    return lines.reduce(
      (total, item) => total + Number(item.price) * (item.qty || 1),
      0,
    );
  }, [lines]);

  // Get total tiffin count for current day (complete and incomplete)
  const totalTiffinCount = useMemo(() => {
    return dayTiffinPlans.length;
  }, [dayTiffinPlans]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f6f6f8' }}>
      <ScrollView bounces={false}>
        <HeaderGreeting name="Sam" />

        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
            padding: 4,
          }}
        >
          <OrderToggle index={tab} onChange={setTab} />
          <DayTabs
            days={FILTERED_DAYS as string[]}
            onChange={setFilteredIndex}
          />
        </View>

        {/* Tiffin Plan Indicator */}
        {/* {!menuDisabled && tab === 0 && (
          <View style={styles.tiffinIndicator}>
            <Text style={styles.tiffinText}>
              Tiffin {currentTiffinPlan}
              {totalTiffinCount > 0 &&
                ` of ${Math.max(totalTiffinCount, currentTiffinPlan)}`}
            </Text>
          </View>
        )} */}

        {menuDisabled && (
          <EmptyState
            key={'disabled-menu'}
            currentDay={currentDay}
            message="Menu not available for this day."
          />
        )}

        {!menuDisabled &&
          !categories.length &&
          currentDay !== 'Saturday' &&
          currentDay !== 'Sunday' && <SkeletonLoading count={5} />}

        {!menuDisabled && tab === 0 && (
          <View>
            {(currentDay === 'Saturday' || currentDay === 'Sunday') && (
              <EmptyState
                key={'addon-menu'}
                currentDay={currentDay}
                message="  Please check our weekday menu. Available Monday to Friday."
              />
            )}
            {updatedMains.map(cat => {
              const sectionType =
                ((cat as any)._sectionType as 'main' | 'addon') ?? 'main';
              const key = `${sectionType}:${cat.key}`;

              // Find selected item for this category and current tiffin plan
              const selectedItem = getSelectedItemForCategory(
                cat.key,
                currentTiffinPlan,
              );

              return (
                <Section
                  key={key}
                  title={cat.key.toUpperCase()}
                  note={selectedItem ? selectedItem.title : 'Please Select One'}
                  open={isOpen(key)}
                  setOpen={(v: boolean) => setOpen(key, v)}
                >
                  <View style={styles.gridWrap}>
                    {cat.value.map((d: any) => (
                      <DishCard
                        key={d.id}
                        category={cat.key.toUpperCase()}
                        day={currentDay}
                        type="main"
                        item={d as any}
                        tiffinPlan={currentTiffinPlan}
                        isLoading={isLoading}
                        onChange={(picked: any) => {
                          if (picked?.selected) {
                            handleItemSelection(cat.key);
                          }
                        }}
                      />
                    ))}
                  </View>
                </Section>
              );
            })}
          </View>
        )}

        {!menuDisabled && tab === 1 && (
          <>
            {(currentDay === 'Saturday' || currentDay === 'Sunday') && (
              <EmptyState
                key="a-la-carte"
                currentDay={currentDay}
                message="  Please check our A La Carte. Available Monday to Friday."
              />
            )}
            {updatedAddons.map((cat, i) => {
              const key = `addon:${cat.key}-${i}`;
              return (
                <Section
                  key={key}
                  title={cat.key.toUpperCase()}
                  note={`Select from ${cat.value.length} options`}
                  open={true} // Always open for addons
                  setOpen={() => {}} // No-op function since we don't want to close addons
                >
                  <View style={styles.gridWrap}>
                    {cat.value.map(d => (
                      <AddonDishCard
                        key={d.id}
                        category={cat.key.toUpperCase()}
                        day={currentDay}
                        type="addon"
                        item={d as any}
                        tiffinPlan={currentTiffinPlan}
                        isLoading={isLoading}
                        onChange={picked => {
                          // No need to close section for addons
                        }}
                      />
                    ))}
                  </View>
                </Section>
              );
            })}
          </>
        )}

        {/* per-tiffin add */}
        <View style={styles.dualButtonWrap}>
          {!menuDisabled && (
            <TouchableOpacity
              onPress={handleAddNewTiffin}
              activeOpacity={0.8}
              style={[
                styles.buttonBase,
                styles.addNewTiffin,
                styles.halfButton,
              ]}
            >
              <PlusIcon width={16} height={16} fill="#0B5733" />
              <Text style={styles.newTiffinText}>Add another tiffin</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleGoToNextDay}
            activeOpacity={0.8}
            style={[
              styles.buttonBase,
              styles.goToNextDay,
              menuDisabled ? styles.fullButton : styles.halfButton,
            ]}
          >
            <Text style={styles.goToNextText}>Go to next day</Text>
            <RightArrowIcon width={16} height={16} fill="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Clear Day Button */}
        {!menuDisabled && totalTiffinCount > 0 && (
          <TouchableOpacity
            onPress={() => dispatch(removeDayMains({ day: currentDay }))}
            style={styles.clearDayButton}
          >
            <Text style={styles.clearDayText}>
              Clear all tiffins for {currentDay}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Cart Summary Bar */}
      <TouchableOpacity
        onPress={() => setShowCart(true)}
        activeOpacity={0.9}
        style={styles.cartBar}
      >
        <View style={styles.cartNotch} />
        <View style={styles.cartBarContent}>
          <Text style={styles.cartLabel}>Cart Summary</Text>
          <Text style={styles.cartTotal}>Total ${cartTotal.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>

      <CartSummaryModal
        visible={showCart}
        navigation={navigation}
        onClose={() => setShowCart(false)}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    columnGap: 8,
    marginTop: 8,
  },
  pad: { paddingHorizontal: SPACING, marginTop: -34 },
  container: { padding: 10, marginLeft: 10, paddingTop: 15 },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  dualButtonWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  halfButton: {
    flex: 1,
  },
  fullButton: {
    flex: 1,
    width: '100%',
  },
  addNewTiffin: {
    borderColor: '#0B5733',
    backgroundColor: '#d0ece2',
  },
  newTiffinText: {
    color: '#22774fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  goToNextDay: {
    borderColor: '#0B5733',
    backgroundColor: '#32be84',
  },
  goToNextText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#101010',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 14,
    paddingBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#232323',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  cartNotch: {
    position: 'absolute',
    top: 6,
    width: 40,
    height: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    opacity: 0.9,
  },
  cartBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 10,
  },
  cartLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  cartTotal: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  tiffinIndicator: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tiffinText: {
    color: '#0B5733',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  clearDayButton: {
    backgroundColor: '#FFE8E8',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearDayText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '600',
  },
});
