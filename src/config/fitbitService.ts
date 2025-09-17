import { authorize, refresh, revoke } from 'react-native-app-auth';
import { FITBIT_CONFIG, FITBIT_API_URL } from './fitbitConfig';
import { getDataFromApi, postDataToApi } from './config';
import {
  saveFitbitTokens,
  loadFitbitTokens,
  clearFitbitTokens,
  isExpired,
  FitbitTokens,
} from '../store/Keystore/fitbitTokenStore';

export async function connectFitbit(): Promise<FitbitTokens> {
  console.log('connectFitbit', FITBIT_CONFIG);
  const res = await authorize(FITBIT_CONFIG);
  console.log('connectFitbit res', res);
  await saveFitbitTokens(res);
  return res;
}

export async function getValidTokens(): Promise<FitbitTokens | null> {
  const t = await loadFitbitTokens();

  if (!t) return null;
  if (t.refreshToken && isExpired(t.accessTokenExpirationDate)) {
    const r = await refresh(FITBIT_CONFIG, { refreshToken: t.refreshToken });
    const merged: FitbitTokens = {
      accessToken: r.accessToken,
      accessTokenExpirationDate: r.accessTokenExpirationDate,
      refreshToken: r.refreshToken ?? t.refreshToken,
      tokenType: r.tokenType,
      scope: t.scope,
    };
    await saveFitbitTokens(merged);
    return merged;
  }
  return t;
}

export async function disconnectFitbit(currentAccessToken?: string) {
  try {
    if (currentAccessToken) {
      await revoke(FITBIT_CONFIG, {
        tokenToRevoke: currentAccessToken,
        sendClientId: true,
      });
    }
  } finally {
    await clearFitbitTokens();
  }
}

export async function getfitBitData(
  accessToken: string,
  date: string,
): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  date = date || today;
  let url = FITBIT_API_URL + `activities/date/${date}.json`;
  return await getDataFromApi(url, accessToken);
}

type Period = 'daily' | 'weekly';
export async function setActivityGoal(
  accessToken: string,
  period: Period,
  type: string,
  value: number,
) {
  const body = new URLSearchParams({ type, value: String(value) });
  const url =
    FITBIT_API_URL + `activities/goals/${period}.json` + `?${body.toString()}`;

  return await postDataToApi(url, accessToken);
}

export async function getfitBitWeight(
  accessToken: string,
  date: string,
): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  date = date || today;
  let url = FITBIT_API_URL + `body/log/weight/goal.json`;
  return await getDataFromApi(url, accessToken);
}

export async function setfitBitWeight(
  accessToken: string,
  date: string,
  startWeight: number,
  weight: number,
): Promise<number> {
  let url =
    FITBIT_API_URL +
    `body/log/weight/goal.json` +
    `?startDate=${date}&startWeight=${startWeight}&weight=${weight}`;
  return await postDataToApi(url, accessToken);
}

export async function getfitBitWater(accessToken: string): Promise<number> {
  let url = FITBIT_API_URL + `foods/log/water/goal.json`;
  return await getDataFromApi(url, accessToken);
}

export async function setfitBitWaterGole(
  accessToken: string,
  target: number,
): Promise<number> {
  let url = FITBIT_API_URL + `foods/log/water/goal.json` + `?target=${target}`;
  return await postDataToApi(url, accessToken);
}
export async function setfitBitWaterLog(
  accessToken: string,
  date: string,
  target: number,
): Promise<number> {
  date = date || new Date().toISOString().slice(0, 10);
  let url =
    FITBIT_API_URL +
    `foods/log/water.json` +
    `?date=${date}&amount=${target}&unit=cup`;
  return await postDataToApi(url, accessToken);
}

export async function getfitBitWaterLog(
  accessToken: string,
  date: string,
): Promise<number> {
  date = date || new Date().toISOString().slice(0, 10);
  let url = FITBIT_API_URL + `foods/log/water/date/${date}.json`;
  return await getDataFromApi(url, accessToken);
}
export async function getfitBitSleepgoal(accessToken: string): Promise<number> {
  let url = FITBIT_API_URL + `sleep/goal.json`;
  return await getDataFromApi(url, accessToken);
}
export async function setfitBitSleepgoal(
  accessToken: string,
  bedtime: string,
  wakeupTime: string,
  minDuration: number,
): Promise<number> {
  console.log('setfitBitSleepgoal', bedtime, wakeupTime, minDuration);
  let payload = '';
  if (bedtime) {
    payload += `bedtime=${bedtime}`;
  }
  if (wakeupTime && bedtime) {
    payload += `&wakeupTime=${wakeupTime}`;
  } else if (wakeupTime) {
    payload += `wakeupTime=${wakeupTime}`;
  }
  if (minDuration) {
    payload += `&minDuration=${minDuration}`;
  }
  let url = FITBIT_API_URL + `sleep/goal.json?` + payload;
  return await postDataToApi(url, accessToken);
}
