// app/navigation/Root.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
      StatusBar, Platform,
      StyleSheet,
      useColorScheme,
      Animated,
} from "react-native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';

import SplashScreen from '../../components/SplashScreen';
import ResetPasswordScreen from '../auth/ResetPasswordScreen';
import AboutScreen from "../../screens/AboutScreen";
import SignUpScreen from '../auth/SignUpScreen';
import SignInScreen from '../auth/SignInScreen';
import ForgetPasswordScreen from '../auth/ForgetPasswordScreen';
import CodeVerificationScreen from '../auth/CodeVerificationScreen';
import MedicalPreferencesScreen from '../preferences/MedicalPreferencesScreen';
import SelectPreferencesScreen from '../preferences/SelectPreferencesScreen';
import DietaryPreferencesScreen from '../preferences/DietaryPreferences';
import OrderDetailScreen from '../order/OrderDetailScreen';
import SubscriptionScreen from '../account/SubscriptionScreen';
import NotificationSettings from '../account/NotificationSettingScreen';
import AboutProfile from '../account/AboutProfileScreen';
import PrivacyPolicyScreen from '../account/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../account/TermsOfServiceScreen';
import ChangePassword from '../account/ChangePasswordScreen';
import EditProfile from '../account/EditProfileScreen';
import CartScreen from '../cart/CartScreen';
import TrackOrderScreen from '../cart/TrackOrderScreen';
import NotificationsScreen from '../cart/NotificationsScreen';
const Stack = createNativeStackNavigator();

export default function Root() {
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
            <Stack.Navigator screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_bottom',
            }}>
                  <Stack.Screen name="About" component={AboutScreen} />
                  <Stack.Screen name="SignUp" component={SignUpScreen} />
                  <Stack.Screen name="SignIn" component={SignInScreen} />
                  <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
                  <Stack.Screen name="CodeVerification" component={CodeVerificationScreen} />
                  <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                  {/* Add preference screens here */}
                  <Stack.Screen name="MedicalPreferences" component={MedicalPreferencesScreen} />
                  <Stack.Screen name="SelectPreferences" component={SelectPreferencesScreen} />
                  <Stack.Screen name="DietaryPreferences" component={DietaryPreferencesScreen} />

                  {/* group WITH bottom bar */}
                  <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />

                  <Stack.Screen name="Home" component={MainTabs} />
                  <Stack.Screen name="Order" component={MainTabs} />
                  <Stack.Screen name="Account" component={MainTabs} />
                  <Stack.Screen name="Favorites" component={MainTabs} />
                  <Stack.Screen name="Progress" component={MainTabs} />

                  <Stack.Screen name="Subscription" component={SubscriptionScreen} />
                  <Stack.Screen name="EditProfile" component={EditProfile} />
                  <Stack.Screen name="NotificationSettings" component={NotificationSettings} />
                  <Stack.Screen name="ChangePassword" component={ChangePassword} />
                  <Stack.Screen name="AboutProfile" component={AboutProfile} />
                  <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
                  <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />

                  {/* deep screens without bar (pushed over tabs) */}
                  {/* <Stack.Screen name="Home" component={HomeScreen} /> */}

                  <Stack.Screen name="DishDetail" component={SignInScreen} />
                  <Stack.Screen name="Cart" component={CartScreen} />
                  <Stack.Screen name="OrderTrack" component={TrackOrderScreen} />
                  <Stack.Screen name="Notifications" component={NotificationsScreen} />


            </Stack.Navigator>
      );
}
