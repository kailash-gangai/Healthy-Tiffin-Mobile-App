import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, Text } from 'react-native';
import { COLORS, SPACING } from '../../ui/theme';
import HeaderGreeting from '../../components/HeaderGreeting';
import StatChips from '../../components/StatChips';
import OrderToggle from '../../components/OrderToggle';
import DayTabs from '../../components/DayTabs';
import Section from '../../components/Section';
import DishCard from '../../components/DishCard';
import AddonRow from '../../components/AddonRow';
import PriceSummary from '../../components/PriceSummary';
import CTAButton from '../../components/CTAButton';
import FitnessCarousel from '../../components/FitnessCarousel';
import { useAppDispatch } from '../../store/hooks';

import {
  getAllMetaobjects,
  getMetaObjectByHandle,
} from '../../shopify/queries/getMetaObject';
import { getProductsByIds } from '../../shopify/queries/getProducts';
import { addItems } from '../../store/slice/cartSlice';

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
interface SingleMetaObjectProps {
  key: string;
  value: string;
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
const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
const HomeScreen: React.FC = () => {
  const [dayIndex, setDayIndex] = React.useState(0),
    [tab, setTab] = useState<0 | 1>(0),
    dispatch = useAppDispatch(),
    [categories, setCategories] = useState<CategoriesProps[]>([]),
    [addonCategories, setAddonCategories] = useState<CategoriesProps[]>([]),
    [days, setDays] = useState<any[]>([]),
    [isLoading, setLoading] = useState(false),
    [selectedItemsToAddOnCart, setSelectedItemsToAddOnCart] = useState<Item[]>(
      [],
    ),
    [addons, setAddons] = useState<any>([]),
    currentDay = DAYS[dayIndex],
    currentDayMetaObjectId = days.find(
      day => day.handle.toLowerCase() === currentDay?.toLowerCase(),
    )?.id,
    addonsMetaObjectId = addons.find(
      (day: any) => day.handle.toLowerCase() === currentDay?.toLowerCase(),
    )?.id;

  const fetchMetaObjects = async () => {
    setLoading(true);
    try {
      // Fetch main menus and addon menus
      const listOfMetaobjects = await getAllMetaobjects('main_menus');
      const listOfAddons = await getAllMetaobjects('addon_menu');

      if (!listOfMetaobjects || !listOfAddons) {
        throw new Error('Failed to fetch metaobjects.');
      }

      setDays(listOfMetaobjects);
      setAddons(listOfAddons);

      // Fetch data for both main menus and addons
      const fetchCategoryData = async (metaObjectId: string, type: string) => {
        const singleMetaObject: any = await getMetaObjectByHandle(metaObjectId);

        if (!singleMetaObject) {
          throw new Error(`Meta object for ${type} not found.`);
        }

        const updatedMetaObjects: any = await Promise.all(
          singleMetaObject?.fields
            .filter(d => d.value.startsWith('[') && d.value.endsWith(']')) // Check if it's a valid array
            .map(async d => {
              if (d?.value) {
                const products = await getProductsByIds(d.value);
                if (!products) {
                  console.error('No products found for:', d.value);
                  // return null; // Avoid adding invalid entries
                }
                d.value = products;
              }
              return d;
            }),
        );
        return updatedMetaObjects.filter((item: any) => item !== null);
      };

      // Only fetch products for valid meta object ids
      if (currentDayMetaObjectId && addonsMetaObjectId) {
        const mainCategoryData = await fetchCategoryData(
          currentDayMetaObjectId,
          'main',
        );
        setCategories(mainCategoryData);

        const addonCategoryData = await fetchCategoryData(
          addonsMetaObjectId,
          'addon',
        );
        setAddonCategories(addonCategoryData);
      }
    } catch (error) {
      console.error('Error fetching metaobjects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedItemsToAddOnCart([]);

    fetchMetaObjects();
  }, [currentDayMetaObjectId]);
  //   console.log(categories, 'categoreis');
  //   console.log(selectedItemsToAddOnCart, 'selectedItemsToAddOnCart');
  const mealCost = selectedItemsToAddOnCart
    .filter(item => item.type === 'main')
    .reduce((total, item) => total + parseFloat(item.price), 0);

  const addonCost = selectedItemsToAddOnCart
    .filter(item => item.type === 'addon')
    .reduce((total, item) => total + parseFloat(item.price), 0);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScrollView bounces={false}>
        <HeaderGreeting name="Sam" />
        <StatChips />

        <OrderToggle index={tab} onChange={setTab} />
        {tab === 0 && (
          <View style={{ marginTop: 20, backgroundColor: COLORS.white }}>
            <DayTabs days={DAYS} onChange={setDayIndex} />

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
          </View>
        )}
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
        {/* One Week Order */}
        {tab === 1 && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '700' }}>
              One Week Order Section
            </Text>
            {/* put your components here */}
          </View>
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
            iconName="shopping-bag"
            onPress={() => dispatch(addItems(selectedItemsToAddOnCart))}
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
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
});
