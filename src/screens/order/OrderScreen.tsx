import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Text, FlatList } from 'react-native';
import { CARTWRAP, COLORS, SPACING } from '../../ui/theme';
import HeaderGreeting from '../../components/HeaderGreeting';
import OrderCard from '../../components/OrderCard';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
const DATA = [
      {
            thumbnail: require('../../assets/banners/chana.jpg'),
            title: 'Berry Bliss Salad and 2 more',
            total: '$64',
            plan: 'One Day',
            orderedAt: '10 Dec 2023 | 9:36 PM',
            deliveredAt: '10 Dec 2023 | 10:12 PM',
      },
      {
            thumbnail: require('../../assets/banners/chana.jpg'),
            title: 'Tangy Caesar Salad',
            total: '$64',
            plan: 'Weekly',
            orderedAt: '10 Dec 2023 | 9:36 PM',
            deliveredAt: '10 Dec 2023 | 10:12 PM',
      },
      {
            thumbnail: require('../../assets/banners/chana.jpg'),
            title: 'Berry Bliss Salad',
            total: '$64',
            plan: 'Weekly',
            orderedAt: '10 Dec 2023 | 9:36 PM',
            deliveredAt: '10 Dec 2023 | 10:12 PM',
      },
      {
            thumbnail: require('../../assets/banners/chana.jpg'),
            title: 'Tangy Caesar Salad',
            total: '$64',
            plan: 'One Day',
            orderedAt: '10 Dec 2023 | 9:36 PM',
            deliveredAt: '10 Dec 2023 | 10:12 PM',
      },
];
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type Props = {
      navigation: NavigationProp;
};
const OrderScreen: React.FC<Props> = ({ navigation }) => {
      return (
            <View style={{ flex: 1, backgroundColor: COLORS.white }}>
                  <ScrollView bounces={false}>
                        <HeaderGreeting name="Sam" />
                        <View style={[CARTWRAP]} >
                              <FlatList
                                    data={DATA}
                                    contentContainerStyle={s.list}
                                    keyExtractor={(_, i) => String(i)}
                                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                                    renderItem={({ item }) => (
                                          <OrderCard
                                                {...item}
                                                onPress={() => {
                                                      navigation.navigate('OrderDetail', { orderId: '123' });
                                                }}
                                          />
                                    )}
                              />
                        </View>
                  </ScrollView>
            </View>
      );
};

export default OrderScreen;
const s = StyleSheet.create({
      safe: { flex: 1, backgroundColor: '#FAFAFA' },
      list: { padding: 14 },
});
