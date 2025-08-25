import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Root from './src/screens/navigation/Root';
import { StatusBar, useColorScheme, Platform } from 'react-native';

export default function App() {
  const isDarkMode = useColorScheme() === "dark";
  return (
    <NavigationContainer>
      <StatusBar barStyle={isDarkMode == true ? "light-content" : "dark-content"} backgroundColor={Platform.OS === 'android' ? 'transparent' : undefined}
      />
      <Root />
    </NavigationContainer>
  );
}
