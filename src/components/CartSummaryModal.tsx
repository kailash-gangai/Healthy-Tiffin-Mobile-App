import React, { useRef, useEffect, useState } from 'react';
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
} from 'react-native';
import ArrowUp from '../assets/htf-icon/icon-up.svg';
import ArrowDown from '../assets/htf-icon/icon-down.svg';
import TrashIcon from '../assets/htf-icon/icon-trans.svg';
import { SHADOW } from '../ui/theme';
import LinearGradient from 'react-native-linear-gradient';
const { height } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
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
}: {
    visible: boolean;
    onClose: () => void;
}) {
    const translateY = useRef(new Animated.Value(height)).current;
    const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
    const [selectedType, setSelectedType] = useState<'Steel' | 'ECO'>('Steel');

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

    const DayBlock = ({ day, items }: { day: string; items: string[] }) => {
        const isOpen = expanded[day];
        return (
            <View style={s.dayCard}>
                <TouchableOpacity
                    style={s.dayHeader}
                    activeOpacity={0.8}
                    onPress={() => toggleExpand(day)}
                >
                    <Text style={s.dayText}>{day}</Text>
                    <View style={s.priceTag}>
                        <Text style={s.priceText}>$36.00</Text>
                    </View>
                    <View style={s.arrowBox}>
                        <Text style={{ color: COLORS.green }}>{isOpen ? <ArrowDown height={24} width={24} /> : <ArrowUp height={24} width={24} />}</Text>
                    </View>
                </TouchableOpacity>

                {isOpen && (
                    <View>
                        <View style={s.divider} />
                        {items.map((_, i) => (
                            <View key={i} style={s.itemRow}>
                                <View style={s.thumb} />
                                <View style={{ flex: 1 }}>
                                    <Text style={s.productName}>Product Name</Text>
                                    <Text style={s.productPrice}>$36.00</Text>
                                </View>
                                <TouchableOpacity style={s.deleteBtn}>
                                    <Text style={s.deleteIcon}><TrashIcon height={24} width={24} /></Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };


    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <Pressable style={s.backdrop} onPress={onClose} />
            <Animated.View style={[s.sheet, { transform: [{ translateY }] }]}
            >
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
                                    colors={isActive ? ['#f2c113', '#e2b517'] : ['#f3f3f3', '#f3f3f3']} // Active gradient or inactive gradient
                                    start={{ x: 0, y: 0 }} // Start gradient from top
                                    end={{ x: 0, y: 1 }} // End gradient at the bottom
                                    style={[s.toggleBtn]} // Apply gradient to active button
                                >
                                    <TouchableOpacity
                                        onPress={() => setSelectedType(opt)}    
                                        style={s.toggleBtnContent}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[s.toggleText, isActive && s.toggleTextActive]}>
                                            {opt}
                                        </Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            );
                        })}
                    </View>


                    {/* Collapsible Day Blocks */}
                    <DayBlock day="24 Oct, 2025 | Thursday" items={['1', '2', '3']} />
                    <DayBlock day="25 Oct, 2025 | Friday" items={['1']} />

                    {/* Cart Summary */}
                    <View style={s.summaryCard}>
                        <View style={s.noticeBox}>
                            <Text style={s.noticeText}>
                                Minimum order total has to be $29 to process
                            </Text>
                        </View>

                        <View style={s.summaryRow}>
                            <Text style={s.label}>Subtotal</Text>
                            <Text style={s.value}>$108</Text>
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
                            <Text style={s.totalValue}>$88.15</Text>
                        </View>

                    </View>


                    <LinearGradient
                        colors={['#5FBC9B', '#1E9E64']} // Set gradient colors (green shades)
                        start={{ x: 0, y: 0 }} // Start position of the gradient
                        end={{ x: 0, y: 1 }} // End position of the gradient (horizontal gradient)
                        style={s.orderBtn} // Apply the gradient to the button
                    >
                        {/* Bottom Order Button */}
                        <TouchableOpacity style={s.orderBtnContent} activeOpacity={0.9} onPress={onClose}>
                            <Text style={s.orderText}>Place an Order ($88.15)</Text>
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
    title: { fontSize: 16, fontWeight: '700', color: COLORS.black, marginBottom: 10 },
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

    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333', // Default text color
    },
    toggleTextActive: {
        color: '#fff', // Active text color
    },
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
    note: { fontSize: 12, color: COLORS.gray, marginBottom: 10 },
    summaryCard: {
        backgroundColor: '#fff',
        borderTopEndRadius: 22,
        borderTopStartRadius: 22,
        padding: 14,
        marginTop: 12,
        ...SHADOW
    },
    noticeBox: {
        backgroundColor: '#ececee',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginBottom: 12,
    },
    noticeText: {
        fontSize: 14,
        color: '#000000',
        textAlign: 'center',
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
