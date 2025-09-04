export const STORE_DOMAIN = 'healthytiffin-dev.myshopify.com';
export const STOREFRONT_API_VERSION = '2025-07';
export const STOREFRONT_PUBLIC_TOKEN = '3e0af6cbb93e01a174a52f8e1db6226e';
export const STORE_ADMIN_API_KEY = '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';
export const STORE_API_URL = `https://${STORE_DOMAIN}/api/${STOREFRONT_API_VERSION}/graphql.json`;
export const STORE_ADMIN_API_URL = `https://${STORE_DOMAIN}/admin/api/${STOREFRONT_API_VERSION}/graphql.json`;
export const callShopifyApi = async (query: string, isAdmin = false) => {
  const apiKey = isAdmin ? STORE_ADMIN_API_KEY : STOREFRONT_PUBLIC_TOKEN;
  const access_token_head = isAdmin
    ? 'X-Shopify-Access-Token'
    : 'X-Shopify-Storefront-Access-Token';
  const url = isAdmin ? STORE_ADMIN_API_URL : STORE_API_URL;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [access_token_head]: apiKey,
    },
    body: JSON.stringify({ query }),
  });
  const data = await response.json();
  console.log('data', data);
  let errors: any[] = [];
  if (response.ok) {
    if (data.errors) {
      data.errors.forEach((error: any) => {
        throw new Error(error.message || 'An error occurred');
      });
    }
    return data.data;
  } else {
    throw new Error(data?.errors?.[0]?.message || 'An error occurred');
  }
};

export const callShopifyApiWithVariable = async (
  query: string,
  variables: any = null,
) => {
  // Prepare the body for the request, including variables if provided
  const body = variables ? { query, variables } : { query };

  const response = await fetch(STORE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_PUBLIC_TOKEN,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (response.ok) {
    // Check if there are errors in the response
    if (data.errors) {
      data.errors.forEach((error: any) => {
        throw new Error(error.message || 'An error occurred');
      });
    }
    return data.data;
  } else {
    throw new Error(data?.errors?.[0]?.message || 'An error occurred');
  }
};
// Helper function to escape user input
export const escapeString = (str: string | undefined | null) => {
  if (!str) {
    return ''; // Return an empty string if the value is undefined or null
  }
  return str.replace(/["\\]/g, '\\$&'); // Escape quotes and backslashes
};

export default {
  STORE_DOMAIN,
  STOREFRONT_API_VERSION,
  STOREFRONT_PUBLIC_TOKEN,
  STORE_API_URL,
  callShopifyApi,
  escapeString,
};
