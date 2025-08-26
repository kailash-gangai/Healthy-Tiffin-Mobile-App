import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinkRow from '../../components/LinkRow';
import AppHeader from '../../components/AppHeader';
import FormInput from '../../components/FormInput';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../ui/theme';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type AboutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
      navigation: AboutScreenNavigationProp;
};
export default function ChangePassword({ navigation }: Props) {
      return (

            <SafeAreaView style={styles.safe}>
                  <AppHeader title="Change Password" onBack={() => navigation.goBack()} />
                  <View style={styles.wrap}>
                        <FormInput label="Current Password"
                              icon="unlocked"
                              placeholder="Enter password"
                              secure
                              // value={pass}
                              // onChangeText={setPass}
                              returnKeyType="next" />
                        <FormInput label="New Password"
                              icon="unlocked"
                              placeholder="Enter password"
                              secure
                              // value={pass}
                              // onChangeText={setPass}
                              returnKeyType="next" />
                        <FormInput label="Confirm New Password"
                              icon="unlocked"
                              placeholder="Enter password"
                              secure
                              // value={pass}
                              // onChangeText={setPass}
                              returnKeyType="next" />
                        <TouchableOpacity activeOpacity={0.9} style={styles.ctaBtn} onPress={() => {
                              console.log('Sign Up');
                        }}>
                              <LinearGradient
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    colors={[COLORS.green, COLORS.greenLight]}
                                    style={styles.ctaGradient}
                              >
                                    <Text style={styles.ctaText}>Save</Text>
                                    <FontAwesome5 iconStyle='solid' name="sign-in-alt" size={18} color={COLORS.white} style={{ marginLeft: 8 }} />
                              </LinearGradient>
                        </TouchableOpacity>

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
