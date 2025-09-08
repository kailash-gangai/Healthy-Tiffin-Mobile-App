import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Root from './src/screens/navigation/Root';
import { StatusBar, useColorScheme, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { persistor, store } from './src/store';
import { ShopifyCheckoutSheetProvider } from '@shopify/checkout-sheet-kit';
import Toast from 'react-native-toast-message';
import { PersistGate } from 'redux-persist/integration/react';
import SkeletonLoading from './src/components/SkeletonLoading';
import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
} from 'react-native-health';
import { initHealth } from './src/health/healthkit';
export default function App() {
  const isDarkMode = useColorScheme() === 'dark';
  console.log(isDarkMode);

  /* Permission options */

  useEffect(() => {
    const i = initHealth();
    console.log(i, 'init');
  }, []);

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={<SkeletonLoading />}>
        <ShopifyCheckoutSheetProvider>
          <NavigationContainer>
            <StatusBar
              barStyle={isDarkMode == false ? 'dark-content' : 'light-content'}
              backgroundColor={
                Platform.OS === 'android' ? 'transparent' : undefined
              }
            />
            <Root />
          </NavigationContainer>
          <Toast />
        </ShopifyCheckoutSheetProvider>
      </PersistGate>
    </Provider>
  );
}
