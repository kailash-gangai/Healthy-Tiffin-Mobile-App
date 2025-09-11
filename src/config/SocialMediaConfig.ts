import {
  STORE_API_URL,
  STOREFRONT_PUBLIC_TOKEN,
} from '../shopify/ShopifyConfig';

// const STOREFRONT_PUBLIC_TOKEN=
export const MULTIPASS_SECRET = '2456b37a3afcb621ee972127be9c6024';
export const GOOGLE_CLIENT_ID =
  '678786774271-e7f9hqs4590mfmddbajnpib8esm343m7.apps.googleusercontent.com';
export const FB_APP_ID = '';
export const FB_APP_SECRET = '';
export const APPLE_CLIENT_ID = '';
var Multipassify = require('multipassify');

const multipass = new Multipassify(MULTIPASS_SECRET!);

export async function createShopifySession(input: {
  email: string;
  firstName?: string;
  lastName?: string;
  return_to?: string;
}) {
  const mpToken = multipass.encode({
    email: input.email,
    first_name: input.firstName,
    last_name: input.lastName,
    return_to: input.return_to,
  });

  const query = `
    mutation($token: String!) {
      customerAccessTokenCreateWithMultipass(multipassToken: $token) {
        customerAccessToken { accessToken expiresAt }
        customerUserErrors { field message code }
      }
    }`;

  const res = await fetch(STORE_API_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_PUBLIC_TOKEN!,
    },
    body: JSON.stringify({ query, variables: { token: mpToken } }),
  });

  const json = await res.json();
  console.log('json', json);
  const payload = json.data?.customerAccessTokenCreateWithMultipass;
  if (payload?.customerUserErrors?.length) {
    throw new Error(
      payload.customerUserErrors.map((e: any) => e.message).join('; '),
    );
  }
  const token = payload?.customerAccessToken;
  if (!token?.accessToken) throw new Error('no customer access token');
  return token as { accessToken: string; expiresAt: string };
}
