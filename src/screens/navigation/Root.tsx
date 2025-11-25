// app/navigation/Root.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  StatusBar,
  Platform,
  StyleSheet,
  useColorScheme,
  Animated,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import SplashScreen from '../../components/SplashScreen';
import ResetPasswordScreen from '../auth/ResetPasswordScreen';
import AboutScreen from '../../screens/AboutScreen';
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
import HealthFeedScreen from '../feed/HealthFeedScreen';
import WaterTrackerScreen from '../trackers/WaterTrackerScreen';
import ConnectDevicesScreen from '../trackers/ConnectDevicesScreen';
import CaloriesScreen from '../trackers/CaloriesScreen';
import StepsTrackerScreen from '../trackers/StepsTrackerScreen';
import WeightTrackerScreen from '../trackers/WeightTrackerScreen';
import SleepTrackerScreen from '../trackers/SleepTrackerScreen';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { checkCustomerTokens } from '../../store/Keystore/customerDetailsStore';
import { clearUser, setUser } from '../../store/slice/userSlice';
import {
  createNavigationContainerRef,
  useNavigation,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import ReferalScreen from '../referal/ReferalScreen';
const Stack = createNativeStackNavigator();
export default function Root() {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useEffect(() => {
    //check the user is logged in
    if (!user.customerToken) {
      const customerdetails = checkCustomerTokens();
      console.log('customerdetails', customerdetails);
      if (!customerdetails) {
        dispatch(clearUser());
      }
      customerdetails.then(result => {
        console.log('result', result);
        if (result) {
          dispatch(setUser(result));
          setHasToken(true);
        } else {
          dispatch(clearUser());
          setHasToken(false);
        }
      });
    } else {
      setHasToken(false);
    }
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
  // if (!hasToken) {
  //       navigation.navigate('SignIn');
  // }.     

  if (loading) {
    return <SplashScreen fadeAnim={fadeAnim} />;
  }
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
      }}
    >
       {/* Add preference screens here */}
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
      <Stack.Screen
        name="CodeVerification"
        component={CodeVerificationScreen}
      />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

      <Stack.Screen
        name="SelectPreferences"
        component={SelectPreferencesScreen}
      />
      <Stack.Screen
        name="MedicalPreferences"
        component={MedicalPreferencesScreen}
      />
      <Stack.Screen
        name="DietaryPreferences"
        component={DietaryPreferencesScreen}
      />

      {/* group WITH bottom bar */}
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Referal" component={ReferalScreen} />

      <Stack.Screen name="Home" component={MainTabs} />
      <Stack.Screen name="Order" component={MainTabs} />
      <Stack.Screen name="Account" component={MainTabs} />
      <Stack.Screen name="Favorites" component={MainTabs} />
      <Stack.Screen name="Progress" component={MainTabs} />

      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettings}
      />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="AboutProfile" component={AboutProfile} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />

      <Stack.Screen name="DishDetail" component={SignInScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="OrderTrack" component={TrackOrderScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="HealthFeed" component={HealthFeedScreen} />
      <Stack.Screen name="WaterTracker" component={WaterTrackerScreen} />
      <Stack.Screen name="SleepTracker" component={SleepTrackerScreen} />
      <Stack.Screen name="WeightTracker" component={WeightTrackerScreen} />
      <Stack.Screen name="StepsTracker" component={StepsTrackerScreen} />
      <Stack.Screen name="CaloriesTracker" component={CaloriesScreen} />
      <Stack.Screen name="ConnectDevice" component={ConnectDevicesScreen} />
    </Stack.Navigator>
  );
}
