// app/navigation/MainTabs.tsx
import React, { useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomTabs from '../../components/BottomTabs';
import HomeScreen from '../Home/HomeScreen';
import ProgressScreen from '../menutabs/ProgressScreen';
import FavoritesScreen from '../favorites/FavoritesScreen';
import OrderScreen from '../order/OrderScreen';
import AccountScreen from '../account/AccountScreen';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, BackHandler } from 'react-native';

type TabKey = 'progress' | 'favorites' | 'Home' | 'Order' | 'account';
const Tab = createBottomTabNavigator();

export default function MainTabs() {
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'Exit App',
          'Do you want to close the app?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'OK', onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: true },
        );
        return true; // prevent default behavior
      };
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, []),
  );

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => (
        <BottomTabs
          active={state.routes[state.index].name as TabKey}
          onChange={k => navigation.navigate(k)}
        />
      )}
    >
      <Tab.Screen name="progress" component={ProgressScreen} />
      <Tab.Screen name="favorites" component={FavoritesScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Order" component={OrderScreen} />
      <Tab.Screen name="account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
