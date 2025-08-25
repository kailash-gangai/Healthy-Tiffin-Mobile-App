// app/navigation/MainTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomTabs from '../../components/BottomTabs';
import HomeScreen from '../home/HomeScreen';
import ProgressScreen from '../menutabs/ProgressScreen';
import FavoritesScreen from '../menutabs/FavoritesScreen;';
import OrderScreen from '../order/OrderScreen';
import AccountScreen from '../menutabs/AccountScreen';

// import Progress from '../screens/Progress';
// import Favorites from '../screens/Favorites';
// import Home from '../screens/Home';
// import Orders from '../screens/Orders';
// import Account from '../screens/Account';

type TabKey = 'progress' | 'favorites' | 'home' | 'orders' | 'account';
const Tab = createBottomTabNavigator();

export default function MainTabs() {
      return (
            <Tab.Navigator
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
                  <Tab.Screen name="orders" component={OrderScreen} />
                  <Tab.Screen name="account" component={AccountScreen} />
            </Tab.Navigator>
      );
}
