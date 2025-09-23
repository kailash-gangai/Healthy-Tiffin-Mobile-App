import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import { Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import FormInput from '../../components/FormInput';
import PasswoedIcon from '../../assets/htf-icon/icon-passwoed.svg';
import ContinueIcon from '../../assets/htf-icon/icon-continue.svg';


type Nav = NativeStackNavigationProp<RootStackParamList>;
type Props = { navigation: Nav };

const COLORS = {
  green: '#0B5733',
  greenLight: '#0E6C40',
  white: '#FFFFFF',
  text: '#232323',
  subText: '#8e8e8e',
  divider: '#e7e7e7',
  danger: '#D32F2F',
  success: '#2E7D32',
} as const;

const { height } = Dimensions.get('window');
const heroHeight = Math.max(260, Math.min(520, Math.round(height * 0.42)));

const strong = (p: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(p);

const ResetPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  const isStrong = useMemo(() => strong(pwd), [pwd]);
  const matches = useMemo(() => pwd.length > 0 && pwd === confirm, [pwd, confirm]);
  const canSubmit = isStrong && matches;

  const onSave = () => {
    if (!canSubmit) return;
    // TODO: call reset API
    console.log('Reset password to:', pwd);
    navigation.navigate('SignIn');
  };

  return (
    <ScrollView bounces={false} contentContainerStyle={{ flexGrow: 1 }}>
      <StatusBar barStyle="light-content" />
      {/* Hero */}
      <View style={styles.heroWrap}>
        <ImageBackground
          source={require('../../assets/banners/chana.jpg')}
          style={styles.heroBg}
          resizeMode="cover"
          imageStyle={{ opacity: 0.9 }}
        >
          <View style={styles.overlay} />
          <View style={styles.heroContent}>
            <Image source={require('../../assets/LOGO.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.hello}>Hello!</Text>
            <Text style={styles.subtitle}>Reset your password</Text>
          </View>
        </ImageBackground>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.lead}>
          Enter a new password that is strong and easy to remember
        </Text>

        <FormInput
          label="New Password"
          icon={<PasswoedIcon width={24} height={24} />}
          placeholder="********"
          value={pwd}
          secure
          onChangeText={setPwd}
          secureTextEntry={!show1}
          returnKeyType="next"
        />
        {pwd.length > 0 && (
          <Text style={[styles.hint, { color: isStrong ? COLORS.success : COLORS.danger }]}>
            {isStrong
              ? 'Strong password'
              : 'Use 8+ characters with upper, lower and a number'}
          </Text>
        )}

        <FormInput
          label="Confirm Password"
          icon={<PasswoedIcon width={24} height={24} />}
          secure
          placeholder="********"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry={!show2}
          returnKeyType="done"
        />
        {confirm.length > 0 && !matches && (
          <Text style={[styles.hint, { color: COLORS.danger }]}>Passwords do not match</Text>
        )}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onSave}
          disabled={!canSubmit}
          style={[styles.ctaBtn, !canSubmit && { opacity: 0.5 }]}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={[COLORS.green, COLORS.greenLight]}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Save</Text>
            <ContinueIcon width={24} height={24} style={{ marginLeft: 8 }} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ResetPasswordScreen;

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
  lead: {
    fontSize: 15,
    color: COLORS.text,
    paddingHorizontal: 4,
    marginTop: 6,
  },
  hint: { fontSize: 13, marginTop: 4, marginLeft: 4 },

  ctaBtn: { marginTop: 22 },
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
});
