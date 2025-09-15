// /api/auth/google.ts
import { OAuth2Client } from 'google-auth-library';
import { MULTIPASS_SECRET, GOOGLE_CLIENT_ID } from '../SocialMediaConfig';
import {
  STORE_API_URL,
  STOREFRONT_PUBLIC_TOKEN,
} from '../../shopify/ShopifyConfig';

const google = new OAuth2Client(GOOGLE_CLIENT_ID!);
var Multipassify = require('multipassify');
const multipass = new Multipassify(MULTIPASS_SECRET);

async function createShopifySession(
  email: string,
  firstName?: string,
  lastName?: string,
) {
  const mpToken = multipass.encode({
    email,
    first_name: firstName,
    last_name: lastName,
  });

  const query = `
    mutation($t: String!) {
      customerAccessTokenCreateWithMultipass(multipassToken: $t) {
        customerAccessToken { accessToken expiresAt }
        customerUserErrors { message }
      }
    }`;

  const r = await fetch(STORE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_PUBLIC_TOKEN,
    },
    body: JSON.stringify({ query, variables: { t: mpToken } }),
  });

  const j = await r.json();
  const p = j.data?.customerAccessTokenCreateWithMultipass;
  if (p?.customerUserErrors?.length)
    throw new Error(p.customerUserErrors.map((e: any) => e.message).join('; '));
  return p.customerAccessToken;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST')
    return new Response('Not allowed', { status: 405 });

  try {
    const { idToken } = await req.json();
    const ticket = await google.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) throw new Error('email missing');

    const token = await createShopifySession(
      payload.email,
      payload.given_name,
      payload.family_name,
    );
    return Response.json(token);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}
