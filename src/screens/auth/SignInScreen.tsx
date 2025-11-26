import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  GestureResponderEvent,
  Alert,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Dimensions } from 'react-native';
import FormInput from '../../components/FormInput';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../../ui/theme';
import { loginCustomer } from '../../shopify/mutation/CustomerAuth';
import { useDispatch } from 'react-redux';
import {
  checkCustomerTokens,
  saveCustomerTokens,
} from '../../store/Keystore/customerDetailsStore';
import { setUser } from '../../store/slice/userSlice';
import PasswoedIcon from '../../assets/htf-icon/icon-passwoed.svg';
import EmailIcon from '../../assets/htf-icon/icon-mail.svg';
import ContinueIcon from '../../assets/htf-icon/icon-continue.svg';
import SocialAuthButtons from '../../components/SocialMediaLogin';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type Props = {
  navigation: NavigationProp;
};
const { height } = Dimensions.get('window');
const heroHeight = Math.max(240, Math.min(480, Math.round(height * 0.35)));


const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState<string>('');
  const [pass, setPass] = useState<string>('');
  const [errors, setErrors] = useState<any>({});
  const [isloading, setIsloading] = useState(false);
  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  const validatePassword = (password: string) => {
    return password.length >= 6;
  };
  const onSubmit = useCallback(
    async (_: GestureResponderEvent) => {
      setIsloading(true);
      setErrors({});
      if (!email || !pass) {
        setErrors({
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
      if (!validatePassword(pass)) {
        setErrors({ pass: 'Password must be at least 6 characters.' });
        setIsloading(false);
        return;
      }
      const userData = {
        email,
        password: pass,
      };
      try {
        const response = await loginCustomer(userData);

        if (
          response?.customerAccessTokenCreate?.customerAccessToken?.accessToken
        ) {
          const customerToken =
            response.customerAccessTokenCreate.customerAccessToken.accessToken;
          const tokenExpire =
            response.customerAccessTokenCreate.customerAccessToken.expiresAt;
          saveCustomerTokens({ customerToken, tokenExpire });
          let customerdetails = checkCustomerTokens();
          console.log('customerdetails', customerdetails);
          customerdetails.then(result => {
            console.log('result', result);
            if (result) {
              dispatch(setUser(result));
            }
          });
          Alert.alert('Success', 'Login successful!');
          setIsloading(false);
          navigation.navigate('Home');
          // navigation.navigate('home');s
        }
      } catch (error) {
        setIsloading(false);
        Alert.alert(
          'Error',
          error instanceof Error ? error.message : 'An error occurred.',
        );
      } finally {
        setIsloading(false);
      }
    },
    [email, pass],
  );

  return (
    <ScrollView bounces={false} contentContainerStyle={{ flexGrow: 1 }}>
      {/* HERO with image + logo + titles */}
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
            <Text style={styles.title}>Sign In Now </Text>
            <Text style={styles.welcome}>
              Welcome! Please enter the details to proceed.
            </Text>
          </View>
        </ImageBackground>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        <FormInput
          label="Email Address"
          icon={<EmailIcon width={24} height={24} />}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          returnKeyType="done"
        />
        {errors.email && (
          <Text style={{ color: COLORS.red, fontSize: 14, marginLeft: 12 }}>
            {errors.email}
          </Text>
        )}

        <FormInput
          label="Password"
          icon={<PasswoedIcon width={24} height={24} />}
          placeholder="Enter password"
          secure
          value={pass}
          onChangeText={setPass}
          returnKeyType="next"
        />
        {errors.pass && (
          <Text style={{ color: COLORS.red, fontSize: 14, marginLeft: 12 }}>
            {errors.pass}
          </Text>
        )}
        <View style={styles.forgetWrap}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('ForgetPassword');
            }}
          >
            <Text style={styles.forgetpassword}>Forget Password?</Text>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <Pressable
          disabled={isloading}
          style={styles.ctaBtn}
          onPress={onSubmit}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={[COLORS.green, COLORS.greenLight]}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Sign In</Text>
            {isloading ? (
              <ActivityIndicator
                size="small"
                style={{ marginLeft: 8 }}
                color={COLORS.white}
              />
            ) : (
              <ContinueIcon width={24} height={24} style={{ marginLeft: 8 }} />
            )}
          </LinearGradient>
        </Pressable>

        {/* Divider */}
        <View style={styles.dividerWrap}>
          <View style={styles.line} />
          <Text style={styles.orText}>Or</Text>
          <View style={styles.line} />
        </View>

        {/* Social buttons row */}
        <SocialAuthButtons navigation={navigation} />
        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('SignUp');
            }}
          >
            <Text style={styles.footerLink}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  heroWrap: { height: heroHeight, backgroundColor: COLORS.green },
  heroBg: { flex: 1, justifyContent: 'flex-end' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0s,0,0.35)',
  },
  heroContent: {
    paddingHorizontal: 12,
    paddingBottom: 60,
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 8,
  },
  title: { fontSize: 28, color: COLORS.white, fontWeight: '800' },
  welcome: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 20,
    marginTop: 4,
    lineHeight: 34,
  },
  forgetWrap: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  forgetpassword: {
    color: '#000',
    fontWeight: '600',
    marginTop: 8,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28 + (Platform.OS === 'ios' ? 10 : 16),
  },

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

  dividerWrap: { marginTop: 20, alignItems: 'center', flexDirection: 'row' },
  line: { flex: 1, height: 1, backgroundColor: COLORS.divider },
  orText: { marginHorizontal: 12, color: COLORS.subText, fontWeight: '600' },


  footerRow: { marginTop: 22, flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: COLORS.subText },
  footerLink: { color: COLORS.green, fontWeight: '800' },
});

export default SignInScreen;
