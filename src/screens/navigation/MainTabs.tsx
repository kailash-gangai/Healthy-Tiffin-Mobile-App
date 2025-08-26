// app/navigation/MainTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomTabs from '../../components/BottomTabs';
import HomeScreen from '../home/HomeScreen';
import ProgressScreen from '../menutabs/ProgressScreen';
import FavoritesScreen from '../favorites/FavoritesScreen';
import OrderScreen from '../order/OrderScreen';
import AccountScreen from '../account/AccountScreen';

type TabKey = 'progress' | 'favorites' | 'home' | 'Order' | 'account';
const Tab = createBottomTabNavigator();

export default function MainTabs() {
      return (
            <Tab.Navigator
                  initialRouteName="home"
                  screenOptions={{ headerShown: false }}
                  tabBar={({ state, navigation }) => (
                        <BottomTabs
                              active={state.routes[state.index].name as TabKey}
                              onChange={(k) => navigation.navigate(k)}
                        />
                  )}
            >
                  <Tab.Screen name="progress" component={ProgressScreen} />
                  <Tab.Screen name="favorites" component={FavoritesScreen} />
                  <Tab.Screen name="home" component={HomeScreen} />
                  <Tab.Screen name="Order" component={OrderScreen} />
                  <Tab.Screen name="account" component={AccountScreen} />
            </Tab.Navigator>
      );
}
