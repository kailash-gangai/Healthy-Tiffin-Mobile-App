export const STORE_DOMAIN = 'healthytiffin-dev.myshopify.com';
export const STOREFRONT_API_VERSION = '2025-07';
export const STOREFRONT_PUBLIC_TOKEN = '3e0af6cbb93e01a174a52f8e1db6226e';
export const STORE_API_URL = `https://${STORE_DOMAIN}/api/${STOREFRONT_API_VERSION}/graphql.json`;

export const callShopifyApi = async (query: string) => {
  const response = await fetch(STORE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_PUBLIC_TOKEN,
    },
    body: JSON.stringify({ query }),
  });
  const data = await response.json();
  let errors: any[] = [];
  if (response.ok) {
    if (data.errors) {
      data.errors.forEach((error: any) => {
        throw new Error(error.message || 'An error occurred');
      });
    }
    if (data.data.customerCreate?.userErrors?.length > 0) {
      const errors = data.data.customerCreate.userErrors;
      errors.forEach((error: any) => {
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
