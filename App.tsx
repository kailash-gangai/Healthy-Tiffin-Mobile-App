import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Root from './src/screens/navigation/Root';
import { StatusBar, useColorScheme, Platform } from 'react-native';
import { Provider } from "react-redux";
import { store } from "./src/store";

export default function App() {
  const isDarkMode = useColorScheme() === "dark";
  console.log(isDarkMode);
  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar barStyle={isDarkMode == false ? "dark-content" : "light-content"} backgroundColor={Platform.OS === 'android' ? 'transparent' : undefined}
        />
        <Root />
      </NavigationContainer>
    </Provider>
  );
}
