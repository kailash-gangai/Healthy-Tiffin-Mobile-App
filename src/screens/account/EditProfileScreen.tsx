import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  Alert,
  ActionSheetIOS,
  Platform,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { COLORS } from '../../ui/theme';
import FormInput from '../../components/FormInput';
import LinearGradient from 'react-native-linear-gradient';
import CameraIcon from '../../assets/htf-icon/icon-camera.svg';
import ContinueIcon from '../../assets/htf-icon/icon-continue.svg';
import {
  launchImageLibrary,
  launchCamera,
  ImageLibraryOptions,
  CameraOptions,
} from 'react-native-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  customerMetafieldUpdate,
  customerUpsert,
} from '../../shopify/mutation/CustomerAuth';
import { setUser } from '../../store/slice/userSlice';
import { checkCustomerTokens } from '../../store/Keystore/customerDetailsStore';
import {
  showToastError,
  showToastSuccess,
} from '../../config/ShowToastMessages';
import { uploadImageDirectFromRN } from '../../shopify/mutation/fileUploadShopify';
import { previewImage } from '../../shopify/mutation/FileUpload';

type AboutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type Props = { navigation: AboutScreenNavigationProp };

export default function EditProfile({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>();
  const [name, setName] = useState<string | undefined>(user?.name || undefined);
  const [email, setEmail] = useState<string | undefined>(
    user?.email || undefined,
  );
  const [phone, setPhone] = useState<string | undefined>(
    user?.phone || undefined,
  );

  const openGallery = async () => {
    const opts: ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 1,
      includeBase64: false,
      quality: 0.9,
    };
    const res = await launchImageLibrary(opts);
    setFile(res);
    if (res.didCancel) return;
    if (res.errorCode)
      return Alert.alert('Error', res.errorMessage || res.errorCode);
    const uri = res.assets?.[0]?.uri;
    if (uri) setAvatar(uri);
  };

  const openCamera = async () => {
    const opts: CameraOptions = {
      mediaType: 'photo',
      cameraType: 'front',
      saveToPhotos: false,
      includeBase64: false,
      quality: 0.9,
    };
    const res = await launchCamera(opts);
    if (res.didCancel) return;
    if (res.errorCode)
      return Alert.alert('Error', res.errorMessage || res.errorCode);
    const uri = res.assets?.[0]?.uri;
    if (uri) setAvatar(uri);
  };

  const pickImage = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Camera', 'Gallery'], cancelButtonIndex: 0 },
        idx => {
          if (idx === 1) openCamera();
          if (idx === 2) openGallery();
        },
      );
    } else {
      Alert.alert('Profile photo', 'Choose source', [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const media = async (u: any) => {
    const medias = await previewImage(u.avatar);
    setAvatar(medias?.nodes?.[0]?.preview?.image?.url);
  };

  useEffect(() => {
    media(user);
  }, []);

  const onSubmit = async () => {
    setLoading(true);

    let [firstName, lastName] = name?.split(' ') ?? [];
    let userData = { firstName, lastName, email, phone };
    let imageUploadSuccess = false;

    // Upload new image if selected
    const a = file?.assets?.[0] ?? null;
    if (a && a.uri) {
      try {
        const { fileId } = await uploadImageDirectFromRN(
          {
            uri: a.uri,
            name: a.fileName ?? 'upload.jpg',
            type: a.type ?? 'image/jpeg',
          },
          user.avatar ?? '',
        );

        // Update metafield with new file ID
        await customerMetafieldUpdate(
          [{ key: 'image', value: fileId, type: 'file_reference' }],
          user?.id ?? '',
        );

        // Update local state immediately with the new image
        setAvatar(a.uri);
        imageUploadSuccess = true;
      } catch (error) {
        console.error('Image upload failed:', error);
        showToastError(
          'Image upload failed. Profile info saved without new image.',
        );
      }
    }

    try {
      const res = await customerUpsert(userData, user?.customerToken || '');
      if (res?.customerUpdate?.customer?.id) {
        const details = await checkCustomerTokens();
        if (details) {
          dispatch(setUser(details));

          // Only refresh media if we didn't already set the local avatar
          if (!imageUploadSuccess) {
            media(details);
          }
        }
        showToastSuccess('Profile updated successfully.');

        // Navigate back with updated data
      }
    } catch (error) {
      showToastError(
        error instanceof Error ? error.message : 'An error occurred.',
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Edit Profile" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Remove KeyboardAvoidingView to prevent over-lifting. */}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          contentInset={{ bottom: insets.bottom }}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrap}>
              <Image
                source={
                  avatar ? { uri: avatar } : require('../../assets/LOGO.png')
                }
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
                <CameraIcon width={24} height={24} />
              </TouchableOpacity>
            </View>
          </View>

          <FormInput
            label="Name"
            icon="person"
            placeholder="Enter name"
            value={name}
            onChangeText={setName}
            returnKeyType="next"
          />

          <FormInput
            label="Email Address"
            icon="email"
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            returnKeyType="next"
          />

          <FormInput
            label="Phone Number"
            icon="phone"
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            autoCapitalize="none"
            value={phone}
            onChangeText={setPhone}
            returnKeyType="done"
          />

          <TouchableOpacity
            activeOpacity={0.9}
            disabled={loading}
            style={styles.ctaBtn}
            onPress={onSubmit}
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={[COLORS.green, COLORS.greenLight]}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>Save Details</Text>
              {loading ? (
                <ActivityIndicator
                  style={{ marginLeft: 8 }}
                  size="small"
                  color={COLORS.white}
                />
              ) : (
                <ContinueIcon
                  height={24}
                  width={24}
                  style={{ marginLeft: 8 }}
                />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },

  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  ctaBtn: { marginTop: 18 },
  ctaGradient: {
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  ctaText: {
    color: COLORS.white,
    fontWeight: '800',
    letterSpacing: 0.2,
    fontSize: 16,
  },

  avatarWrap: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: COLORS.oranger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { width: 124, height: 124, borderRadius: 62, resizeMode: 'cover' },
  cameraBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.oranger,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/*
Android manifest:
<activity
  android:name=".MainActivity"
  android:windowSoftInputMode="adjustResize" />
*/
