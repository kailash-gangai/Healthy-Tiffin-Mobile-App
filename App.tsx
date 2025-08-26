import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Root from './src/screens/navigation/Root';
import { StatusBar, useColorScheme, Platform } from 'react-native';

export default function App() {
  const isDarkMode = useColorScheme() === "dark";
  console.log(isDarkMode);
  return (
    <NavigationContainer>
      <StatusBar barStyle={isDarkMode == false ? "dark-content" : "light-content"} backgroundColor={Platform.OS === 'android' ? 'transparent' : undefined}
      />
      <Root />
    </NavigationContainer>
  );
}
