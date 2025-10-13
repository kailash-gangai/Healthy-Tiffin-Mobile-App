import { Alert } from 'react-native';
import Share from 'react-native-share';

export const handleShare = async ({ url }: { url: string }) => {
  try {
    await Share.open({
      url,
      title: 'Share Dish',
    });
  } catch (err: any) {
    if (err?.message?.includes('User did not share')) return;
    Alert.alert('Error', 'Share failed.');
  }
};
