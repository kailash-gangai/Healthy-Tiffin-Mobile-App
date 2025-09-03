import { callShopifyApi, escapeString } from '../ShopifyConfig';
export async function getCustomerDetails(customerAccessToken: string) {
  const query = `
   query {
    customer(customerAccessToken:"${customerAccessToken}" ) {
      id
      displayName
      email
      phone
    }
  } `;
  return await callShopifyApi(query);
}
