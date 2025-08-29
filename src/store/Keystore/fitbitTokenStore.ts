import * as Keychain from 'react-native-keychain';

const SERVICE = 'fitbit.auth';

export type FitbitTokens = {
  accessToken: string;
  accessTokenExpirationDate: string; // ISO
  refreshToken?: string;
  tokenType?: string;
  scope?: string;
};

export async function saveFitbitTokens(t: FitbitTokens) {
  return Keychain.setGenericPassword('fitbit', JSON.stringify(t), {
    service: SERVICE,
    // iOS: locked until first unlock; Android: uses Keystore
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function loadFitbitTokens(): Promise<FitbitTokens | null> {
  const c = await Keychain.getGenericPassword({ service: SERVICE });
  if (!c) return null;
  try {
    return JSON.parse(c.password) as FitbitTokens;
  } catch {
    return null;
  }
}

export async function clearFitbitTokens() {
  await Keychain.resetGenericPassword({ service: SERVICE });
}

export const isExpired = (iso: string, skewMs = 60_000) =>
  Date.now() + skewMs >= new Date(iso).getTime();
