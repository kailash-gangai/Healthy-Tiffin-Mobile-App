import { AuthConfiguration } from 'react-native-app-auth';
export const FITBIT_API_URL = 'https://api.fitbit.com/1/user/-/';
export const FITBIT_CONFIG: AuthConfiguration = {
  serviceConfiguration: {
    authorizationEndpoint: 'https://www.fitbit.com/oauth2/authorize',
    tokenEndpoint: 'https://api.fitbit.com/oauth2/token',
    revocationEndpoint: 'https://api.fitbit.com/oauth2/revoke',
  },
  clientId: '23QM8H',
  clientSecret: '78a939a7bc15561b527cb0df5a685e87',
  redirectUrl: 'healthytiffin://oauth',
  usePKCE: false,
  scopes: ['activity', 'heartrate', 'sleep', 'weight', 'nutrition', 'profile'],
};
