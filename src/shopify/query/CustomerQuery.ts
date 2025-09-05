import { callShopifyApi, escapeString } from '../ShopifyConfig';
export async function getCustomerDetails(customerAccessToken: string) {
  const query = `
   query   {
    customer(customerAccessToken:"${customerAccessToken}" ) {
      id
      displayName
      email
      phone
        metafield(namespace: "custom", key: "image") {
        value
        key
        namespace
      }
    }
  } `;
  return await callShopifyApi(query);
}
export async function getCustomerMetafields(
  customerAccessToken: string,
  namespace: string,
  key: string,
) {
  const query = `
   query   {
    customer(customerAccessToken:"${customerAccessToken}" ) {
       metafield(namespace: "${namespace}", key: "${key}") {
        value
        key
        namespace
      }
    }
  } `;
  return await callShopifyApi(query);
}
export async function getCustomerMetaField(accessToken: string, key: string) {
  try {
    const metafields = await getCustomerMetafields(accessToken, 'custom', key);
    return metafields.customer.metafield.value ?? ''; // assume metafields contain the data we need
  } catch (error) {
    return ''; // return empty string in case of an error
  }
}
