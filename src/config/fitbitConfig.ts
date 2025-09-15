import { AuthConfiguration } from 'react-native-app-auth';
export const FITBIT_API_URL = 'https://api.fitbit.com/1/user/-/';
export const FITBIT_CONFIG: AuthConfiguration = {
  serviceConfiguration: {
    authorizationEndpoint: 'https://www.fitbit.com/oauth2/authorize',
    tokenEndpoint: 'https://api.fitbit.com/oauth2/token',
    revocationEndpoint: 'https://api.fitbit.com/oauth2/revoke',
  },
  clientId: '23QMBM',
  clientSecret: '6d74d7ae2fb54a067e248cea2ea1185e',
  redirectUrl: 'healthytiffin://oauth',
  usePKCE: true,
  scopes: ['activity', 'sleep', 'heartrate', 'weight', 'nutrition', 'profile'],
  additionalParameters: { prompt: 'consent' },
};
