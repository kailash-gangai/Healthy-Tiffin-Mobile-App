import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  GestureResponderEvent,
  Alert,
  ActivityIndicator,
  LayoutChangeEvent,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Dimensions } from 'react-native';
import FormInput from '../../components/FormInput';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  customerUpsert,
  loginCustomer,
} from '../../shopify/mutation/CustomerAuth';
import { COLORS } from '../../ui/theme';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slice/userSlice';
import {
  checkCustomerTokens,
  saveCustomerTokens,
} from '../../store/Keystore/customerDetailsStore';
import {
  showToastError,
  showToastSuccess,
} from '../../config/ShowToastMessages';
import PasswoedIcon from '../../assets/htf-icon/icon-passwoed.svg';
import EmailIcon from '../../assets/htf-icon/icon-mail.svg';
import UserIcon from '../../assets/htf-icon/icon-user.svg';
import ContinueIcon from '../../assets/htf-icon/icon-continue.svg';
import SocialAuthButtons from '../../components/SocialMediaLogin';


const { height } = Dimensions.get('window');
const heroHeight = Math.max(350, Math.min(480, Math.round(height * 0.35)));

type AboutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type Props = { navigation: AboutScreenNavigationProp };

const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [pass, setPass] = useState<string>('');
  const [errors, setErrors] = useState<any>({});
  const [isloading, setIsloading] = useState(false);

  // track Y positions of inputs to scroll precisely on focus
  const positions = useRef<{ [k: string]: number }>({}).current;
  const onLayoutAt =
    (key: string) =>
      (e: LayoutChangeEvent): void => {
        positions[key] = e.nativeEvent.layout.y;
      };
  const ensureVisible = (key: string) => {
    const y = positions[key] ?? 0;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
    });
  };

  const validateEmail = (v: string) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
  const validatePassword = (v: string) => v.length >= 6;
  const validateName = (full: string) => {
    const [firstName, lastName] = full.trim().split(' ');
    return !!(firstName && lastName);
  };

  const onSubmit = useCallback(
    async (_: GestureResponderEvent) => {
      setIsloading(true);
      setErrors({});
      if (!name || !email || !pass) {
        setErrors({
          name: name ? '' : 'Is required',
          email: email ? '' : 'Is required',
          pass: pass ? '' : 'Is required',
        });
        setIsloading(false);
        return;
      }
      if (!validateEmail(email)) {
        setErrors({ email: 'Please enter a valid email address.' });
        setIsloading(false);
        return;
      }
      if (!validateName(name)) {
        setErrors({ name: 'Please enter your full name.' });
        setIsloading(false);
        return;
      }
      if (!validatePassword(pass)) {
        setErrors({ pass: 'Password must be at least 6 characters.' });
        setIsloading(false);
        return;
      }

      const [firstName, lastName] = name.trim().split(' ');
      const userData = { email, password: pass, firstName, lastName };

      try {
        const response = await customerUpsert(userData);
        if (response?.customerCreate?.customerUserErrors?.length) {
          setIsloading(false);
          Alert.alert(
            'Error',
            response.customerCreate.customerUserErrors[0]?.message,
          );
          return;
        }
        if (response?.customerCreate?.customer?.id) {
          const login = await loginCustomer(userData);
          const token =
            login?.customerAccessTokenCreate?.customerAccessToken?.accessToken;
          const expiresAt =
            login?.customerAccessTokenCreate?.customerAccessToken?.expiresAt;
          if (token) {
            saveCustomerTokens({
              customerToken: token,
              tokenExpire: expiresAt,
            });
            const details = await checkCustomerTokens();
            if (details) dispatch(setUser(details));
            setIsloading(false);
            showToastSuccess('Customer registration successful.');
            navigation.navigate('SelectPreferences');
            return;
          }
        }
        setIsloading(false);
      } catch (error) {
        setIsloading(false);
        showToastError(
          error instanceof Error ? error.message : 'An error occurred.',
        );
      }
    },
    [name, email, pass, dispatch, navigation],
  );


  return (
    // Removed KeyboardAvoidingView to avoid large jumps.
    <ScrollView
      ref={scrollRef}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets
      contentInset={{ bottom: insets.bottom + 20 }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: 24 + insets.bottom,
      }}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={styles.heroWrap}>
        <ImageBackground
          source={require('../../assets/banners/chana.jpg')}
          resizeMode="cover"
          style={styles.heroBg}
          imageStyle={{ opacity: 0.85 }}
        >
          <View style={styles.overlay} />
          <View style={styles.heroContent}>
            <Image
              source={require('../../assets/LOGO.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.welcome}>Welcome!</Text>
            <Text style={styles.subtitle}>
              Please enter the details to proceed.
            </Text>
          </View>
        </ImageBackground>
      </View>

      <View style={[styles.card, { paddingBottom: 28 + 24 + insets.bottom }]}>
        <View onLayout={onLayoutAt('name')}>
          <FormInput
            label="Full Name"
            icon={<UserIcon width={24} height={24} />}
            placeholder="Enter full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
            onFocus={() => ensureVisible('name')}
          />
        </View>
        {errors.name ? (
          <Text style={{ color: COLORS.red, fontSize: 14, marginLeft: 12 }}>
            {errors.name}
          </Text>
        ) : null}

        <View onLayout={onLayoutAt('pass')}>
          <FormInput
            label="Password"
            icon={<PasswoedIcon width={24} height={24} />}
            placeholder="Enter password"
            secure
            value={pass}
            onChangeText={setPass}
            returnKeyType="next"
            onFocus={() => ensureVisible('pass')}
          />
        </View>
        {errors.pass ? (
          <Text style={{ color: COLORS.red, fontSize: 14, marginLeft: 12 }}>
            {errors.pass}
          </Text>
        ) : null}

        <View onLayout={onLayoutAt('email')}>
          <FormInput
            label="Email Address"
            icon={<EmailIcon width={24} height={24} />}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            returnKeyType="done"
            onFocus={() => ensureVisible('email')}
          />
        </View>
        {errors.email ? (
          <Text style={{ color: COLORS.red, fontSize: 14, marginLeft: 12 }}>
            {errors.email}
          </Text>
        ) : null}

        <TouchableOpacity
          disabled={isloading}
          activeOpacity={0.9}
          style={styles.ctaBtn}
          onPress={onSubmit}
        >
          <LinearGradient
            colors={['#42D296', '#2AB47B']} 
            start={{ x: 0.0, y: 0.0 }} 
            end={{ x: 1.0, y: 1.0 }} 
            locations={[0.0982, 0.9387]} 
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Sign Up</Text>
            {isloading ? (
              <ActivityIndicator
                size="small"
                style={{ marginLeft: 8 }}
                color={COLORS.white}
              />
            ) : (
              <ContinueIcon
                width={24}
                height={24}
                style={{ marginLeft: 8 }}
              />
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.dividerWrap}>
          <View style={styles.line} />
          <Text style={styles.orText}>Or</Text>
          <View style={styles.line} />
        </View>

        <SocialAuthButtons navigation={navigation} />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.footerLink}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  /** HERO */
  heroWrap: { height: heroHeight, backgroundColor: COLORS.green },
  heroBg: { flex: 1, justifyContent: 'flex-end' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroContent: {
    paddingHorizontal: 12,
    paddingBottom: 60,
    alignItems: 'center',
  },
  logo: { width: 150, height: 150, marginBottom: 8 },
  title: { fontSize: 28, color: COLORS.white, fontWeight: '800' },
  welcome: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 20,
    marginTop: 4,
    lineHeight: 34,
  },
  subtitle: {
    color: COLORS.white,
    opacity: 0.9,
    fontSize: 20,
    marginTop: 2,
    marginBottom: 10,
  },

  /** CARD */
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  /** CTA */
  ctaBtn: { marginTop: 18 },
  ctaGradient: {
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  ctaText: {
    color: COLORS.white,
    fontWeight: '800',
    letterSpacing: 0.2,
    fontSize: 16,
  },

  /** Divider + Socials */
  dividerWrap: { marginTop: 20, alignItems: 'center', flexDirection: 'row' },
  line: { flex: 1, height: 1, backgroundColor: COLORS.divider },
  orText: { marginHorizontal: 12, color: COLORS.subText, fontWeight: '600' },

  /** Footer */
  footerRow: { marginTop: 22, flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: COLORS.subText },
  footerLink: { color: COLORS.green, fontWeight: '800' },
});

export default SignUpScreen;

/*
Android manifest:
<activity
  android:name=".MainActivity"
  android:windowSoftInputMode="adjustResize" />
*/
