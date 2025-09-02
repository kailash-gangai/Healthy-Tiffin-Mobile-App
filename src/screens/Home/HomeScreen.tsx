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
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addItem, decreaseItem, setQty, removeItem, selectSubtotal, selectLines } from "../../store/slice/cartSlice";
import { getAllMetaobjects, getMetaObjectByHandle } from '../../shopify/queries/getMetaObject';
import { getProductsByIds } from '../../shopify/queries/getProducts';

interface CategoriesProps{
      key:string,
      value:{
            id:string;
            title:string;
            description:string;
            tags:string[];
            image:string
      }[]
}
interface SingleMetaObjectProps{     
            key:string,
            value:string 
}
const DAYS=['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const HomeScreen: React.FC = () => {
     const  [dayIndex, setDayIndex] = React.useState(0),
       [tab, setTab] = useState<0 | 1>(0),
       dispatch = useAppDispatch(),
       [categories,setCategories]= useState<CategoriesProps[]>([]),
       [days,setDays]= useState<any[]>([]),
       [isLoading,setLoading]= useState(false),
       currentDay = DAYS[dayIndex],
       currentDayMetaObjectId = days.find(day=>day.handle.toLowerCase()===currentDay?.toLowerCase())?.id
      
      useEffect(() => {
            const fetchMetaObjects = async () => {
                  setLoading(true)
              try {
                const listOfMetaobjects = await getAllMetaobjects(); 
                  setDays(listOfMetaobjects && listOfMetaobjects)
                const singleMetaObject:SingleMetaObjectProps[] = await getMetaObjectByHandle(currentDayMetaObjectId); 
                const updatedMetaObjects:any = await Promise.all(
                  singleMetaObject
                    .filter((d) => d.value.startsWith("[") && d.value.endsWith("]"))
                    .map(async (d) => {
                
                      const products = await getProductsByIds(d.value);
                
                      d.value = products;
                
                      return d; 
                    })
                );

                console.log(updatedMetaObjects,"updated meta")
                setCategories(updatedMetaObjects);

              } catch (error) {
                  setLoading(false)
                console.error("Error fetching metaobjects:", error);
              }
              setLoading(false);
            };
        
            fetchMetaObjects(); 
          }, [currentDayMetaObjectId]);
 console.log(categories,"categoreis")
      return (
            <View style={{ flex: 1, backgroundColor: COLORS.white }}>
                  <ScrollView bounces={false}>
                        <HeaderGreeting name="Sam" />
                        <StatChips />

                        <OrderToggle index={tab} onChange={setTab} />
                        {tab === 0 && (
                              <View style={{ marginTop: 20, backgroundColor: COLORS.white }}>
                                    <DayTabs
                                          days={DAYS} 
                                          onChange={setDayIndex}
                                    />

                                    {categories?.map(cat=>(
                                       <Section key={cat.key} hero={require('../../assets/banners/chana.jpg')} title={cat.key.toUpperCase()} note={`Select from ${cat.value.length} options`} collapsed={false}>
                                         
                                       {cat.value.map(d => (
                                             <DishCard isLoading={isLoading} key={d.id} item={d} />
                                       ))}
                                 </Section>   
                                    ))}
                                  

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
                              <CTAButton label="Add to cart" iconName="shopping-bag"
                                    onPress={() => dispatch(addItem({ id: '1', name: 'Kalmi Kabab', price: 28, variant: 'Kalmi Kabab' }))}

                              />
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
