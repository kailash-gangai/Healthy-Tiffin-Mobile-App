import React, { useState, useEffect, useRef } from "react";
import {
  StatusBar, Platform,
  StyleSheet,
  useColorScheme,
  Animated,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "./src/components/SplashScreen";
import AboutScreen from "./src/screens/AboutScreen";
import SignInScreen from "./src/screens/auth/SignInScreen";
import SignUpScreen from "./src/screens/auth/SignUpScreen";
import { RootStackParamList } from "./src/screens/navigation/types";
import ForgetPasswordScreen from "./src/screens/auth/ForgetPasswordScreen";
import ResetPasswordScreen from "./src/screens/auth/ResetPasswordScreen";
import CodeVerificationScreen from "./src/screens/auth/CodeVerificationScreen";
import MedicalPreferences from "./src/screens/preferences/MedicalPreferencesScreen";
import SelectPreferencesScreen from "./src/screens/preferences/SelectPreferencesScreen";
import DietaryPreferencesScreen from "./src/screens/preferences/DietaryPreferences";
import HomeScreen from "./src/screens/Home/HomeScreen";


const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const isDarkMode = useColorScheme() === "dark";
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      // Fade out splash
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => setLoading(false));
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim]);

  if (loading) {
    return <SplashScreen fadeAnim={fadeAnim} />;
  }

  return (
    console.log(isDarkMode),
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode == false ? "light-content" : "dark-content"} backgroundColor={Platform.OS === 'android' ? 'transparent' : undefined}
      />

      <NavigationContainer>
        <Stack.Navigator >
          <Stack.Group
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_bottom',
            }}
          >
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />

            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
            <Stack.Screen name="CodeVerification" component={CodeVerificationScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            {/* Add preference screens here */}
            <Stack.Screen name="MedicalPreferences" component={MedicalPreferences} />
            <Stack.Screen name="SelectPreferences" component={SelectPreferencesScreen} />
            <Stack.Screen name="DietaryPreferences" component={DietaryPreferencesScreen} />
          </Stack.Group>
          <Stack.Group>
            <Stack.Screen name="Home" component={HomeScreen} />
          </Stack.Group>
        </Stack.Navigator>

      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
