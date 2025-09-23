import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { CARTWRAP, COLORS, SPACING } from '../../ui/theme';
import HeaderGreeting from '../../components/HeaderGreeting';
import OrderCard from '../../components/OrderCard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector } from '../../store/hooks';
import { getCustomerOrder } from '../../shopify/queries/getCustomerOrder';
import { OrdersResponse } from '../../shopify/queries/types';
import SkeletonLoading from '../../components/SkeletonLoading';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type Props = {
  navigation: NavigationProp;
};

const OrderScreen: React.FC<Props> = ({ navigation }) => {
  const customer = useAppSelector(state => state.user);
  const [orders, setOrders] = useState<OrdersResponse>(),
    [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCustomerOrder = async () => {
    setIsLoading(true);
    try {
      if (customer && customer?.customerToken) {
        const data: any = await getCustomerOrder(customer?.customerToken, 50);
        if (data) {
          console.log(data, 'order dta');

          setOrders(data);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerOrder();
  }, [customer]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScrollView contentContainerStyle={s.scrollContent}>
        <HeaderGreeting name="Sam" />

        <View style={[CARTWRAP]}>
          {isLoading ? (
            <SkeletonLoading />
          ) : orders?.orders?.length ? (
            <View style={s.list}>
              {orders.orders.map((item, i) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <OrderCard
                    {...item}
                    onPress={() => {
                      navigation.navigate('OrderDetail', { items: item });
                    }}
                  />
                </View>
              ))}
            </View>
          ) : (
            // Empty State Design
            <View style={s.emptyState}>
              <Image
                source={{
                  uri: 'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png',
                }} // Your custom image path here
                style={s.emptyImage}
              />
              <Text style={s.emptyMessage}>You have no orders yet</Text>
              <Text style={s.emptySubMessage}>
                Looks like you haven't placed any orders. Start browsing and
                place your first order!
              </Text>
              <TouchableOpacity
                style={s.shopButton}
                onPress={() => navigation.navigate('home')}
              >
                <Text style={s.shopButtonText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderScreen;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  list: { padding: 14 },

  // Empty State Styling
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyImage: {
    width: 180,
    height: 180,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  emptyMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 10,
  },
  emptySubMessage: {
    fontSize: 14,
    color: COLORS.sub,
    textAlign: 'center',
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: COLORS.green,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 24,
  },
});
