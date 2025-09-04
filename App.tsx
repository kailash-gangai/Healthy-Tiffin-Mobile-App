import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Root from './src/screens/navigation/Root';
import { StatusBar, useColorScheme, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { ShopifyCheckoutSheetProvider } from '@shopify/checkout-sheet-kit';
import Toast from 'react-native-toast-message';

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';
  console.log(isDarkMode);
  return (
    <Provider store={store}>
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
    </Provider>
  );
}
