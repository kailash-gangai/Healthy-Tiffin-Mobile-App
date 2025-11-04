import React, { useRef, useEffect } from 'react';
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
} from 'react-native';

const { height } = Dimensions.get('window');

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

export default function CartSummaryModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    const translateY = useRef(new Animated.Value(height)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                damping: 20,
            }).start();
        } else {
            Animated.timing(translateY, {
                toValue: height,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <Pressable style={s.backdrop} onPress={onClose} />
            <Animated.View style={[s.sheet, { transform: [{ translateY }] }]}>
                <View style={s.handle} />
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    <Text style={s.title}>Cart Summary</Text>

                    {/* Container Type */}
                    <Text style={s.label}>Select container type</Text>
                    <View style={s.toggleWrap}>
                        <TouchableOpacity style={[s.toggleBtn, s.toggleActive]}>
                            <Text style={[s.toggleText, s.toggleTextActive]}>Steel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.toggleBtn}>
                            <Text style={s.toggleText}>ECO</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Order Day Block */}
                    <View style={s.dayCard}>
                        <View style={s.dayHeader}>
                            <Text style={s.dayText}>24 Oct, 2025 | Thursday</Text>
                            <View style={s.priceTag}>
                                <Text style={s.priceText}>$36.00</Text>
                            </View>
                        </View>

                        {[1, 2, 3].map(i => (
                            <View key={i} style={s.itemRow}>
                                <View style={s.thumb} />
                                <View style={{ flex: 1 }}>
                                    <Text style={s.productName}>Product Name</Text>
                                    <Text style={s.productPrice}>$36.00</Text>
                                </View>
                                <TouchableOpacity style={s.deleteBtn}>
                                    <Text style={s.deleteIcon}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    {/* Another Day */}
                    <View style={s.dayCard}>
                        <View style={s.dayHeader}>
                            <Text style={s.dayText}>25 Oct, 2025 | Friday</Text>
                            <View style={s.priceTag}>
                                <Text style={s.priceText}>$36.00</Text>
                            </View>
                        </View>
                    </View>

                    {/* Summary */}
                    <View style={s.summaryBox}>
                        <Text style={s.note}>Minimum order total has to be $29 to process</Text>
                        <View style={s.summaryRow}>
                            <Text style={s.subLabel}>Subtotal</Text>
                            <Text style={s.subValue}>$108</Text>
                        </View>
                        <View style={s.summaryRow}>
                            <Text style={s.subLabel}>Shipping Cost (+)</Text>
                            <Text style={s.subValue}>$10.85</Text>
                        </View>
                        <View style={s.summaryRow}>
                            <Text style={s.subLabel}>Discount (−)</Text>
                            <Text style={s.subValue}>$9.00</Text>
                        </View>
                        <View style={s.summaryRow}>
                            <Text style={[s.subLabel, { fontWeight: '700' }]}>Total Payable</Text>
                            <Text style={[s.subValue, { fontWeight: '700' }]}>$88.15</Text>
                        </View>
                    </View>
                </ScrollView>

                <TouchableOpacity style={s.orderBtn} activeOpacity={0.9} onPress={onClose}>
                    <Text style={s.orderText}>Place an Order ($88.15)</Text>
                </TouchableOpacity>
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
        backgroundColor: COLORS.white,
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
    label: { fontSize: 13, color: COLORS.gray, marginBottom: 8 },
    toggleWrap: {
        flexDirection: 'row',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
    },
    toggleActive: { backgroundColor: COLORS.yellow },
    toggleText: { fontWeight: '600', color: COLORS.gray },
    toggleTextActive: { color: COLORS.white },
    dayCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dayText: { fontWeight: '600', color: COLORS.black },
    priceTag: {
        backgroundColor: COLORS.black,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    priceText: { color: COLORS.white, fontWeight: '600', fontSize: 12 },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.border,
    },
    thumb: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEE', marginRight: 10 },
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
    summaryBox: {
        backgroundColor: '#F9F9F9',
        borderRadius: 14,
        padding: 14,
        marginTop: 12,
    },
    note: {
        fontSize: 12,
        color: COLORS.gray,
        marginBottom: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    subLabel: { fontSize: 13, color: COLORS.gray },
    subValue: { fontSize: 13, color: COLORS.black },
    orderBtn: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.green,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    orderText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
