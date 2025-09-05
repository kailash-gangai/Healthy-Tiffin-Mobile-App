import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
} from 'react-native';
import FavoriteCard from '../../components/FavoriteCard';
import HeaderGreeting from '../../components/HeaderGreeting';
import { CARTWRAP, COLORS } from '../../ui/theme';
import { useAppSelector } from '../../store/hooks';
const DATA = new Array(15).fill(0).map((_, i) => ({
  id: String(i),
  thumb: require('../../assets/banners/chana.jpg'),
  title: 'Berry Bliss Salad',
  price: '$64',
  tag: i % 2 ? 'SIDES' : 'PROTEIN',
  calories: 400,
  description:
    'Savor the burst of summer flavors with each bite. This dish is perfect for picnics,barbecues,  or as a light and satisfying lunch.A perfect balance of sweet, savory, and zesty goodness.Savor the burst of summer flavors with each bite. This dish is perfect for picnics,barbecues, or as a light and satisfying lunch.A perfect balance of sweet, savory, and zesty goodness.',
}));

export default function FavoritesScreen() {
  const { items } = useAppSelector(s => s.favorite);

  console.log(items, 'fav');
  //   if (!items.length) {
  //     return <Text>No items</Text>;
  //   }
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScrollView>
        <HeaderGreeting name="Sam" />
        <View style={[CARTWRAP]}>
          <View style={s.list}>
            {items.map(it => (
              <View key={it.id} style={{ marginBottom: 12 }}>
                <FavoriteCard key={it.id} item={it} />
              </View>
            ))}
            <View style={{ height: 16 }} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  list: { padding: 14 },
});
