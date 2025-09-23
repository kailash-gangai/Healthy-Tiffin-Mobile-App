import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinkRow from '../../components/LinkRow';
import AppHeader from '../../components/AppHeader';
import FormInput from '../../components/FormInput';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../ui/theme';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { customerUpsert, loginCustomer } from '../../shopify/mutation/CustomerAuth';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { checkCustomerTokens, saveCustomerTokens } from '../../store/Keystore/customerDetailsStore';
import { setUser } from '../../store/slice/userSlice';
import { showToastError, showToastSuccess } from '../../config/ShowToastMessages';
import PasswordIcon from '../../assets/htf-icon/icon-passwoed.svg';
import ContinueIcon from '../../assets/htf-icon/icon-continue.svg';

type AboutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
      navigation: AboutScreenNavigationProp;
};
export default function ChangePassword({ navigation }: Props) {
      const dispatch = useDispatch();
      const user = useSelector((state: RootState) => state.user);
      const [currentPass, setCurrentPass] = React.useState('');
      const [pass, setPass] = React.useState('');
      const [confirmPass, setConfirmPass] = React.useState('');
      const [errors, setErrors] = useState<any>({});

      const onSubmit = async () => {
            setErrors({});
            if (!currentPass || !pass || !confirmPass) {
                  setErrors({
                        pass: pass ? '' : 'is required',
                        confirmPass: confirmPass ? '' : 'is required',
                        currentPass: currentPass ? '' : 'is required'
                  });
            }
            if (pass !== confirmPass) {
                  setErrors({ pass: 'Password does not match' });
            }

            try {

                  const response = await customerUpsert({ password: pass }, user.customerToken || '');

                  if (response?.customerUpdate?.customerAccessToken?.accessToken) {
                        const customerToken = response.customerUpdate.customerAccessToken.accessToken;
                        const tokenExpire = response.customerUpdate.customerAccessToken.expiresAt;
                        saveCustomerTokens({ customerToken, tokenExpire });
                        let customerdetails = checkCustomerTokens();
                        customerdetails.then(async (result) => {

                              if (result) {
                                    dispatch(setUser(result));
                              }
                        });

                        showToastSuccess('Password changed successfully.');
                  }

            } catch (error) {
                  showToastError(error instanceof Error ? error.message : "An error occurred.");
            }

      }
      return (

            <SafeAreaView style={styles.safe}>
                  <AppHeader title="Change Password" onBack={() => navigation.goBack()} />
                  <View style={styles.wrap}>
                        <FormInput label="Current Password"
                              icon={<PasswordIcon width={24} height={24} />}
                              placeholder="Enter password"
                              secure
                              value={currentPass}
                              onChangeText={setCurrentPass}
                              returnKeyType="next" />
                        {errors.currentPass && (
                              <Text style={{ color: COLORS.red, fontSize: 14, marginLeft: 12 }}>{errors.currentPass}</Text>
                        )}

                        <FormInput label="New Password"
                              icon={<PasswordIcon width={24} height={24} />}
                              placeholder="Enter password"
                              secure
                              value={pass}
                              onChangeText={setPass}
                              returnKeyType="next" />
                        {errors.pass && (
                              <Text style={{ color: COLORS.red, fontSize: 14, marginLeft: 12 }}>{errors.pass}</Text>
                        )}

                        <FormInput label="Confirm New Password"
                              icon={<PasswordIcon width={24} height={24} />}
                              placeholder="Enter password"
                              secure
                              value={confirmPass}
                              onChangeText={setConfirmPass}
                              returnKeyType="next" />
                        {errors.confirmPass && (
                              <Text style={{ color: COLORS.red, fontSize: 14, marginLeft: 12 }}>{errors.confirmPass}</Text>
                        )}
                        <Pressable
                              onPress={onSubmit}
                              style={({ pressed }) => [
                                    styles.ctaBtn,
                                    pressed && { opacity: 0.5 }
                              ]}
                        >
                              <LinearGradient
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    colors={[COLORS.green, COLORS.greenLight]}
                                    style={styles.ctaGradient}
                              >
                                    <Text style={styles.ctaText}>Save</Text>
                                    <ContinueIcon width={24} height={24} style={{ marginLeft: 8 }} />
                              </LinearGradient>
                        </Pressable>


                  </View>
            </SafeAreaView>

      );
}

const styles = StyleSheet.create({
      safe: { flex: 1, backgroundColor: '#FFFFFF' },
      wrap: { padding: 16 },

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

});
