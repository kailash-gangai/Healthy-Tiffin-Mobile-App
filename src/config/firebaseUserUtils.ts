// firebaseUserUtils.ts
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providerId: string | null;
  lastLoginAt: string | undefined;
  createdAt: string | undefined;
};

/**
 * Read the currently signed-in Firebase user's profile details.
 * Throws if no user is signed in.
 */
export function getCurrentUserProfile(): UserProfile {
  const user = auth().currentUser as FirebaseAuthTypes.User | null;
  if (!user) throw new Error('No Firebase user is signed in');

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    providerId: user.providerData[0]?.providerId || null,
    lastLoginAt: user.metadata.lastSignInTime,
    createdAt: user.metadata.creationTime,
  };
}
