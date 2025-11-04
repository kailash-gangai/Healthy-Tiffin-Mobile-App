import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
  StyleSheet,
  Dimensions,
  Pressable,
  LayoutAnimation,
  UIManager,
  Platform,
  Image,
} from 'react-native';
import ArrowUp from '../assets/htf-icon/icon-up.svg';
import ArrowDown from '../assets/htf-icon/icon-down.svg';
import TrashIcon from '../assets/htf-icon/icon-trans.svg';
import { SHADOW } from '../ui/theme';
import LinearGradient from 'react-native-linear-gradient';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addItems,
  removeItem,
  clearCart,
  decreaseItem,
  increaseItem,
} from '../store/slice/cartSlice';

const { height } = Dimensions.get('window');
const MAIN_CAT_ORDER = ['PROTEIN', 'VEGGIES', 'SIDES', 'PROBIOTICS'];
const REQUIRED_CATS = ['PROTEIN', 'VEGGIES', 'SIDES', 'PROBIOTICS'];

const WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8A8A8A',
  green: '#0B5733',
  yellow: '#FFCA40',
  bg: 'rgba(0,0,0,0.45)',
  lightGray: '#F4F4F4',
  border: '#EDEDED',
  red: '#FF6B6B',
};

export default function CartSummaryModal({
  visible,
  onClose,
  navigation,
}: {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}) {
  const translateY = useRef(new Animated.Value(height)).current;
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [selectedType, setSelectedType] = useState<'Steel' | 'ECO'>('Steel');
  const dispatch = useAppDispatch();
  const { lines } = useAppSelector(state => state.cart); // Getting the cart lines

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 120,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: height,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const toggleExpand = (day: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const fmt = (n: number) => n.toFixed(2);

  // Helper function to format and group items by day and tiffin plan
  const grouped = useMemo(() => {
    const days = [...new Set(lines.map(l => l.day))].filter(
      Boolean,
    ) as string[];
    return days.map(day => {
      const mains = lines.filter(x => x.day === day && x.type === 'main');
      const addons = lines.filter(x => x.day === day && x.type === 'addon');

      const plansMap = mains.reduce((acc: any, item: any) => {
        if (!acc[item.tiffinPlan]) acc[item.tiffinPlan] = [];
        acc[item.tiffinPlan].push(item);
        return acc;
      }, {});

      const tiffinPlans = Object.entries(plansMap)
        .map(([planNumber, items]: any) => ({
          plan: parseInt(planNumber),
          items: items.sort(
            (a: any, b: any) =>
              MAIN_CAT_ORDER.indexOf(a.category) -
              MAIN_CAT_ORDER.indexOf(b.category),
          ),
        }))
        .sort((a, b) => a.plan - b.plan);

      return { day, mains, tiffinPlans, addons };
    });
  }, [lines]);

  const validateCategories = (planItems: any[]) => {
    const catsPresent = new Set(
      planItems.map((item: any) => item.category.toUpperCase()),
    );
    const missing = REQUIRED_CATS.filter(cat => !catsPresent.has(cat));
    return missing;
  };

  const formatDate = (date: string) => {
    // Split the date string into parts: MM/DD/YYYY
    const [month, day, year] = date.split('/');

    // Create a new Date object with the parsed date parts
    const parsedDate = new Date(`${year}-${month}-${day}`);

    // Check if the date is valid
    if (isNaN(parsedDate.getTime())) {
      return 'Invalid date';
    }

    // Format the date into "24 Nov, 2025"
    const options: any = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return parsedDate.toLocaleDateString('en-US', options);
  };

  const DayBlock = ({ day, items }: { day: string; items: any[] }) => {
    const isOpen = expanded[day];
    const missingCategories = validateCategories(items); // Validate categories for each tiffin plan
    return (
      <View style={s.dayCard}>
        <TouchableOpacity
          style={s.dayHeader}
          activeOpacity={0.8}
          onPress={() => toggleExpand(day)}
        >
          <Text style={s.dayText}>
            {`${formatDate(items?.[0]?.date)} | ${day}`}
          </Text>
          <View style={s.priceTag}>
            <Text style={s.priceText}>
              $
              {items
                .reduce((total, item) => total + item.price * item.qty, 0)
                .toFixed(2)}
            </Text>
          </View>
          <View style={s.arrowBox}>
            <Text style={{ color: COLORS.green }}>
              {isOpen ? (
                <ArrowDown height={24} width={24} />
              ) : (
                <ArrowUp height={24} width={24} />
              )}
            </Text>
          </View>
        </TouchableOpacity>

        {isOpen && (
          <View>
            <View style={s.divider} />
            {items.map((item, i) => (
              <View key={i} style={s.itemRow}>
                <View style={s.thumb}>
                  <Image source={{ uri: item.image }} style={s.imgMini} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.productName}>{item.title}</Text>
                  <Text style={s.productPrice}>${item.price.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                  style={s.deleteBtn}
                  onPress={() =>
                    dispatch(
                      removeItem({
                        id: item.id,
                        variantId: item.variantId,
                        tiffinPlan: item.tiffinPlan,
                        type: item.type,
                      }),
                    )
                  }
                >
                  <Text style={s.deleteIcon}>
                    <TrashIcon height={24} width={24} />
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
            {missingCategories.length > 0 && (
              <Text style={s.missingText}>
                Missing Categories: {missingCategories.join(', ')}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={s.backdrop} onPress={onClose} />
      <Animated.View style={[s.sheet, { transform: [{ translateY }] }]}>
        <View style={s.handle} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <Text style={s.title}>Cart Summary</Text>

          {/* Container Type (toggleable) */}
          <Text style={s.label}>Select container type</Text>
          <View style={s.toggleWrap}>
            {['Steel', 'ECO'].map((opt, i) => {
              const isActive = selectedType === opt;
              return (
                <LinearGradient
                  key={opt}
                  colors={
                    isActive ? ['#f2c113', '#e2b517'] : ['#f3f3f3', '#f3f3f3']
                  } // Active gradient or inactive gradient
                  start={{ x: 0, y: 0 }} // Start gradient from top
                  end={{ x: 0, y: 1 }} // End gradient at the bottom
                  style={[s.toggleBtn]} // Apply gradient to active button
                >
                  <TouchableOpacity
                    onPress={() => setSelectedType(opt as any)}
                    style={s.toggleBtnContent}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[s.toggleText, isActive && s.toggleTextActive]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              );
            })}
          </View>

          {/* Collapsible Day Blocks */}
          {grouped.map(({ day, mains, addons }) => {
            const dayTotal =
              mains.reduce((total, item) => total + +item.price * item.qty, 0) +
              addons.reduce((total, item) => total + +item.price * item.qty, 0);
            return (
              <DayBlock key={day} day={day} items={[...mains, ...addons]} />
            );
          })}

          {/* Cart Summary */}
          <View style={s.summaryCard}>
            <View style={s.noticeBox}>
              <Text style={s.noticeText}>
                Minimum order total has to be $29 to process
              </Text>
            </View>

            <View style={s.summaryRow}>
              <Text style={s.label}>Subtotal</Text>
              <Text style={s.value}>
                $
                {grouped
                  .reduce(
                    (total, { mains, addons }) =>
                      total +
                      mains.reduce((s, i) => s + +i.price * i.qty, 0) +
                      addons.reduce((s, i) => s + +i.price * i.qty, 0),
                    0,
                  )
                  .toFixed(2)}
              </Text>
            </View>

            <View style={s.summaryRow}>
              <Text style={s.label}>Shipping Cost (+)</Text>
              <Text style={s.value}>$10.85</Text>
            </View>

            <View style={s.summaryRow}>
              <Text style={s.label}>Discount (−)</Text>
              <Text style={s.value}>$9.00</Text>
            </View>

            <View style={s.divider} />

            <View style={s.summaryRow}>
              <Text style={s.totalLabel}>Total Payable</Text>
              <Text style={s.totalValue}>
                $
                {(
                  grouped.reduce(
                    (total, { mains, addons }) =>
                      total +
                      mains.reduce((s, i) => s + +i.price * i.qty, 0) +
                      addons.reduce((s, i) => s + +i.price * i.qty, 0),
                    0,
                  ) +
                  10.85 -
                  9
                ).toFixed(2)}
              </Text>
            </View>
          </View>

          <LinearGradient
            colors={['#5FBC9B', '#1E9E64']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={s.orderBtn}
          >
            <TouchableOpacity
              style={s.orderBtnContent}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('OrderTrack')}
            >
              <Text style={s.orderText}>
                Place an Order ($$
                {(
                  grouped.reduce(
                    (total, { mains, addons }) =>
                      total +
                      mains.reduce((s, i) => s + +i.price * i.qty, 0) +
                      addons.reduce((s, i) => s + +i.price * i.qty, 0),
                    0,
                  ) +
                  10.85 -
                  9
                ).toFixed(2)}
                )
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bg,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#f7f7f9',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: height * 0.9,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  handle: {
    width: 50,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 10,
  },
  label: { fontSize: 13, color: COLORS.black, marginBottom: 8 },
  toggleWrap: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#f3f3f3',
    padding: 2,
  },
  toggleBtn: {
    flex: 1,
    borderRadius: 10,
  },
  toggleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#333' },
  toggleTextActive: { color: '#fff' },
  dayCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayText: { fontWeight: '600', color: COLORS.black, flex: 1 },
  priceTag: {
    backgroundColor: COLORS.black,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  priceText: { color: COLORS.white, fontWeight: '600', fontSize: 12 },
  arrowBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#d7f3e7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEE',
    marginRight: 10,
  },
  productName: { fontSize: 13, fontWeight: '600', color: COLORS.black },
  productPrice: { fontSize: 12, color: COLORS.gray },
  deleteBtn: {
    width: 30,
    height: 30,
    backgroundColor: '#FFECEC',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  deleteIcon: { fontSize: 14 },
  missingText: {
    color: COLORS.red,
    fontWeight: '600',
    marginTop: 10,
    fontSize: 12,
  },
  noticeBox: {
    backgroundColor: '#ececee',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  noticeText: { fontSize: 14, color: '#000000', textAlign: 'center' },
  summaryCard: {
    backgroundColor: '#fff',
    borderTopEndRadius: 22,
    borderTopStartRadius: 22,
    padding: 14,
    marginTop: 12,
    ...SHADOW,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  value: { fontSize: 13, color: '#111', fontWeight: '700' },
  totalLabel: { fontSize: 14, fontWeight: '700', color: '#111' },
  totalValue: { fontSize: 15, fontWeight: '800', color: '#000' },
  orderBtn: {
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBtnContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  orderText: { color: COLORS.white, fontWeight: '700', fontSize: 18 },
  imgMini: { width: 40, height: 40, borderRadius: 8, resizeMode: 'cover' },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
    elevation: 1,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 1,
  },
});
