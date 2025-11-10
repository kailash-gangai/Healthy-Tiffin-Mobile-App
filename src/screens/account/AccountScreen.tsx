import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { COLORS, RADIUS, SHADOW, SPACING } from '../../ui/theme';
import HeaderGreeting from '../../components/HeaderGreeting';
import StatsCard from '../../components/StatChips';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from '../../store/slice/userSlice';
import { clearCustomerTokens } from '../../store/Keystore/customerDetailsStore';
import { RootState } from '../../store';
import { getCustomerMetaField } from '../../shopify/query/CustomerQuery';
import { previewImage } from '../../shopify/mutation/FileUpload';
import { disconnectFitbit, getValidTokens } from '../../config/fitbitService';

import EditIcon from '../../assets/htf-icon/icon-edit.svg';
import OrderIcon from '../../assets/htf-icon/icon-myorder.svg';
import CalenderIcon from '../../assets/htf-icon/icon-callendar.svg';
import GenderIcon from '../../assets/htf-icon/icon-male.svg';
import NotificationIcon from '../../assets/htf-icon/icon-notifaction-outline.svg';
import ChangePasswordIcon from '../../assets/htf-icon/icon-key.svg';
import InfoIcon from '../../assets/htf-icon/icon-info.svg';
import LogoutIcon from '../../assets/htf-icon/icon-logout.svg';
import ConnectIcon from '../../assets/htf-icon/icon-connect.svg';
import DisConnectIcon from '../../assets/htf-icon/icon-disconnect.svg';

type AboutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  navigation: AboutScreenNavigationProp;
  route: any;
};
const AccountScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [image, setImage] = useState('');
  const [gender, setGender] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [isHealthKitConnected, setIsHealthKitConnected] = useState(false);
  const Row = ({
    icon,
    label,
    danger,
    onPress,
  }: {
    icon: React.ReactNode;
    label: string;
    danger?: boolean;
    onPress?: () => void;
  }) => (
    <TouchableOpacity activeOpacity={0.52} onPress={onPress} style={s.row}>
      <View style={s.rowIcon}>{icon}</View>
      <Text style={[s.rowText, danger && { color: COLORS.red }]}>{label}</Text>
    </TouchableOpacity>
  );
  const fetchdata = async (key: string) => {
    if (user?.customerToken) {
      const metafield = await getCustomerMetaField(user?.customerToken, key);
      return metafield;
    }
  };
  const media = async (user: any) => {
    const medias = await previewImage(user.avatar);
    setImage(medias.nodes[0]?.preview.image.url);
  };
  const getAccessTokenHealthKit = async () => {
    const t = await getValidTokens();
    if (t) {
      setIsHealthKitConnected(true);
    } else {
      setIsHealthKitConnected(false);
    }
  };

  useEffect(() => {
    if (route.params?.updatedAvatar) {
      setImage(route.params.updatedAvatar);
    }
  }, [route.params?.updatedAvatar]);

  useEffect(() => {
    fetchdata('gender').then(res => setGender(res));
    fetchdata('age').then(res => setAge(res));

    media(user);
    getAccessTokenHealthKit();
  }, [fetchdata, user, dispatch]);
  const Badge = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
    <View style={s.badge}>
      <Text>{icon}</Text>
      <Text style={s.badgeTxt}> {text}</Text>
    </View>
  );
  const onLogout = () => {
    dispatch(clearUser());
    clearCustomerTokens();
    navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
  };
  const DisconnectHealthKit = async () => {
    const t = await getValidTokens();
    if (t) {
      await disconnectFitbit(t.accessToken);
    }
    setIsHealthKitConnected(false);
    navigation.navigate('ConnectDevice');
  };
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScrollView bounces={false}>
        <HeaderGreeting name="Sam" />
        <StatsCard />
        <View style={s.wrap}>
          <View style={s.header}>
            <Image
              source={
                image ? { uri: image } : require('../../assets/images.png')
              }
              style={s.avatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{user.name}</Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('EditProfile');
                }}
              >
                <Text style={s.edit}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
            <View style={s.profile}>
              <Badge
                icon={<CalenderIcon height={24} width={24} />}
                text={age + ' years'}
              />
              <Badge
                icon={<GenderIcon height={24} width={24} />}
                text={gender}
              />
            </View>
          </View>
          <View style={s.card}>
            <Row
              icon={<EditIcon height={24} width={24} />}
              label="Edit Preferences and Details"
              onPress={() => {
                navigation.navigate('SelectPreferences');
              }}
            />
            <Row
              icon={<OrderIcon height={24} width={24} />}
              label="My Orders"
              onPress={() => {
                navigation.navigate('Order');
              }}
            />
            <Row
              icon={<NotificationIcon height={24} width={24} />}
              label="Notification Settings"
              onPress={() => {
                navigation.navigate('NotificationSettings');
              }}
            />
            <Row
              icon={<ChangePasswordIcon height={24} width={24} />}
              label="Change Password"
              onPress={() => {
                navigation.navigate('ChangePassword');
              }}
            />

            <Row
              icon={
                isHealthKitConnected ? (
                  <DisConnectIcon height={24} width={24} />
                ) : (
                  <ConnectIcon height={24} width={24} />
                )
              }
              label={
                isHealthKitConnected
                  ? 'Disconnect HealthKit'
                  : 'Connect HealthKit'
              }
              onPress={() => {
                isHealthKitConnected
                  ? DisconnectHealthKit()
                  : navigation.navigate('ConnectDevice');
              }}
            />

            <Row
              icon={<InfoIcon height={24} width={24} />}
              label="About"
              onPress={() => {
                navigation.navigate('AboutProfile');
              }}
            />

            <View style={s.divider} />
            <Row
              icon={<LogoutIcon height={24} width={24} />}
              label="Log Out"
              danger
              onPress={() => onLogout()}
            />
          </View>

          {/* CTA */}
          {/* <TouchableOpacity activeOpacity={0.9} style={s.cta} onPress={() => {
                                    navigation.navigate('Subscription');
                              }}>
                                    <Text style={s.ctaTxt}>Subscribe Premium</Text>
                              </TouchableOpacity> */}
        </View>
      </ScrollView>
    </View>
  );
};

export default AccountScreen;
const s = StyleSheet.create({
  wrap: { padding: SPACING },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 12 },
  name: { color: COLORS.black, fontWeight: '800', fontSize: 18 },
  edit: {
    color: COLORS.green,
    textDecorationLine: 'underline',
    marginTop: 2,
    fontWeight: '700',
  },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: COLORS.green,
    borderRadius: 10,
    paddingHorizontal: 10,
    padding: 8,
    textAlign: 'center',
    gap: 6,
  },
  badgeTxt: { color: COLORS.white, fontSize: 16 },

  card: {
    backgroundColor: COLORS.gray,
    borderRadius: RADIUS,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  row: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  rowIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rowText: { color: COLORS.black, fontSize: 18, flex: 1 },

  divider: { height: 1, backgroundColor: '#E8E8E8', marginVertical: 6 },

  cta: {
    height: 52,
    backgroundColor: COLORS.green,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  ctaTxt: { color: COLORS.white, fontWeight: '800', fontSize: 20 },
});
