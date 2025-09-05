import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Image, Alert, ActionSheetIOS, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { COLORS, SPACING } from '../../ui/theme';
import FormInput from '../../components/FormInput';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import { launchImageLibrary, launchCamera, ImageLibraryOptions, CameraOptions } from "react-native-image-picker";
import { readFile } from 'react-native-fs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getCustomerDetails } from '../../shopify/query/CustomerQuery';
import { customerUpsert } from '../../shopify/mutation/CustomerAuth';
import { setUser } from '../../store/slice/userSlice';
import { checkCustomerTokens } from '../../store/Keystore/customerDetailsStore';
import { createFile, previewImage, stagedUploadsCreate } from '../../shopify/mutation/FileUpload';
import { STORE_ADMIN_API_KEY, STORE_ADMIN_API_URL } from '../../shopify/ShopifyConfig';
import { showToastError, showToastSuccess } from '../../config/ShowToastMessages';

type AboutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
      navigation: AboutScreenNavigationProp;
};
export default function EditProfile({ navigation }: Props) {
      const dispatch = useDispatch();
      const user = useSelector((state: RootState) => state.user);
      const [file, setFile] = useState<any>(null);
      const [avatar, setAvatar] = useState<string | undefined>(user?.avatar || undefined);
      const [name, setName] = useState<string | undefined>(user?.name || undefined);
      const [email, setEmail] = useState<string | undefined>(user?.email || undefined);
      const [phone, setPhone] = useState<string | undefined>(user?.phone || undefined);
      const openGallery = async () => {

            const opts: ImageLibraryOptions = {
                  mediaType: "photo",
                  selectionLimit: 1,
                  includeBase64: false,
                  quality: 0.9,
            };
            const res = await launchImageLibrary(opts);
            setFile(res);
            if (res.didCancel) return;
            console.log('res', res);
            if (res.errorCode) return Alert.alert("Error", res.errorMessage || res.errorCode);
            const uri = res.assets?.[0]?.uri;
            if (uri) setAvatar(uri);

      };

      const openCamera = async () => {
            const opts: CameraOptions = {
                  mediaType: "photo",
                  cameraType: "front",
                  saveToPhotos: false,
                  includeBase64: false,
                  quality: 0.9,
            };
            const res = await launchCamera(opts);
            if (res.didCancel) return;
            if (res.errorCode) return Alert.alert("Error", res.errorMessage || res.errorCode);
            const uri = res.assets?.[0]?.uri;
            if (uri) setAvatar(uri);
      };


      const pickImage = () => {
            if (Platform.OS === "ios") {
                  ActionSheetIOS.showActionSheetWithOptions(
                        {
                              options: ["Cancel", "Camera", "Gallery"],
                              cancelButtonIndex: 0,
                        },
                        (buttonIndex) => {
                              if (buttonIndex === 1) openCamera();
                              if (buttonIndex === 2) openGallery();
                        }
                  );
            } else {
                  // Android fallback (Alert is OK when component is active)
                  Alert.alert("Profile photo", "Choose source", [
                        { text: "Camera", onPress: openCamera },
                        { text: "Gallery", onPress: openGallery },
                        { text: "Cancel", style: "cancel" },
                  ]);
            }
      };


      const onSubmit = async () => {
            let [firstName, lastName] = (name?.split(' ') ?? []);
            let userData = {
                  firstName: firstName,
                  lastName: lastName,
                  email: email,
                  phone: phone
            }

            if (avatar) {
                  const base64Image = await readFile(avatar, 'base64');
                  const asset = file.assets?.[0];
                  const staged = await stagedUploadsCreate({
                        fileName: asset.fileName ?? 'upload.jpg',
                        mimeType: asset.type ?? 'image/jpeg',
                        fileSize: asset.fileSize ?? 0,
                  });
                  const target = staged.stagedUploadsCreate.stagedTargets[0];
                  const { url, parameters, resourceUrl } = target;

                  // 3) POST the form to S3 — NO Shopify headers
                  // Important: keep `file://` prefix on iOS for RN FormData
                  const fileUri = asset.uri;
                  const form = new FormData();

                  // append all returned fields first, exactly as given
                  parameters.forEach(p => form.append(p.name, p.value));
                  form.append('file', { uri: fileUri, type: asset.type, name } as any);

                  // append file last, with correct type and name
                  // form.append('file', {
                  //       uri: fileUri,
                  //       type: asset.type ?? 'image/jpeg',
                  //       name: asset.fileName ?? 'upload.jpg',
                  // } as any);

                  try {
                        console.log('url', url);
                        const response = await fetch(url, {
                              method: 'PUT',
                              body: form
                        });
                        console.log('response', response);
                        if (!response.ok) {
                              const errorText = await response.text();
                              throw new Error(`Staging upload failed: ${response.status} - ${errorText}`);
                        }

                        setTimeout(async () => {
                              const createfile = await createFile(resourceUrl);
                              let mediaId = createfile.fileCreate.files[0].id;
                              console.log('createfile', createfile);
                              setTimeout(async () => {
                                    const res = await previewImage(mediaId);
                                    console.log('previewImage', res);
                              }, 10000);
                        }, 10000);
                        //step 3


                        //WAIT FOR 5 SECOND 


                  } catch (error) {
                        showToastError(error instanceof Error ? error.message : "An error occurred.");
                  }

            }
            // return;
            try {
                  const res = await customerUpsert(userData, user?.customerToken || '');
                  if (res?.customerUpdate?.customer?.id) {
                        let customerdetails = checkCustomerTokens();
                        customerdetails.then((result) => {
                              if (result) {
                                    dispatch(setUser(result));
                              }
                        })

                        showToastSuccess('Profile updated successfully.');
                  }
            } catch (error) {
                  showToastError(error instanceof Error ? error.message : "An error occurred.");
            }
      }

      return (

            <SafeAreaView style={styles.safe}>
                  <AppHeader title="Edit Profile" onBack={() => navigation.goBack()} />
                  <View style={styles.wrap}>
                        <View style={styles.avatarContainer}>
                              <View style={styles.avatarWrap}>
                                    <Image
                                          source={avatar ? { uri: avatar } : require("../../assets/LOGO.png")}
                                          style={styles.avatar}
                                    />
                                    <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
                                          <FontAwesome5 iconStyle='solid' name="camera" size={16} color="#000" />
                                    </TouchableOpacity>
                              </View>
                        </View>
                        <FormInput label="Name"
                              icon="person"
                              placeholder="Enter name"
                              value={name}
                              onChangeText={setName}
                              returnKeyType="next" />
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

                        <TouchableOpacity activeOpacity={0.9} style={styles.ctaBtn} onPress={() => {
                              onSubmit();
                        }}>
                              <LinearGradient
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    colors={[COLORS.green, COLORS.greenLight]}
                                    style={styles.ctaGradient}
                              >
                                    <Text style={styles.ctaText}>Save Details</Text>
                                    <FontAwesome5 iconStyle='solid' name="sign-in-alt" size={18} color={COLORS.white} style={{ marginLeft: 8 }} />
                              </LinearGradient>
                        </TouchableOpacity>

                  </View>
            </SafeAreaView >

      );
}

const styles = StyleSheet.create({
      safe: { flex: 1, backgroundColor: '#FFFFFF' },
      wrap: { padding: 16, textAlign: "center", },
      avatarContainer: { alignItems: "center", justifyContent: "center", marginBottom: 20 },
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
      ctaText: { color: COLORS.white, fontWeight: '800', letterSpacing: 0.2, fontSize: 16 },
      avatarWrap: {
            width: 130,
            height: 130,
            borderRadius: 65,
            borderWidth: 3,
            borderColor: COLORS.oranger,
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
      },
      avatar: {
            width: 124,
            height: 124,
            borderRadius: 62,
            resizeMode: "cover",
      },
      cameraBtn: {
            position: "absolute",
            bottom: 4,
            right: 4,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: COLORS.oranger,
            alignItems: "center",
            justifyContent: "center",
      },

});
