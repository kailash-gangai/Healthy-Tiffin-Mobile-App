import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken, Settings } from 'react-native-fbsdk-next';
import appleAuth, {
  AppleRequestOperation,
  AppleRequestScope,
} from '@invertase/react-native-apple-authentication';

export function initAuth() {
  GoogleSignin.configure({
    // Web client ID from Firebase > Project settings > Web OAuth client
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  });
  Settings.initializeSDK(); // Facebook
}

/** Google */
export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const { idToken } = await GoogleSignin.signIn();
  const credential = auth.GoogleAuthProvider.credential(idToken);
  return auth().signInWithCredential(credential); // creates user on first sign-in
}

/** Facebook */
export async function signInWithFacebook() {
  const res = await LoginManager.logInWithPermissions([
    'public_profile',
    'email',
  ]);
  if (res.isCancelled) throw new Error('Facebook login cancelled');
  const data = await AccessToken.getCurrentAccessToken();
  if (!data) throw new Error('No Facebook access token');
  const credential = auth.FacebookAuthProvider.credential(data.accessToken);
  return auth().signInWithCredential(credential);
}

/** Apple (iOS) */
export async function signInWithApple() {
  const resp = await appleAuth.performRequest({
    requestedOperation: AppleRequestOperation.LOGIN,
    requestedScopes: [AppleRequestScope.FULL_NAME, AppleRequestScope.EMAIL],
  });
  if (!resp.identityToken) throw new Error('No Apple identity token');
  const credential = auth.AppleAuthProvider.credential(
    resp.identityToken,
    resp.nonce,
  );
  return auth().signInWithCredential(credential);
}

export const signOut = () => auth().signOut();
