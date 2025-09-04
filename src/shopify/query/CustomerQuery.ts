import { callShopifyApi, escapeString } from '../ShopifyConfig';
export async function getCustomerDetails(customerAccessToken: string) {
  const query = `
   query {
    customer(customerAccessToken:"${customerAccessToken}" ) {
      id
      displayName
      email
      phone
        metafields(identifiers: [{namespace: "custom", key: "image"}]) {
        value
        key
        namespace
      }
    }
  } `;
  return await callShopifyApi(query);
}
