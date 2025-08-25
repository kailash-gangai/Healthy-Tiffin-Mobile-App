import React from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { COLORS, GAP, PADDING } from '../../ui/theme';
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

const DISHES = [
      { id: '1', title: 'Kalmi Kabab', image: require('../../assets/banners/chana.jpg'), selected: true },
      { id: '2', title: 'Fish Fry', image: require('../../assets/banners/chana.jpg') },
      { id: '3', title: 'Chicken Wings', image: require('../../assets/banners/chana.jpg') },
];

const HomeScreen: React.FC = () => {
      const [dayIndex, setDayIndex] = React.useState(0);

      return (
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
                  <ScrollView contentContainerStyle={{ padding: PADDING, gap: GAP }}>
                        <HeaderGreeting name="Sam" />
                        <StatChips
                              items={[
                                    { label: '70g', sub: 'Protein' },
                                    { label: '120g', sub: 'Carbs' },
                                    { label: '50g', sub: 'Fats' },
                                    { label: '850', sub: 'Calories' },
                              ]}
                        />

                        <OrderToggle />

                        <DayTabs
                              days={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
                              index={dayIndex}
                              onChange={setDayIndex}
                        />

                        <Section title="PROTEINS" note="Select from 4 options" collapsed={false}>
                              {DISHES.map(d => (
                                    <DishCard key={d.id} item={d} />
                              ))}
                        </Section>

                        <Section title="VEGGIES" note="Select 2 from 6 options" />
                        <Section title="SIDES" note="Select from 4 options" />
                        <Section title="PROBIOTIC" note="Select from 2 options" />

                        <Section title="Immunity Add on’s">
                              <AddonRow title="Gluten/sugar FREE Dessert" note="Select from 2 options" />
                              <AddonRow title="Health Boost Drink" note="Select from 3 options" />
                        </Section>

                        <PriceSummary rows={[['Meal cost', '$28'], ['Add on’s', '$5'], ['Total', '$33']]} />

                        <CTAButton label="Add to cart" icon="shopping-bag" onPress={() => { }} />

                        <FitnessCarousel
                              items={[
                                    { id: 'a', title: '5 healthy tips to lose fat fast and effectively', image: require('../../assets/banners/chana.jpg') },
                                    { id: 'b', title: 'What to do when you stop binge eating', image: require('../../assets/banners/chana.jpg') },
                              ]}
                        />
                  </ScrollView>
            </SafeAreaView>
      );
};

export default HomeScreen;
