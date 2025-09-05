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
import { addItems } from '../../store/slice/cartSlice';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import Toast from 'react-native-toast-message';

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

const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isCartCleared } = useAppSelector(state => state.cart);

  const [tab, setTab] = useState<0 | 1>(0);
  const [categories, setCategories] = useState<CategoriesProps[]>([]);
  const [addonCategories, setAddonCategories] = useState<CategoriesProps[]>([]);
  const [daysMeta, setDaysMeta] = useState<any[]>([]);
  const [addonsMeta, setAddonsMeta] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [selectedItemsToAddOnCart, setSelectedItemsToAddOnCart] = useState<
    Item[]
  >([]);
  const [filteredIndex, setFilteredIndex] = useState(0); // index within filtered list

  // map JS day to ALL_DAYS index (Mon..Sun)
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

  // Only show today and future days
  const FILTERED_DAYS = useMemo(() => {
    if (absoluteTodayIndex < 0) return ALL_DAYS;
    return ALL_DAYS.slice(absoluteTodayIndex); // e.g. ['Thursday','Friday','Saturday','Sunday']
  }, [absoluteTodayIndex]);

  // Convert filtered index -> absolute index in ALL_DAYS
  const absoluteDayIndex = useMemo(
    () => Math.min(ALL_DAYS.length - 1, absoluteTodayIndex + filteredIndex),
    [absoluteTodayIndex, filteredIndex],
  );

  const currentDay = ALL_DAYS[absoluteDayIndex];

  const currentDayMetaObjectId = daysMeta.find(
    d => d.handle.toLowerCase() === currentDay.toLowerCase(),
  )?.id;

  const addonsMetaObjectId = addonsMeta.find(
    (d: any) => d.handle.toLowerCase() === currentDay.toLowerCase(),
  )?.id;
  const mealCost = selectedItemsToAddOnCart
    .filter(item => item.type === 'main')
    .reduce((total, item) => total + parseFloat(String(item.price)), 0);

  const addonCost = selectedItemsToAddOnCart
    .filter(item => item.type === 'addon')
    .reduce((total, item) => total + parseFloat(String(item.price)), 0);

  const fetchMetaObjects = async () => {
    setLoading(true);
    try {
      const listOfMetaobjects = await getAllMetaobjects('main_menus');
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

  useEffect(() => {
    if (isCartCleared) {
      setSelectedItemsToAddOnCart([]);
    }
    fetchMetaObjects();
  }, [currentDayMetaObjectId, addonsMetaObjectId, isCartCleared]);

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
            {!categories.length && (
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

            {categories?.map(cat => (
              <Section
                key={cat.key}
                hero={require('../../assets/banners/chana.jpg')}
                title={cat.key.toUpperCase()}
                note={`Select from ${cat.value.length} options`}
                collapsed={false}
              >
                {cat.value.map(d => (
                  <DishCard
                    category={cat.key.toUpperCase()}
                    day={currentDay}
                    type="main"
                    setSelectedItemsToAddOnCart={setSelectedItemsToAddOnCart}
                    selectedItemsToAddOnCart={selectedItemsToAddOnCart}
                    isLoading={isLoading}
                    key={d.id}
                    item={d}
                  />
                ))}
              </Section>
            ))}

            {/* Move OrderToggle directly below categories.map */}
          </View>
        )}

        {/* Addons are shown regardless of tab selection per original layout */}
        {tab === 1 && (
          <>
            <View style={styles.container}>
              <Text style={styles.heading}>Addons</Text>
            </View>

            {addonCategories?.map(cat => (
              <Section
                key={cat.key}
                hero={require('../../assets/banners/chana.jpg')}
                title={cat.key.toUpperCase()}
                note={`Select from ${cat.value.length} options`}
                collapsed={false}
              >
                {cat.value.map(d => (
                  <DishCard
                    category={cat.key.toUpperCase()}
                    day={currentDay}
                    type="addon"
                    setSelectedItemsToAddOnCart={setSelectedItemsToAddOnCart}
                    selectedItemsToAddOnCart={selectedItemsToAddOnCart}
                    isLoading={isLoading}
                    key={d.id}
                    item={d}
                  />
                ))}
              </Section>
            ))}
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
            label="Add to cart"
            isDisabled={!selectedItemsToAddOnCart?.length}
            iconName="shopping-bag"
            onPress={() => dispatch(addItems(selectedItemsToAddOnCart))}
            toast={{
              type: 'success',
              title: 'Added',
              message: 'Items added to cart',
              position: 'bottom',
            }}
          />
        </View>

        <FitnessCarousel
          items={[
            {
              id: 'a',
              title: '5 healthy tips to lose fat fast and effectively',
              image: require('../../assets/banners/chana.jpg'),
            },
            {
              id: 'b',
              title: 'What to do when you stop binge eating',
              image: require('../../assets/banners/chana.jpg'),
            },
          ]}
        />
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
