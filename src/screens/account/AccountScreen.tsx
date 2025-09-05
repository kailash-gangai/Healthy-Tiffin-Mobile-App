import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
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

type AboutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
      navigation: AboutScreenNavigationProp;
};
const AccountScreen: React.FC<Props> = ({ navigation }) => {
      const dispatch = useDispatch();
      const user = useSelector((state: RootState) => state.user);
      const [image, setImage] = useState('');
      const [gender, setGender] = useState<string>('');
      const [age, setAge] = useState<string>('');
      const Row = ({
            icon, label, danger, onPress,
      }: { icon: React.ReactNode; label: string; danger?: boolean; onPress?: () => void }) => (
            <TouchableOpacity activeOpacity={0.52} onPress={onPress} style={s.row}>
                  <View style={s.rowIcon}>{icon}</View>
                  <Text style={[s.rowText, danger && { color: COLORS.red }]}>{label}</Text>
            </TouchableOpacity>
      );
      const fetchdata = async (key: string) => {
            if (user?.customerToken) {
                  const metafield = await getCustomerMetaField(user?.customerToken, key);
                  return metafield
            }
      };
      const media = async (user: any) => {
            const medias = await previewImage(user.avatar);
            setImage(medias.nodes[0]?.preview.image.url);
      }; s

      useEffect(() => {
            fetchdata('gender').then(res => setGender(res));
            fetchdata('age').then(res => setAge(res));
            media(user);
      }, []);

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
      return (
            <View style={{ flex: 1, backgroundColor: COLORS.white }}>
                  <ScrollView bounces={false}>
                        <HeaderGreeting name="Sam" />
                        <StatsCard />
                        <View style={s.wrap}>
                              <View style={s.header}>
                                    <Image source={{ uri: image || 'https://i.pravatar.cc/120' }} style={s.avatar} />
                                    <View style={{ flex: 1 }}>
                                          <Text style={s.name}>{user.name}</Text>
                                          <TouchableOpacity onPress={() => {
                                                navigation.navigate('EditProfile');
                                          }}>
                                                <Text style={s.edit}>Edit Profile</Text>
                                          </TouchableOpacity>
                                    </View>
                                    <View style={s.profile}>
                                          <Badge
                                                icon={<FontAwesome5 name="calendar" size={22} color={COLORS.white} />}
                                                text={age + " years"}
                                          />
                                          <Badge
                                                icon={<FontAwesome5 iconStyle="solid" name="mars" size={22} color={COLORS.white} />}
                                                text={gender}
                                          />
                                    </View>
                              </View>
                              <View style={s.card}>
                                    <Row
                                          icon={<FontAwesome5 name="edit" size={24} color={COLORS.accent} />}
                                          label="Edit Preferences and Details"
                                          onPress={() => {
                                                navigation.navigate('SelectPreferences');
                                          }}
                                    />
                                    <Row
                                          icon={<FontAwesome5 name="clipboard" size={24} color={COLORS.accent} />}
                                          label="My Orders"
                                          onPress={() => {
                                                navigation.navigate('Order');
                                          }}
                                    />
                                    <Row
                                          icon={<FontAwesome5 name="bell" size={24} color={COLORS.accent} />}
                                          label="Notification Settings"
                                          onPress={() => {
                                                navigation.navigate('NotificationSettings');
                                          }}
                                    />
                                    <Row
                                          icon={<FontAwesome5 iconStyle="solid" name="key" size={24} color={COLORS.accent} />}
                                          label="Change Password"
                                          onPress={() => {
                                                navigation.navigate('ChangePassword');
                                          }}
                                    />
                                    <Row
                                          icon={<FontAwesome5 iconStyle="solid" name="info" size={24} color={COLORS.accent} />}
                                          label="About"
                                          onPress={() => {
                                                navigation.navigate('AboutProfile');
                                          }}
                                    />
                                    <View style={s.divider} />
                                    <Row
                                          icon={<FontAwesome5 iconStyle="solid" name="sign-out-alt" size={24} color={COLORS.red} />}
                                          label="Log Out"
                                          danger
                                          onPress={() => onLogout()}
                                    />
                              </View>

                              {/* CTA */}
                              <TouchableOpacity activeOpacity={0.9} style={s.cta} onPress={() => {
                                    navigation.navigate('Subscription');
                              }}>
                                    <Text style={s.ctaTxt}>Subscribe Premium</Text>
                              </TouchableOpacity>
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
      edit: { color: COLORS.green, textDecorationLine: 'underline', marginTop: 2, fontWeight: '700' },
      profile: { flexDirection: 'row', alignItems: 'center', gap: 10 },
      badge: {
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: COLORS.green,
            borderRadius: 10,
            paddingHorizontal: 10,
            padding: 8,
            textAlign: 'center',
            gap: 6
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
            width: 34, height: 34,
            alignItems: 'center', justifyContent: 'center',
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
