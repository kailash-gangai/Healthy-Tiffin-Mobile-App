import Toast from 'react-native-toast-message';
export function showToastSuccess(message?: string) {
  Toast.show({
    type: 'success',
    text1: 'Success',
    text2: message,
    position: 'bottom',
    visibilityTime: 3000, // 3s
    autoHide: true,
    text1Style: { fontSize: 16, fontWeight: 'bold' },
    text2Style: {
      fontSize: 14,
      fontWeight: 'normal',
      flexWrap: 'wrap',
    },
  });
}
export function showToastError(message?: string) {
  Toast.show({
    type: 'error',
    text1: 'Error',
    text2: message,
    position: 'bottom',
    visibilityTime: 3000, // 3s
    autoHide: true,
    text1Style: { fontSize: 16, fontWeight: 'bold' },
    text2Style: {
      fontSize: 14,
      fontWeight: 'normal',
      flexWrap: 'wrap',
    },
  });
}
export function showToastInfo(message?: string) {
  Toast.show({
    type: 'info',
    text1: 'Info',
    text2: message,
    position: 'bottom',
    visibilityTime: 3000,
    autoHide: true,
    text1Style: { fontSize: 16, fontWeight: 'bold' },
    text2Style: {
      fontSize: 14,
      fontWeight: 'normal',
      flexWrap: 'wrap',
    },
  });
}
