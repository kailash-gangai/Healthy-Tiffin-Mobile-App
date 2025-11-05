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
import { addItems, cartFLag } from '../../store/slice/cartSlice';
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
import TagListFilter from '../../components/TagListFilter';

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

type ValidationResult = { ok: boolean; missing: string[]; message: string };

const HomeScreen: React.FC = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { isCartCleared, lines } = useAppSelector(state => state.cart);

  const [tab, setTab] = useState<0 | 1>(0);
  const [daysMeta, setDaysMeta] = useState<any[]>([]);
  const [addonsMeta, setAddonsMeta] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoriesProps[]>([]);
  const [addonCategories, setAddonCategories] = useState<CategoriesProps[]>([]);
  const [priceThreshold, setPriceThreshold] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<BlogProp[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [menuCutOff, setMenuCutOff] = useState<Record<string, any>>({});
  const [menuDisabled, setMenuDisabled] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [showCart, setShowCart] = useState(false);

  const [selectedItemsToAddOnCart, setSelectedItemsToAddOnCart] = useState<
    Item[]
  >([]);
  const [filteredIndex, setFilteredIndex] = useState(0);
  const [openByKey, setOpenByKey] = useState<Record<SectionKey, boolean>>({});
  const [tiffinPlan, setTiffinPlan] = useState<number>(1);

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

  // sort mains and addons
  const sortedCategories = useMemo(
    () =>
      categories
        .slice()
        .sort((a, b) => rankOf(a.key, ORDER_RANK) - rankOf(b.key, ORDER_RANK)),
    [categories],
  );
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

  // threshold-adjust both mains and addons
  const updatedMains = useMemo(
    () => applyPriceThresholds(sortedCategories, priceThreshold),
    [sortedCategories, priceThreshold],
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

  const idToCat = useMemo(() => {
    const m = new Map<string, string>();
    categories.forEach(s =>
      s.value.forEach(v => m.set(v.id, s.key.toLowerCase())),
    );
    addonCategories.forEach(s =>
      s.value.forEach(v => m.set(v.id, s.key.toLowerCase())),
    );
    return m;
  }, [categories, addonCategories]);

  const mainCats = useMemo(
    () => categories.map(s => s.key.toLowerCase()),
    [categories],
  );

  // configurable a-la-carte base; fallback 29
  const A_LA_CARTE_BASE = useMemo(
    () => getNumberFromThreshold(priceThreshold, 'a_la_carte_base', 29),
    [priceThreshold],
  );

  // next plan index from cart
  const nextPlanForDay = useMemo(() => {
    const plans = lines
      .filter(l => l.day === currentDay && l.type === 'main')
      .map(l => Number(l.tiffinPlan) || 1);
    const maxPlan = plans.length ? Math.max(...plans) : 0;
    return maxPlan + 1;
  }, [lines, currentDay]);
  useEffect(() => setTiffinPlan(nextPlanForDay), [nextPlanForDay]);
  useEffect(() => {
    setSelectedItemsToAddOnCart(prev =>
      prev.filter(
        localItem =>
          !lines.some(
            l =>
              l.id === localItem.id &&
              l.day === localItem.day &&
              (Number(l.tiffinPlan) || 1) ===
              (Number(localItem.tiffinPlan) || 1),
          ),
      ),
    );
  }, [lines]);

  // cart items for the day with qty
  const dayCartItems = useMemo(
    () =>
      lines
        .filter(l => l.day === currentDay)
        .map(l => ({
          id: l.id,
          type: l.type as 'main' | 'addon',
          price: l.price,
          qty: Number(l.qty) || 1,
          category: String(l.category || '').toLowerCase(),
          day: l.day,
          tiffinPlan: Number(l.tiffinPlan) || 1,
        })),
    [lines, currentDay],
  );

  // combined preview for day
  const combinedForDay = useMemo(() => {
    return [
      ...dayCartItems,
      ...selectedItemsToAddOnCart
        .filter(i => i.day === currentDay)
        .map(i => ({
          id: i.id,
          type: i.type,
          price: i.price,
          qty: Number(i.qty) || 1,
          category: String(i.category || idToCat.get(i.id) || '').toLowerCase(),
          day: i.day,
          tiffinPlan: Number(i.tiffinPlan) || tiffinPlan || 1,
        })),
    ];
  }, [dayCartItems, selectedItemsToAddOnCart, idToCat, currentDay, tiffinPlan]);

  const hasAnyMainDay = useMemo(
    () => combinedForDay.some(i => i.type === 'main'),
    [combinedForDay],
  );

  // addon dollars day-wise
  const addonCostDay = useMemo(
    () =>
      combinedForDay
        .filter(i => i.type === 'addon')
        .reduce(
          (sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 1),
          0,
        ),
    [combinedForDay],
  );

  // show addons subtotal as-is (no auto base add)
  const addonsSubtotalDisplay = useMemo(() => addonCostDay, [addonCostDay]);

  // remaining to reach minimum when no mains
  const addonMinRemaining = useMemo(
    () => (!hasAnyMainDay ? Math.max(0, A_LA_CARTE_BASE - addonCostDay) : 0),
    [hasAnyMainDay, A_LA_CARTE_BASE, addonCostDay],
  );

  // per-tiffin main totals for the current day
  const tiffinMainTotals = useMemo(() => {
    const map = new Map<number, number>();
    combinedForDay
      .filter(i => i.type === 'main')
      .forEach(i => {
        const p = Number(i.tiffinPlan) || 1;
        const v = (map.get(p) || 0) + (Number(i.price) || 0);
        map.set(p, v);
      });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [combinedForDay]);

  const totalMealCostDay = useMemo(
    () => tiffinMainTotals.reduce((s, [, v]) => s + v, 0),
    [tiffinMainTotals],
  );

  // working set for current tiffin
  const workingSetForCurrentTiffin = useMemo(
    () =>
      selectedItemsToAddOnCart.filter(
        i =>
          i.day === currentDay &&
          (Number(i.tiffinPlan) || tiffinPlan || 1) === (tiffinPlan || 1),
      ),
    [selectedItemsToAddOnCart, currentDay, tiffinPlan],
  );

  // per-tiffin validation
  const tiffinValidation: ValidationResult = useMemo(() => {
    const workingMainCats = mainCats.filter(c =>
      workingSetForCurrentTiffin.some(
        x =>
          x.type === 'main' &&
          String(x.category || idToCat.get(x.id) || '').toLowerCase() === c,
      ),
    );
    const missing = mainCats.filter(c => !workingMainCats.includes(c));
    return {
      ok:
        missing.length === 0 &&
        workingSetForCurrentTiffin.some(x => x.type === 'main'),
      missing,
      message: missing.length ? `Missing meal for: ${missing.join(', ')}` : '',
    };
  }, [mainCats, workingSetForCurrentTiffin, idToCat]);

  // day-level validation with strict addon minimum when no mains
  const dayValidation: ValidationResult = useMemo(() => {
    if (!combinedForDay.length) return { ok: false, missing: [], message: '' };

    if (!hasAnyMainDay) {
      if (addonCostDay < A_LA_CARTE_BASE) {
        const remaining = Math.max(0, A_LA_CARTE_BASE - addonCostDay);
        return {
          ok: false,
          missing: [],
          message: `A La Carte minimum $${A_LA_CARTE_BASE} for ${currentDay}.`,
        };
      }
      return { ok: true, missing: [], message: '' };
    }

    // group by tiffinPlan and require all main categories for any plan with mains
    const plans = new Map<number, typeof combinedForDay>();
    combinedForDay.forEach(i => {
      const p = Number(i.tiffinPlan) || 1;
      if (!plans.has(p)) plans.set(p, []);
      plans.get(p)!.push(i);
    });
    for (const [p, items] of plans) {
      const hasMain = items.some(i => i.type === 'main');
      if (!hasMain) continue;
      const catsPresent = new Set(
        items
          .filter(i => i.type === 'main')
          .map(i => String(i.category || '').toLowerCase()),
      );
      const missing = mainCats.filter(c => !catsPresent.has(c));
      if (missing.length) {
        return {
          ok: false,
          missing,
          message: `Missing meal for: ${missing.join(', ')} (Tiffin ${p})`,
        };
      }
    }
    return { ok: true, missing: [], message: '' };
  }, [
    combinedForDay,
    hasAnyMainDay,
    addonCostDay,
    currentDay,
    mainCats,
    A_LA_CARTE_BASE,
  ]);

  const handleAddNewTiffin = useCallback(() => {
    const payload = workingSetForCurrentTiffin.map(i => ({
      ...i,
      day: currentDay,
      tiffinPlan: tiffinPlan,
      category: String(i.category || idToCat.get(i.id) || '').toUpperCase(),
    }));
    if (!payload.length) return;
    dispatch(addItems(payload as any));
    setSelectedItemsToAddOnCart(prev =>
      prev.filter(
        i =>
          !(
            i.day === currentDay &&
            (Number(i.tiffinPlan) || tiffinPlan || 1) === (tiffinPlan || 1)
          ),
      ),
    );
    openAllMain();
  }, [
    dispatch,
    workingSetForCurrentTiffin,
    currentDay,
    tiffinPlan,
    idToCat,
    openAllMain,
  ]);

  const fetchMetaAndData = useCallback(async () => {
    setLoading(true);
    try {
      const [mainList, addonList, thresholdList, blogResp, cutOffMenu] =
        await Promise.all([
          getAllMetaobjects('main_menus'),
          getAllMetaobjects('addon_menu'),
          getAllMetaobjects('price_threshold'),
          getAllArticles(),
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

      const articles: any = blogResp?.articles;
      const blog: BlogProp[] =
        articles?.map((b: any) => ({
          id: b?.id,
          title: b?.title,
          handle: b?.handle,
          image: b?.image?.url,
          content: b?.content,
          video: b?.video || null,
          author: b?.authorV2?.name,
          date: b?.publishedAt,
          excerpt: b?.excerpt,
        })) ?? [];
      setBlogs(blog);

      // Cutoff meta
      const single: any[] = await getMetaObjectByHandle(cutOffMenu?.[0]?.id);
      const structured = structureCutoffData(single);
      setMenuCutOff(structured);

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
    // if (isCartCleared || lines.length === 0) setSelectedItemsToAddOnCart([]);
    dispatch(cartFLag());
    if (currentDay !== 'Saturday' && currentDay !== 'Sunday') {
      fetchMetaAndData();
    } else {
      setCategories([]);
      setAddonCategories([]);
    }
    console.log('selected Tags on day change', selectedTags);
  }, [isCartCleared, dispatch, fetchMetaAndData, lines, currentDay, selectedTags]);

  // build summary rows with per-tiffin lines
  const summaryRows = useMemo(() => {
    const tiffinRows = tiffinMainTotals.map(
      ([p, v]) => [`Tiffin ${p}`, toMoney(v)] as [string, string],
    );
    const rows: [string, string][] = [
      ['Meal cost', toMoney(totalMealCostDay)],
      ['Add on’s', toMoney(addonsSubtotalDisplay)],
      ...tiffinRows,
      ['Total', toMoney(totalMealCostDay + addonsSubtotalDisplay)],
    ];

    return rows;
  }, [
    tiffinMainTotals,
    totalMealCostDay,
    addonsSubtotalDisplay,
    hasAnyMainDay,
    addonMinRemaining,
    A_LA_CARTE_BASE,
  ]);
  console.log({
    lines,
    categories,
    openByKey,
    selectedItemsToAddOnCart,
  });

  const handleTagChange = (updatedTags: string[]) => {
    setSelectedTags(updatedTags); // Update the selected tags
  };
  return (
    <View style={{ flex: 1, backgroundColor: '#f6f6f8' }}>
      <ScrollView bounces={false}>
        <HeaderGreeting name="Sam" />
        {/* <StatChips /> */}

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
          <TagListFilter selectedTags={selectedTags} onChange={handleTagChange} />
        </View>

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
              const selectedItem = selectedItemsToAddOnCart.find(
                i =>
                  i.day === currentDay &&
                  i.category?.toLowerCase() === cat.key.toLowerCase() &&
                  i.type === 'main',
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
                        setSelectedItemsToAddOnCart={
                          setSelectedItemsToAddOnCart as any
                        }
                        tiffinPlan={tiffinPlan}
                        selectedItemsToAddOnCart={
                          selectedItemsToAddOnCart as any
                        }
                        isLoading={isLoading}
                        onChange={(picked: any) => {
                          if (picked?.selected) setOpen(key, false);
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
                  open={isOpen(key)}
                  setOpen={(v: boolean) => setOpen(key, v)}
                >
                  <View style={styles.gridWrap}>
                    {cat.value.map(d => (
                      <AddonDishCard
                        key={d.id}
                        category={cat.key.toUpperCase()}
                        day={currentDay}
                        type="addon"
                        item={d as any}
                        setSelectedItemsToAddOnCart={
                          setSelectedItemsToAddOnCart as any
                        }
                        selectedItemsToAddOnCart={
                          selectedItemsToAddOnCart as any
                        }
                        isLoading={isLoading}
                        onChange={picked => {
                          if (picked?.selected) setOpen(key, false);
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
          {!menuDisabled && tiffinValidation.ok && (
            <TouchableOpacity
              onPress={handleAddNewTiffin}
              activeOpacity={0.8}
              style={[
                styles.buttonBase,
                styles.addNewTiffin,
                styles.halfButton,
                !tiffinValidation.ok && styles.fullButton,
              ]}
            >
              <PlusIcon width={16} height={16} fill="#0B5733" />
              <Text style={styles.newTiffinText}>Add another tiffin</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => {
              setFilteredIndex(i => Math.min(i + 1, FILTERED_DAYS.length - 1));
              dispatch(addItems(selectedItemsToAddOnCart as any));
              openAllMain();
            }}
            activeOpacity={0.8}
            style={[
              styles.buttonBase,
              styles.goToNextDay,
              !tiffinValidation.ok || menuDisabled
                ? styles.fullButton
                : styles.halfButton,
            ]}
          >
            <Text style={styles.goToNextText}>Go to next day</Text>
            <RightArrowIcon width={16} height={16} fill="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* {!menuDisabled && (
          <View
            style={[styles.pad, { marginTop: 24, marginBottom: 32, gap: 16 }]}
          >
            <PriceSummary rows={summaryRows as any} />

            <CTAButton
              label={dayValidation}
              day={currentDay}
              isDisabled={!dayValidation.ok}
              iconName="shopping-bag"
              onPress={() => {
                dispatch(addItems(selectedItemsToAddOnCart as any));
                navigation.navigate('Cart');
              }}
              toast={{
                type: 'success',
                title: 'Added',
                message: 'Items added to cart',
                position: 'bottom',
              }}
            />
          </View>
        )} */}
        {/*         
        {!menuDisabled && blogs?.length > 0 && (
          <FitnessCarousel items={blogs} />
        )} */}
      </ScrollView>
      <TouchableOpacity
        onPress={() => setShowCart(true)}
        activeOpacity={0.9}
        style={styles.cartBar}
      >
        <View style={styles.cartNotch} />
        <View style={styles.cartBarContent}>
          <Text style={styles.cartLabel}>Cart Summary</Text>
          <Text style={styles.cartTotal}>Total $122</Text>
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
    borderRadius: 10, // perfect pill shape
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
});
