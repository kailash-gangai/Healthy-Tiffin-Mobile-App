import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOW } from '../ui/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../screens/navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { selectCount } from '../store/slice/cartSlice';
import { RootState } from '../store';
import { previewImage } from '../shopify/mutation/FileUpload';
import AddToCartIcon from '../assets/htf-icon/icon-cart.svg';
import NotificationIcon from '../assets/htf-icon/icon-notification.svg';
import HeaderImage from '../assets/newicon/header-image.svg';

export default function HeaderGreeting({ name }: { name: string }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [image, setImage] = React.useState('');
  const cartCount = useSelector(selectCount);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const media = async (user: any) => {
    const medias = await previewImage(user.avatar);
    setImage(medias.nodes[0]?.preview.image.url);
  };
  s;
  useEffect(() => {
    media(user);
  }, [user]);
  return (
    <View>
      <View style={s.orange}>
      <HeaderImage style={s.headerImage} />
        <View style={s.row}>
          <View style={s.left}>
            <Image
              source={image ? { uri: image } : require('../assets/images.png')}
              style={s.avatar}
            />
            <Text style={s.hello}>Hello, {user.name}!</Text>
          </View>

          <View style={s.right}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
            >
              <NotificationIcon width={24} height={24} />
            </TouchableOpacity>

            <View style={s.iconWrap}>
              <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
                <AddToCartIcon width={24} height={24} />
              </TouchableOpacity>

              <View style={s.badge}>
                <Text>
                  <Text style={s.badgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
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
    backgroundColor: '#222222',
    height: 113,
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
    paddingBottom: SPACING,
    marginBottom: SPACING,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
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
  card: {
    marginHorizontal: 16,
    borderRadius: 20,
    paddingVertical: 14,
    ...SHADOW,
  },
  rowStats: { flexDirection: 'row', justifyContent: 'space-around' },
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 8,
  },
  value: { fontWeight: '800', color: COLORS.black },
  unit: { fontSize: 11, color: COLORS.sub },
  label: { fontSize: 12, color: COLORS.sub },
});
