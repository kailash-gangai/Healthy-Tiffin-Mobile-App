import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';

import { COLORS, RADIUS, SPACING, SHADOW } from '../ui/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../screens/navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { selectCount } from '../store/slice/cartSlice';
import { RootState } from '../store';

export default function HeaderGreeting({ name }: { name: string }) {
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
      const cartCount = useSelector(selectCount);
      const dispatch = useDispatch();
      const user = useSelector((state: RootState) => state.user);
      useEffect(() => {
            if (!user || !user.name) {
                  navigation.navigate('SignIn');
            }
      }, [user, navigation]);
      return (
            <View>
                  <View style={s.orange}>
                        <View style={s.row}>
                              <View style={s.left}>
                                    <Image source={{ uri: user?.avatar || 'https://i.pravatar.cc/80' }} style={s.avatar} />
                                    <Text style={s.hello}>Hello, {user.name}!</Text>
                              </View>

                              <View style={s.right}>
                                    <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                                          <FontAwesome5 name="bell" size={20} color={COLORS.white} />
                                    </TouchableOpacity>

                                    <View style={s.iconWrap}>
                                          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
                                                <FontAwesome5 iconStyle='solid' name="shopping-bag" size={20} color={COLORS.white} />
                                          </TouchableOpacity>

                                          <View style={s.badge}>
                                                <Text>
                                                      <Text style={s.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                                                </Text>
                                          </View>
                                    </View>
                              </View>
                        </View>
                  </View>
            </View>
      );
}

const s = StyleSheet.create({
      orange: {
            backgroundColor: '#F9B233',
            height: 160,
            paddingHorizontal: 16,
            justifyContent: 'center',
            paddingTop: SPACING * 2,
      },
      row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
      left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
      avatar: { width: 40, height: 40, borderRadius: 20 },
      hello: { color: COLORS.white, fontWeight: '700', fontSize: 18 },
      right: { flexDirection: 'row', gap: 12 },

      iconWrap: { position: 'relative' },
      badge: {
            position: 'absolute',
            top: -6,
            right: -8,
            minWidth: 18,
            height: 18,
            paddingHorizontal: 4,
            borderRadius: 9,
            backgroundColor: '#EF4444',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: COLORS.white,
      },
      badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

      cardWrap: {
            backgroundColor: COLORS.white,
            alignItems: 'center',
            marginTop: -20,
            borderTopLeftRadius: RADIUS,
            borderTopRightRadius: RADIUS,
      },
      card: { marginHorizontal: 16, backgroundColor: COLORS.white, borderRadius: 20, paddingVertical: 14, ...SHADOW },
      rowStats: { flexDirection: 'row', justifyContent: 'space-around' },
      pill: { alignItems: 'center', justifyContent: 'center', borderRadius: 12, padding: 8 },
      value: { fontWeight: '800', color: COLORS.black },
      unit: { fontSize: 11, color: COLORS.sub },
      label: { fontSize: 12, color: COLORS.sub },
});
