// CTAButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
  View,
} from 'react-native';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import Toast from 'react-native-toast-message';
import CartIcon from '../assets/htf-icon/icon-cart.svg';
type ToastProps = {
  type?: 'success' | 'error' | 'info';
  title?: string;
  message?: string;
  position?: 'top' | 'bottom';
  visibilityTime?: number;
};

type Props = {
  label: any; // unchanged
  day?: string; // NEW: single day
  isDisabled?: boolean;
  onPress: (e: GestureResponderEvent) => void;
  iconName?: string;
  disabled?: boolean;
  toast?: ToastProps;
};

const compact = (arr: string[] = [], keep = 3) =>
  arr.length <= keep
    ? arr
        .map(t => t?.slice(0, 1).toUpperCase() + t?.slice(1).toLowerCase())
        .join(', ')
    : `${arr
        .slice(0, keep)
        .map(t => t?.slice(0, 1).toUpperCase() + t?.slice(1).toLowerCase())
        .join(', ')} +${arr.length - keep} more`;

export default function CTAButton({
  isDisabled,
  label,
  day,
  onPress,
  iconName = 'shopping-bag',
  disabled,
  toast,
}: Props) {
  const lbl = typeof label === 'string' ? { message: label } : label || {};
  const ok: boolean = lbl?.result?.ok ?? lbl?.ok ?? true;
  const missing: string[] = lbl?.result?.missing ?? lbl?.missing ?? [];
  const primary = ok
    ? lbl?.message?.trim() || 'Add to cart'
    : label.message || 'Add to cart';

  const secondary = !ok && missing?.length ? compact(missing) : '';

  const handlePress = (e: GestureResponderEvent) => {
    onPress?.(e);
    if (toast && Toast?.show) {
      Toast.show({
        type: toast.type ?? 'success',
        text1:
          toast.title ??
          (typeof label === 'string' ? label : label?.message) ??
          '',
        text2: toast.message ?? '',
        position: toast.position ?? 'bottom',
        autoHide: true,
        visibilityTime: toast.visibilityTime ?? 2000,
      });
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      disabled={isDisabled}
      style={[s.btn, disabled && s.btnDisabled]}
      accessibilityRole="button"
    >
      <View style={s.row}>
        {/* left spacer keeps text centered despite right icon */}
        <View style={s.iconSpacer} />

        <View style={s.textWrap}>
          <Text style={s.txt} numberOfLines={1} ellipsizeMode="tail">
            {primary}
          </Text>
          {!!secondary && (
            <Text style={s.subtxt} numberOfLines={1} ellipsizeMode="tail">
              {secondary}
            </Text>
          )}
        </View>
        <CartIcon width={24} height={24} />
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#FFC107',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconSpacer: { width: 26 }, // ≈ size(18) + margin(8)
  icon: { marginLeft: 8, width: 18 },
  textWrap: { flex: 1, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  txt: { fontWeight: '800', color: '#000', fontSize: 16 },
  subtxt: { fontWeight: '600', color: '#000', fontSize: 12, marginTop: 2 },
});
