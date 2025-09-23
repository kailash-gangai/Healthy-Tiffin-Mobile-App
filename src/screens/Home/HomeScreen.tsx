import React, { useEffect, useState, useMemo } from 'react';
import { ScrollView, View, StyleSheet, Text } from 'react-native';
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
  getAllMetaobjects,
  getMetaObjectByHandle,
} from '../../shopify/queries/getMetaObject';
import { getProductsByIds } from '../../shopify/queries/getProducts';
import { addItems, cartFLag } from '../../store/slice/cartSlice';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import { getAllArticles } from '../../shopify/queries/blogs';
import HeartIcon from '../../assets/htf-icon/icon-heart.svg';
import EyeShow from '../../assets/htf-icon/icon-eye-show.svg';

interface CategoriesProps {
  key: string;
  value: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    image: string;
  }[];
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
};

const ALL_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

interface BlogProp {
  id: string;
  title: string;
  image?: {
    url: string | null;
  };
  date: string;
  video?: string | null;
  author?: string;
  content?: string | null;
  excerpt?: string;
}
const HomeScreen: React.FC = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { isCartCleared } = useAppSelector(state => state.cart);

  // state
  const [tab, setTab] = useState<0 | 1>(0);
  const [categories, setCategories] = useState<CategoriesProps[]>([]);
  const [addonCategories, setAddonCategories] = useState<CategoriesProps[]>([]);
  const [daysMeta, setDaysMeta] = useState<any[]>([]);
  const [addonsMeta, setAddonsMeta] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState<BlogProp[]>([]);
  const [selectedItemsToAddOnCart, setSelectedItemsToAddOnCart] = useState<
    Item[]
  >([]);
  const [priceThreshold, setPriceThreshold] = useState<any[]>([]);
  const [filteredIndex, setFilteredIndex] = useState(0); // index within filtered list
  const [openByKey, setOpenByKey] = React.useState<Record<string, boolean>>({});

  // ui helpers
  const isOpen = (k: string) => openByKey[k] ?? true;
  const setOpen = (k: string, v: boolean) =>
    setOpenByKey(s => ({ ...s, [k]: v }));

  // day indexes
  const absoluteTodayIndex = useMemo(() => {
    const js = new Date().getDay(); // 0=Sun..6=Sat
    const week = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return ALL_DAYS.indexOf(week[js]); // 0..6
  }, []);

  const FILTERED_DAYS = useMemo(() => {
    if (absoluteTodayIndex < 0) return ALL_DAYS;
    return ALL_DAYS.slice(absoluteTodayIndex); // e.g. ['Thursday','Friday','Saturday','Sunday']
  }, [absoluteTodayIndex]);

  const absoluteDayIndex = useMemo(
    () => Math.min(ALL_DAYS.length - 1, absoluteTodayIndex + filteredIndex),
    [absoluteTodayIndex, filteredIndex],
  );

  const currentDay = ALL_DAYS[absoluteDayIndex];
  const order = ['protein', 'veggies', 'sides', 'probiotics'];

  // metaobject ids
  const currentDayMetaObjectId = daysMeta.find(
    d => d.handle.toLowerCase() === currentDay.toLowerCase(),
  )?.id;

  const addonsMetaObjectId = addonsMeta.find(
    (d: any) => d.handle.toLowerCase() === currentDay.toLowerCase(),
  )?.id;

  // costs
  const mealCost = selectedItemsToAddOnCart
    .filter(item => item.type === 'main')
    .reduce((total, item) => total + parseFloat(String(item.price)), 0);

  const addonCost = selectedItemsToAddOnCart
    .filter(item => item.type === 'addon')
    .reduce((total, item) => total + parseFloat(String(item.price)), 0);

  // pricing helper
  function applyPriceThresholds(categories: any[], thresholds: any[]): any[] {
    const map: Record<string, number> = {};

    for (const t of thresholds) {
      const prefix = t.key.split('_')[0]?.trim();
      if (!prefix) continue;
      const v = parseFloat(t.value);
      if (Number.isFinite(v)) map[prefix] = v;
    }

    const keepDecimals = (orig: string, num: number) => {
      const decs = (orig.split('.')[1] ?? '').length;
      return decs > 0 ? num.toFixed(decs) : String(Math.trunc(num));
    };

    return categories.map(cat => {
      const thr = map[cat.key];
      if (!Number.isFinite(thr)) return cat;

      const nextItems = cat.value.map((it: any) => {
        const priceNum = parseFloat(it.price);
        if (!Number.isFinite(priceNum)) return it;
        const newNum = Math.max(priceNum - thr, 0);
        return { ...it, price: keepDecimals(it.price, newNum) };
      });

      return { ...cat, value: nextItems };
    });
  }

  // fetchers
  const fetchMetaObjects = async () => {
    setLoading(true);
    try {
      const listOfMetaobjects = await getAllMetaobjects('main_menus');
      const priceThreshold = await getAllMetaobjects('price_threshold');
      const priceMetaobject: any = await getMetaObjectByHandle(
        priceThreshold?.[0]?.id,
      );
      setPriceThreshold(priceMetaobject);

      const resultBlogs = await getAllArticles();
      const articles: any = resultBlogs?.articles;
      const blog: any = articles?.map((blog: any) => ({
        id: blog?.id,
        title: blog?.title,
        image: blog?.image?.url,
        content: blog?.content,
        video: blog?.video || null,
        author: blog.authorV2?.name,
        date: blog?.publishedAt,
        excerpt: blog?.excerpt,
      }));
      setBlogs(blog);

      const listOfAddons = await getAllMetaobjects('addon_menu');
      if (!listOfMetaobjects || !listOfAddons)
        throw new Error('Failed to fetch metaobjects.');

      setDaysMeta(listOfMetaobjects);
      setAddonsMeta(listOfAddons);

      const fetchCategoryData = async (metaObjectId: string) => {
        const singleMetaObject: any = await getMetaObjectByHandle(metaObjectId);
        const expanded: any = await Promise.all(
          singleMetaObject
            .filter(
              (d: any) => d.value?.startsWith('[') && d.value?.endsWith(']'),
            )
            .map(async (d: any) => {
              if (d?.value) {
                const products = await getProductsByIds(d.value);
                d.value = products ?? [];
              }
              return d;
            }),
        );
        return expanded.filter((x: any) => x);
      };

      if (currentDayMetaObjectId) {
        const mainCategoryData = await fetchCategoryData(
          currentDayMetaObjectId,
        );
        setCategories(mainCategoryData);
      } else {
        setCategories([]);
      }

      if (addonsMetaObjectId) {
        const addonCategoryData = await fetchCategoryData(addonsMetaObjectId);
        setAddonCategories(addonCategoryData);
      } else {
        setAddonCategories([]);
      }
    } catch (e) {
      console.error('Error fetching metaobjects:', e);
    } finally {
      setLoading(false);
    }
  };

  // derived ordering and maps
  const rank = (k: string) => {
    const i = order.indexOf(k.toLowerCase());
    return i === -1 ? 1e9 : i; // unknowns go last
  };

  const sortedCategories = categories
    .slice()
    .sort((a, b) => rank(a.key) - rank(b.key));

  const idToCat = categories.reduce(
    (m, s) => (s.value.forEach(v => m.set(v.id, s.key.toLowerCase())), m),
    new Map<string, string>(),
  );

  const mainCats = categories.map(s => s.key.toLowerCase());
  const hasAnyMain = selectedItemsToAddOnCart.some(i => i.type === 'main');
  const hasAnyAddon = selectedItemsToAddOnCart.some(i => i.type === 'addon');

  // apply thresholds
  const updatedCategory = applyPriceThresholds(
    sortedCategories,
    priceThreshold,
  );
  // selection validation
  let result: { ok: boolean; missing: string[]; message: string };
  if (!hasAnyMain && hasAnyAddon) {
    if (addonCost < 29) {
      result = {
        ok: false,
        missing: [],
        message: 'A La Carte Minimum $29 for ' + currentDay,
      };
    } else {
      result = { ok: true, missing: [], message: '' };
    }
  } else if (hasAnyMain) {
    const missing = mainCats.filter(
      c =>
        !selectedItemsToAddOnCart.some(
          i => (i.category || idToCat.get(i.id) || '').toLowerCase() === c,
        ),
    );
    result = {
      ok: missing.length === 0,
      missing,
      message: missing.length ? `Missing meal for: ${missing.join(', ')}` : '',
    };
  } else {
    // nothing selected
    result = { ok: false, missing: [], message: '' };
  }

  // effects
  useEffect(() => {
    if (isCartCleared) {
      setSelectedItemsToAddOnCart([]);
    }
    dispatch(cartFLag());
    fetchMetaObjects();
  }, [currentDayMetaObjectId, addonsMetaObjectId, isCartCleared]);

  // usage and logs
  // console.log(isCartCleared, 'is cart cleared');
  // console.log(selectedItemsToAddOnCart, 'sel');
  // console.log(categories, 'all categories');
  // console.log(addonCategories, 'all caddon categories');
  // console.log(priceThreshold, 'state');
  // console.log(updatedCategory, 'updago');

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
          <DayTabs days={FILTERED_DAYS} onChange={setFilteredIndex} />
          <OrderToggle index={tab} onChange={setTab} />
        </View>

        {/* Tab 0: Daily order */}
        {tab === 0 && ( 
          <View style={{ backgroundColor: COLORS.white }}>
            <View style={styles.container}>
              <Text style={styles.heading}>Main</Text>
            </View>
            {!updatedCategory.length && (
              <View
                style={{
                  marginHorizontal: 16,
                  marginTop: 12,
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: '#F4FBF6',
                  borderWidth: 1,
                  borderColor: '#D8F0DF',
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowOffset: { width: 0, height: 4 },
                  shadowRadius: 12,
                  elevation: 3,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <FontAwesome5
                    name="calendar-times"
                    size={20}
                    color="#2E7D32"
                  />
                  <Text
                    style={{
                      marginLeft: 8,
                      fontSize: 16,
                      fontWeight: '700',
                      color: '#1B5E20',
                    }}
                  >
                    No menu for {currentDay}
                  </Text>
                </View>

                <Text
                  style={{ fontSize: 13, color: '#2E7D32', lineHeight: 18 }}
                >
                  Please check our weekday menu. Available Monday to Friday.
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    marginTop: 10,
                  }}
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(
                    d => (
                      <View
                        key={d}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: '#B7E1C0',
                          backgroundColor: '#FFFFFF',
                          marginRight: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: '700',
                            color: '#2E7D32',
                          }}
                        >
                          {d}
                        </Text>
                      </View>
                    ),
                  )}
                </View>
              </View>
            )}

            {updatedCategory.map(cat => {
              const key = `main:${cat.key}`;
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
                    <DishCard
                      key={d.id}
                      category={cat.key.toUpperCase()}
                      day={currentDay}
                      type="main"
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
            {/* Move OrderToggle directly below categories.map */}
          </View>
        )}

        {/* Addons are shown regardless of tab selection per original layout */}
        {tab === 1 && (
          <>
            <View style={styles.container}>
              <Text style={styles.heading}>Addons</Text>
            </View>

            {addonCategories.map(cat => {
              const key = `addon:${cat.key}`;
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
                    <DishCard
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

        <View
          style={[styles.pad, { marginTop: 24, marginBottom: 32, gap: 16 }]}
        >
          <PriceSummary
            rows={[
              ['Meal cost', `$${mealCost}`],
              ['Add on’s', `$${addonCost}`],
              ['Total', `$${mealCost + addonCost}`],
            ]}
          />
          <CTAButton
            label={result}
            day={currentDay}
            isDisabled={!result?.ok}
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

        {blogs && <FitnessCarousel items={blogs} />}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  pad: { paddingHorizontal: SPACING, marginTop: -34 },
  container: { padding: 10, marginLeft: 10, paddingTop: 15 },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});
