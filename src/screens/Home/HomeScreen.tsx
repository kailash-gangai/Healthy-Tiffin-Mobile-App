import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PlusIcon from '../../assets/htf-icon/icon-add.svg';
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
const A_LA_CARTE_RANK = ['paranthas', 'drinks', 'desserts', 'kids', 'oatmeal'];

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
function applyPriceThresholds(
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

// Helper: convert hour value
function formatHourValue(num: number) {
  if (num === 0) return '12:00 AM';
  if (num < 12) return `${num}:00 AM`;
  if (num === 12) return '12:00 PM';
  if (num > 12) return `${num - 12}:00 PM`;
  return `${num}:00`;
}

// Helper: structure cutoff settings
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

  const updatedCategory = useMemo(
    () => applyPriceThresholds(sortedCategories, priceThreshold),
    [sortedCategories, priceThreshold],
  );

  const mergedCatalog = useMemo(
    () => [...updatedCategory, ...sortedAddons],
    [updatedCategory, sortedAddons],
  );

  const openAllMain = useCallback(() => {
    const next: Record<SectionKey, boolean> = {};
    updatedCategory.forEach(cat => {
      const t = (cat as any)._sectionType ?? 'main';
      const k = `${t}:${cat.key}`;
      next[k] = true;
    });
    setOpenByKey(s => ({ ...s, ...next }));
  }, [updatedCategory]);

  const idToCat = useMemo(() => {
    const m = new Map<string, string>();
    categories.forEach(s =>
      s.value.forEach(v => m.set(v.id, s.key.toLowerCase())),
    );
    return m;
  }, [categories]);
  const mainCats = useMemo(
    () => categories.map(s => s.key.toLowerCase()),
    [categories],
  );

  const hasAnyMain = useMemo(
    () => selectedItemsToAddOnCart.some(i => i.type === 'main'),
    [selectedItemsToAddOnCart],
  );
  const hasAnyAddon = useMemo(
    () => selectedItemsToAddOnCart.some(i => i.type === 'addon'),
    [selectedItemsToAddOnCart],
  );
  const mealCost = useMemo(
    () =>
      selectedItemsToAddOnCart
        .filter(item => item.type === 'main')
        .reduce((total, item) => total + parseFloat(String(item.price)), 0),
    [selectedItemsToAddOnCart],
  );
  const addonCost = useMemo(
    () =>
      selectedItemsToAddOnCart
        .filter(i => i.type === 'addon')
        .reduce((sum, i) => {
          const price = Number.parseFloat(String(i.price)) || 0;
          const qty = Number.isFinite(Number(i.qty)) ? Number(i.qty) : 1;
          return sum + price * qty;
        }, 0),
    [selectedItemsToAddOnCart],
  );

  // derive next tiffin plan from cart for current day
  const nextPlanForDay = useMemo(() => {
    const plans = lines
      .filter(l => l.day === currentDay)
      .map(l => Number(l.tiffinPlan) || 1);
    const maxPlan = plans.length ? Math.max(...plans) : 0;
    return maxPlan + 1;
  }, [lines, currentDay]);

  useEffect(() => {
    setTiffinPlan(nextPlanForDay);
  }, [nextPlanForDay]);

  // sync local selection when items are removed from the cart
  useEffect(() => {
    setSelectedItemsToAddOnCart(prev =>
      prev.filter(localItem =>
        lines.some(
          l =>
            l.id === localItem.id &&
            l.day === localItem.day &&
            (Number(l.tiffinPlan) || 1) === (Number(localItem.tiffinPlan) || 1),
        ),
      ),
    );
  }, [lines]);

  // validation uses cart+local for the current day
  const dayCartItems = useMemo(
    () => lines.filter(l => l.day === currentDay),
    [lines, currentDay],
  );

  const combinedForDay = useMemo(() => {
    return [
      ...dayCartItems.map(i => ({
        id: i.id,
        type: i.type as 'main' | 'addon',
        price: i.price,
        category: String(i.category || '').toLowerCase(),
        day: i.day,
      })),
      ...selectedItemsToAddOnCart.map(i => ({
        id: i.id,
        type: i.type,
        price: i.price,
        category: String(i.category || idToCat.get(i.id) || '').toLowerCase(),
        day: i.day,
      })),
    ];
  }, [dayCartItems, selectedItemsToAddOnCart, idToCat]);

  const hasAnyMainDay = useMemo(
    () => combinedForDay.some(i => i.type === 'main'),
    [combinedForDay],
  );

  const addonCostDay = useMemo(
    () =>
      combinedForDay
        .filter(i => i.type === 'addon')
        .reduce((sum, i) => sum + (Number(i.price) || 0), 0),
    [combinedForDay],
  );

  const validation = useMemo(() => {
    if (!hasAnyMainDay && combinedForDay.some(i => i.type === 'addon')) {
      if (addonCostDay < 29)
        return {
          ok: false,
          missing: [],
          message: 'A La Carte Minimum $29 for ' + currentDay,
        };
      return { ok: true, missing: [], message: '' };
    }
    if (hasAnyMainDay) {
      const missing = mainCats.filter(
        c => !combinedForDay.some(i => i.type === 'main' && i.category === c),
      );
      return {
        ok: missing.length === 0,
        missing,
        message: missing.length
          ? `Missing meal for: ${missing.join(', ')}`
          : '',
      };
    }
    return { ok: false, missing: [], message: '' };
  }, [hasAnyMainDay, addonCostDay, currentDay, mainCats, combinedForDay]);

  const handleAddNewTiffin = useCallback(() => {
    dispatch(addItems(selectedItemsToAddOnCart as any));
    setSelectedItemsToAddOnCart([]);
    openAllMain();
    // tiffinPlan auto-updates from cart via nextPlanForDay
  }, [dispatch, selectedItemsToAddOnCart, openAllMain]);

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

      // Disable flag
      const disableKey = `disable_${lowerDay}_menu`;
      if (structured[disableKey] === true) {
        setMenuDisabled(true);
        setCategories([]);
        setAddonCategories([]);
        setLoading(false);
        return;
      }

      // US Eastern "today only" cutoff
      const cutoffKey = `${lowerDay}_cut_off_time`;
      const cutoffVal = structured[cutoffKey]; // e.g. "6:00 AM"
      if (cutoffVal) {
        const deviceNow = new Date();
        const usNow = toUSEasternDate(deviceNow);
        const usDayIdx = usNow.getDay(); // 0..6
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

      // Fetch categories
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

  console.log({ lines, selectedItemsToAddOnCart, tiffinPlan, nextPlanForDay });

  useEffect(() => {
    if (isCartCleared || lines.length === 0) setSelectedItemsToAddOnCart([]);
    dispatch(cartFLag());
    if (currentDay !== 'Saturday' && currentDay !== 'Sunday') {
      fetchMetaAndData();
    } else {
      setCategories([]);
      setAddonCategories([]);
    }
  }, [isCartCleared, dispatch, fetchMetaAndData, lines, currentDay]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScrollView bounces={false}>
        <HeaderGreeting name="Sam" />
        <StatChips />

        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
            padding: 4,
          }}
        >
          <DayTabs
            days={FILTERED_DAYS as string[]}
            onChange={setFilteredIndex}
          />
          <OrderToggle index={tab} onChange={setTab} />
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
          <View style={{ backgroundColor: COLORS.white }}>
            {(currentDay === 'Saturday' || currentDay === 'Sunday') && (
              <EmptyState
                key={'addon-menu'}
                currentDay={currentDay}
                message="  Please check our weekday menu. Available Monday to Friday."
              />
            )}
            {updatedCategory.map(cat => {
              const sectionType =
                ((cat as any)._sectionType as 'main' | 'addon') ?? 'main';
              const key = `${sectionType}:${cat.key}`;
              return (
                <Section
                  key={key}
                  hero={require('../../assets/banners/chana.jpg')}
                  title={cat.key.toUpperCase()}
                  note={`Select from ${cat.value.length} options`}
                  open={isOpen(key)}
                  setOpen={(v: boolean) => setOpen(key, v)}
                >
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
                      selectedItemsToAddOnCart={selectedItemsToAddOnCart as any}
                      isLoading={isLoading}
                      onChange={picked => {
                        if (picked?.selected) setOpen(key, false);
                      }}
                    />
                  ))}
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
            {mergedCatalog.map((cat, i) => {
              const key = `addon:${cat.key}-${i}`;
              return (
                <Section
                  key={key}
                  hero={require('../../assets/banners/chana.jpg')}
                  title={cat.key.toUpperCase()}
                  note={`Select from ${cat.value.length} options`}
                  open={isOpen(key)}
                  setOpen={(v: boolean) => setOpen(key, v)}
                >
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
                      selectedItemsToAddOnCart={selectedItemsToAddOnCart as any}
                      isLoading={isLoading}
                      onChange={picked => {
                        if (picked?.selected) setOpen(key, false);
                      }}
                    />
                  ))}
                </Section>
              );
            })}
          </>
        )}

        {!menuDisabled && validation.ok && (
          <TouchableOpacity
            onPress={handleAddNewTiffin}
            style={styles.addNewTiffin}
          >
            <PlusIcon width={24} height={24} />
            <Text style={styles.newTiffinText}>Add new tiffin</Text>
          </TouchableOpacity>
        )}

        {!menuDisabled && (
          <View
            style={[styles.pad, { marginTop: 24, marginBottom: 32, gap: 16 }]}
          >
            <PriceSummary
              rows={[
                ['Meal cost', toMoney(mealCost)],
                ['Add on’s', toMoney(addonCost)],
                ['Total', toMoney(mealCost + addonCost)],
              ]}
            />
            <CTAButton
              label={validation}
              day={currentDay}
              isDisabled={!validation.ok}
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
        )}

        {!menuDisabled && blogs?.length > 0 && (
          <FitnessCarousel items={blogs} />
        )}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  pad: { paddingHorizontal: SPACING, marginTop: -34 },
  container: { padding: 10, marginLeft: 10, paddingTop: 15 },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  addNewTiffin: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderColor: 'green',
    borderWidth: 2,
    padding: 10,
    borderRadius: 40,
    backgroundColor: 'white',
    width: 350,
    margin: 'auto',
  },
  circleIcon: { fontSize: 20, color: 'green' },
  newTiffinText: {
    fontWeight: '700',
    letterSpacing: 0.5,
    fontSize: 16,
    color: 'green',
  },
});
