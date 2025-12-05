import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import ContinueIcon from '../../assets/htf-icon/icon-continue.svg';
type AboutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type Props = { navigation: AboutScreenNavigationProp };

const COLORS = {
  green: '#127E51',
  greenLight: '#0E6C40',
  white: '#FFFFFF',
  text: '#232323',
  subText: '#8e8e8e',
  divider: '#e7e7e7',
} as const;

const { width, height } = Dimensions.get('window');
const heroHeight = Math.max(260, Math.min(520, Math.round(height * 0.42)));

const DIGITS = 4;
const RESEND_SECONDS = 30;

const CodeVerificationScreen: React.FC<Props> = ({ navigation }) => {
  const [code, setCode] = useState<string[]>(Array(DIGITS).fill(''));
  const [resendIn, setResendIn] = useState<number>(RESEND_SECONDS);

  const refs = useRef<Array<TextInput | null>>([]);

  const value = useMemo(() => code.join(''), [code]);
  const isComplete = value.length === DIGITS && code.every(c => c !== '');

  useEffect(() => {
    const t = setInterval(() => {
      setResendIn(s => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleChange = (text: string, i: number) => {
    // Support paste of entire code
    if (text.length > 1) {
      const next = text.slice(0, DIGITS).split('');
      setCode(prev => next.concat(Array(Math.max(0, DIGITS - next.length)).fill('')));
      const last = Math.min(DIGITS - 1, next.length - 1);
      refs.current[last]?.focus();
      return;
    }

    const next = [...code];
    next[i] = text.replace(/[^\d]/g, '');
    setCode(next);

    if (text && i < DIGITS - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyPress = (e: any, i: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const onSubmit = useCallback(() => {
    if (!isComplete) return;
    // TODO: call verify API 
    console.log('Verify code:', value);
    navigation.navigate('ResetPassword');
  }, [isComplete, value]);

  const onResend = () => {
    if (resendIn > 0) return;
    // TODO: trigger resend API
    setResendIn(RESEND_SECONDS);
  };

  return (
    <ScrollView bounces={false} contentContainerStyle={{ flexGrow: 1 }}>
      <StatusBar barStyle="light-content" />
      {/* HERO */}
      <View style={styles.heroWrap}>
        <ImageBackground
          source={require('../../assets/banners/chana.jpg')}
          resizeMode="cover"
          style={styles.heroBg}
          imageStyle={{ opacity: 0.9 }}
        >
          <View style={styles.overlay} />
          <View style={styles.heroContent}>
            <Image
              source={require('../../assets/LOGO.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.hello}>Hello!</Text>
            <Text style={styles.subtitle}>Enter Verification code</Text>
          </View>
        </ImageBackground>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        <Text style={styles.message}>
          Please enter the verification code you received on the registered email address
        </Text>

        {/* OTP */}
        <View style={styles.otpRow}>
          {Array.from({ length: DIGITS }).map((_, i) => (
            <TextInput
              key={i}
              ref={r => (refs.current[i] = r)}
              value={code[i]}
              onChangeText={t => handleChange(t, i)}
              onKeyPress={e => handleKeyPress(e, i)}
              keyboardType={Platform.select({ ios: 'number-pad', android: 'numeric' })}
              textContentType="oneTimeCode"
              returnKeyType="done"
              maxLength={1}
              style={[styles.otpBox, code[i] ? styles.otpBoxFilled : null]}
              selectionColor={COLORS.green}
              placeholder=""
              autoFocus={i === 0}
              accessibilityLabel={`OTP digit ${i + 1}`}
            />
          ))}
        </View>

        {/* Continue */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.ctaBtn, !isComplete && { opacity: 0.5 }]}
          onPress={onSubmit}
          disabled={!isComplete}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={[COLORS.green, COLORS.greenLight]}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Continue</Text>
            <ContinueIcon width={24} height={24} style={{ marginLeft: 8 }} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={styles.footerText}>Didn’t receive a code?</Text>
          <TouchableOpacity onPress={onResend} disabled={resendIn > 0}>
            <Text style={[styles.footerLink, resendIn > 0 && { opacity: 0.5 }]}>
              {resendIn > 0 ? ` Resend in ${resendIn}s` : ' Resend Code'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default CodeVerificationScreen;

const styles = StyleSheet.create({
  heroWrap: { height: heroHeight, backgroundColor: COLORS.green },
  heroBg: { flex: 1, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  heroContent: { paddingHorizontal: 12, paddingBottom: 54, alignItems: 'center' },
  logo: { width: 120, height: 120, marginBottom: 8 },
  hello: { fontSize: 28, color: COLORS.white, fontWeight: '800' },
  subtitle: { color: COLORS.white, textAlign: 'center', fontSize: 16, marginTop: 4 },

  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    marginTop: -10,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16 + (Platform.OS === 'ios' ? 8 : 16),
  },
  message: {
    fontSize: 15,
    color: COLORS.text,
    paddingHorizontal: 4,
    marginTop: 6,
  },

  otpRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpBox: {
    width: (width - 40 - 24) / 4,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    backgroundColor: '#fff',
  },
  otpBoxFilled: { borderColor: COLORS.green },

  ctaBtn: { marginTop: 20 },
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
  ctaText: { color: COLORS.white, fontWeight: '800', letterSpacing: 0.2, fontSize: 16 },

  resendRow: { marginTop: 18, flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: COLORS.subText },
  footerLink: { color: COLORS.green, fontWeight: '800' },
});
