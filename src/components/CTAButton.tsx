// CTAButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import Toast from 'react-native-toast-message';

type ToastProps = {
  type?: 'success' | 'error' | 'info';
  title?: string; // maps to text1
  message?: string; // maps to text2
  position?: 'top' | 'bottom';
  visibilityTime?: number; // ms
};

type Props = {
  label: string;
  isDisabled?: boolean;
  onPress: (e: GestureResponderEvent) => void;
  iconName?: string;
  disabled?: boolean;
  toast?: ToastProps; // NEW
};

export default function CTAButton({
  isDisabled,
  label,
  onPress,
  iconName = 'shopping-bag',
  disabled,
  toast,
}: Props) {
  const handlePress = (e: GestureResponderEvent) => {
    onPress?.(e);

    if (toast) {
      if (Toast?.show) {
        Toast.show({
          type: toast.type ?? 'success',
          text1: toast.title ?? label,
          text2: toast.message ?? '',
          position: toast.position ?? 'bottom',
          autoHide: true,
          visibilityTime: toast.visibilityTime ?? 2000,
        });
      }
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
      <Text style={s.txt}>{label}</Text>

      <FontAwesome5
        iconStyle="solid"
        name={iconName}
        size={18}
        color="#000"
        style={{ marginLeft: 8 }}
      />
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
  },
  btnDisabled: { opacity: 0.5 },
  txt: { fontWeight: '800', color: '#000', fontSize: 16 },
});
