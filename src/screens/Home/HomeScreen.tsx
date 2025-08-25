import React, { useState } from 'react';
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

const DISHES = [
      { id: '1', title: 'Kalmi Kabab', image: require('../../assets/banners/chana.jpg'), selected: true },
      { id: '2', title: 'Fish Fry', image: require('../../assets/banners/chana.jpg') },
      { id: '3', title: 'Chicken Wings', image: require('../../assets/banners/chana.jpg') },
];

const HomeScreen: React.FC = () => {
      const [dayIndex, setDayIndex] = React.useState(0);
      const [tab, setTab] = useState<0 | 1>(0);

      return (
            <View style={{ flex: 1, backgroundColor: COLORS.white }}>
                  <ScrollView bounces={false}>
                        <HeaderGreeting name="Sam" />
                        <StatChips
                              items={[
                                    { value: '70', unit: 'kg', type: 'Weight', bgColor: '#DDE3F6', color: '#3B49DF' },
                                    { value: '120', unit: '', type: 'Steps', bgColor: '#DDEEE2', color: '#0B5733' },
                                    { value: '10', unit: 'hrs', type: 'Sleep', bgColor: '#EDE7FB', color: '#6A4CDB' },
                                    { value: '8', unit: 'Glasses', type: 'Water', bgColor: '#EAF3FB', color: '#0B73B3' },
                                    { value: '60', unit: 'Cal', type: 'Calories', bgColor: '#FDF1D9', color: '#D27C00' },
                              ]}
                        />

                        <OrderToggle index={tab} onChange={setTab} />
                        {tab === 0 && (
                              <View style={{ marginTop: 20, backgroundColor: COLORS.white }}>
                                    <DayTabs
                                          days={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']} onChange={setDayIndex}
                                    />
                                    <Section hero={require('../../assets/banners/chana.jpg')} title="PROTEINS" note="Select from 4 options" collapsed={false}>
                                          {DISHES.map(d => (
                                                <DishCard key={d.id} item={d} />
                                          ))}
                                    </Section>

                                    <Section hero={require('../../assets/banners/chana.jpg')} title="VEGGIES" note="Select 2 from 6 options"
                                          collapsed={false}>
                                          {DISHES.map(d => (
                                                <DishCard key={d.id} item={d} />
                                          ))}
                                    </Section>
                                    <Section hero={require('../../assets/banners/chana.jpg')} title="SIDES" note="Select from 4 options" />
                                    <Section hero={require('../../assets/banners/chana.jpg')} title="PROBIOTIC" note="Select from 2 options" />


                              </View>

                        )}

                        {/* One Week Order */}
                        {tab === 1 && (
                              <View style={{ marginTop: 20 }}>
                                    <Text style={{ fontSize: 18, fontWeight: "700" }}>One Week Order Section</Text>
                                    {/* put your components here */}
                              </View>
                        )}
                        <View style={[styles.pad, { marginTop: 24, marginBottom: 32, gap: 16 }]}>
                              <PriceSummary rows={[['Meal cost', '$28'], ['Add on’s', '$5'], ['Total', '$33']]} />
                              <CTAButton label="Add to cart" iconName="shopping-bag" onPress={() => { }} />
                        </View>

                        <FitnessCarousel
                              items={[
                                    { id: 'a', title: '5 healthy tips to lose fat fast and effectively', image: require('../../assets/banners/chana.jpg') },
                                    { id: 'b', title: 'What to do when you stop binge eating', image: require('../../assets/banners/chana.jpg') },
                              ]}
                        />
                  </ScrollView>
            </View>
      );
};

export default HomeScreen;
const styles = StyleSheet.create({
      pad: { paddingHorizontal: SPACING, marginTop: -34 },

});
