// components/SocialAuthButtons.tsx
import React from 'react';
import {
      View,
      TouchableOpacity,
      StyleSheet,
      GestureResponderEvent,
      Alert,
      Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import Facebook from '../assets/htf-icon/fb.svg';
import Insta from '../assets/htf-icon/insta.svg';
import Google from '../assets/htf-icon/google.svg';
import Apple from '../assets/htf-icon/apple.svg';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import { checkCustomerTokens, saveCustomerTokens } from '../store/Keystore/customerDetailsStore';
import appleAuth from '@invertase/react-native-apple-authentication';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../screens/navigation/types';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slice/userSlice';
import { AccessToken, AuthenticationToken, GraphRequest, GraphRequestManager, LoginManager } from 'react-native-fbsdk-next';
import { authorize } from 'react-native-app-auth';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type Props = {
      navigation: NavigationProp;
};
GoogleSignin.configure({
      webClientId: "176148506772-qg5spoepvr0cm5tdf965peihdq5bla54.apps.googleusercontent.com",
      iosClientId: "176148506772-h8u6uj4a62eak00r9n027eghutf9jbc0.apps.googleusercontent.com",
      scopes: ['email', 'profile'],
      offlineAccess: true,
});

// const config = {
//       clientId: 'YOUR_INSTAGRAM_CLIENT_ID',  // Replace with your Instagram client ID
//       clientSecret: 'YOUR_INSTAGRAM_CLIENT_SECRET',  // Replace with your Instagram client secret
//       redirectUrl: 'myapp://oauth2redirect', // Replace with your redirect URI
//       scopes: ['user_profile', 'user_media'], // Permissions you need
//       serviceConfiguration: {
//             authorizationEndpoint: 'https://api.instagram.com/oauth/authorize',
//             tokenEndpoint: 'https://api.instagram.com/oauth/access_token',
//             revocationEndpoint: 'https://api.instagram.com/oauth/revoke',
//       },
// };
const SocialAuthButtons: React.FC<Props> = ({ navigation }) => {
      const dispatch = useDispatch();

      const handleGoogleLogin = async () => {
            try {
                  const a = await GoogleSignin.hasPlayServices();
                  console.log(a, "aa")
                  const so = await GoogleSignin.signOut();
                  console.log(so, "singout")
                  const signInResult = await GoogleSignin.signIn();
                  console.log('signInResult', signInResult);
                  const user = signInResult?.data?.user;
                  const payload = {
                        email: user?.email,
                        first_name: user?.givenName,
                        last_name: user?.familyName,
                  };
                  handelauth(payload, navigation, dispatch);
            } catch (error) {
                  console.log('error: ', JSON.stringify(error));
            }
      };

      const handleAppleLogin = async () => {
            try {
                  const response = await appleAuth.performRequest({
                        requestedOperation: appleAuth.Operation.LOGIN,
                        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
                  });
                  const { user, email, fullName, identityToken } = response;
                  if (!identityToken) {
                        throw new Error('No identity token returned');
                  }
                  let payload = {};
                  // CASE 1 — NEW USER (fullName + email only appear once)
                  if (email && fullName) {
                        const givenName = fullName?.givenName || '';
                        const familyName = fullName?.familyName || '';
                        payload = {
                              email: email,
                              first_name: givenName,
                              last_name: familyName,
                        };
                        // Create or update on backend
                        const createRes = await fetch('https://healthytiffin.app/api/customer/createupdate', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                    email: email,
                                    first_name: givenName,
                                    last_name: familyName,
                                    platform: 'apple',
                                    platform_id: user,
                              }),
                        });
                        const createData = await createRes.json();
                  } else {
                        const showRes = await fetch(
                              `https://healthytiffin.app/api/customer/show?platform=apple&platform_id=${user}`
                        );
                        const userData = await showRes.json();
                        payload = {
                              email: userData.email,
                              first_name: userData.first_name,
                              last_name: userData.last_name,
                        };
                  }

                  // Now authentication is complete
                  handelauth(payload, navigation, dispatch);

            } catch (error) {
                  Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred during Apple Sign-In.');
            }
      };

      const handleFacebookLogin = async () => {
            try {
                  // Initiate Facebook login
                  const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

                  // Check if the user cancelled the login process
                  if (result.isCancelled) {
                        throw 'User cancelled the login process';
                  }

                  // Once signed in, get the user's AccessToken
                  const data = await AccessToken.getCurrentAccessToken();
                  console.log('Facebook access token:', data);

                  if (!data) {
                        throw 'Something went wrong obtaining access token';
                  }

                  // Define the Graph request to get user details (name and email)
                  const infoRequest = new GraphRequest(
                        '/me',
                        {
                              accessToken: data.accessToken,
                              parameters: {
                                    fields: {
                                          string: 'id,name,email',  // Requesting name and email
                                    },
                              },
                        },
                        (error, result: { first_name?: string; last_name?: string; email?: string } | undefined) => {
                              if (error) {
                                    console.log('Error fetching Facebook profile:', error);
                                    Alert.alert('Error', 'Failed to fetch Facebook profile information.');
                              } else if (result) {
                                    console.log('Facebook profile details:', result);
                                    // You can now access name and email from the result
                                    const { first_name, last_name, email } = result;
                                    const payload = {
                                          email: email,
                                          first_name: first_name,
                                          last_name: last_name,
                                    };
                                    console.log('payload', payload);
                                    handelauth(payload, navigation, dispatch);
                                    // Use the name and email as needed in your app
                              }
                        }
                  );

                  // Start the Graph request
                  new GraphRequestManager().addRequest(infoRequest).start();
            } catch (error) {
                  console.log('Facebook login error: ', error);
            }
      }
      // const handleInstaLogin = async () => {
      //       try {
      //             // Authenticate with Instagram
      //             const authState = await authorize(config);

      //             // Get user info using the access token
      //             const response = await fetch(
      //                   `https://graph.instagram.com/me?fields=id,username,email&access_token=${authState.accessToken}`
      //             );
      //             const data = await response.json();

      //             console.log('User data from Instagram:', data);


      //       } catch (error) {
      //             console.error('Instagram login failed:', error);
      //       }
      // }
      return (
            <View style={styles.row}>

                  {/* Facebook */}
                  <Circle
                        bg="#1877F2"
                        onPress={handleFacebookLogin}
                        children={<Facebook width={30} height={30} />}
                  />
                  {/* Instagram */}
                  {/* <TouchableOpacity activeOpacity={0.85} onPress={handleInstaLogin}>
                        <LinearGradient
                              colors={[
                                    '#405DE6',
                                    '#5851DB',
                                    '#833AB4',
                                    '#C13584',
                                    '#E1306C',
                                    '#FD1D1D',
                                    '#F56040',
                                    '#FCAF45',
                                    '#FFDC80',
                              ]}
                              style={styles.circle}
                        >
                              <Insta height={30} width={30} />
                        </LinearGradient>
                  </TouchableOpacity> */}

                  {/* Google */}
                  <Circle
                        bg="#EA4335"
                        onPress={handleGoogleLogin}
                        children={<Google width={30} height={40} />}
                  />

                  {/* Apple */}
                  <Circle
                        bg="#000"
                        onPress={handleAppleLogin}
                        children={<Apple width={30} height={30} />}
                  />

            </View>
      );
};

const Circle = ({
      children,
      bg,
      onPress,
}: {
      children: React.ReactNode;
      bg: string;
      onPress?: (e: GestureResponderEvent) => void;
}) => (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
            <View style={[styles.circle, { backgroundColor: bg }]}>{children}</View>
      </TouchableOpacity>
);

const styles = StyleSheet.create({
      row: {
            marginTop: 16,
            flexDirection: 'row',
            justifyContent: 'center',
            paddingHorizontal: 16,
            gap: 16,
      },
      circle: {
            width: 60,
            height: 60,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: 3,
      },
});

const handelauth = async (payload: any, navigation: NavigationProp, dispatch: any): Promise<void> => {

      const baseURL = 'https://healthytiffin.app/api/shopify/multipass-token';
      const { data } = await axios.post(baseURL, payload, {
            headers: {
                  'Content-Type': 'application/json',
            },
      });
      const customerToken = data?.customerAccessToken;
      const tokenExpire = data?.expiresAt;
      saveCustomerTokens({ customerToken, tokenExpire });
      let customerdetails = checkCustomerTokens();
      customerdetails.then(async result => {
            if (result) {
                  dispatch(setUser(result));
                  navigation.navigate('Home');
            }
      });
}
export default SocialAuthButtons;
