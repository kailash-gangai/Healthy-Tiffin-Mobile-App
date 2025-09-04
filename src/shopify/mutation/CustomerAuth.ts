import { callShopifyApi, escapeString } from '../ShopifyConfig';
export async function customerUpsert(
  customer: any,
  customerAccessToken?: string,
) {
  let queryPart = 'customerCreate(input: {';
  if (customerAccessToken) {
    queryPart =
      'customerUpdate(customerAccessToken: "' +
      customerAccessToken +
      '", customer: {';
  }
  let query = `mutation {`;
  query +=
    queryPart +
    `   email: "${escapeString(customer.email)}",
       ` +
    (customer.password ? `password: "${customer.password}",` : '') +
    `
        firstName: "${escapeString(customer.firstName)}",
        lastName: "${escapeString(customer.lastName)}",
        ` +
    (customer.phone ? `phone: "${customer.phone}",` : '') +
    `
        acceptsMarketing: true
      }) {
        customer {
          id
          email
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  let res = await callShopifyApi(query);
  if (res.customerCreate?.userErrors?.length > 0) {
    const errors = res.customerCreate.userErrors;
    errors.forEach((error: any) => {
      throw new Error(error.message || 'An error occurred');
    });
  }
  if (res.customerUpdate?.userErrors?.length > 0) {
    const errors = res.customerUpdate.userErrors;
    errors.forEach((error: any) => {
      throw new Error(error.message || 'An error occurred');
    });
  }
  return res;
}
export async function loginCustomer(customer: any) {
  // customerAccessTokenCreate
  const query = `
    mutation {
      customerAccessTokenCreate(input: {
        email: "${customer.email}",
        password: "${customer.password}"
      }) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          field
          message
        }
      }
    }
  `;
  return await callShopifyApi(query);
}
export async function customerRecover(email: string) {
  const query = `
    mutation {
      customerRecover(email: "${email}") {
        userErrors {
          field
          message
        }
      }
    }
  `;
  return await callShopifyApi(query);
}
export async function customerReset(
  id: string,
  password: string,
  token: string,
) {
  const query = `
    mutation {
      customerReset(id:"${id}", input:{
        password: "${password}",
        resetToken: "${token}"
        }) {
        customer {
          id
          email
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  return await callShopifyApi(query);
}
export async function logoutCustomer(customerAccessToken: string) {
  const query = `
    mutation {
      customerAccessTokenDelete(customerAccessToken: "${customerAccessToken}") {
        customerUserErrors {
          field
          message
        }
      }
    }
  `;
  return await callShopifyApi(query);
}

export async function customerAccessTokenRefresh(customerAccessToken: string) {
  const query = `
    mutation {
      customerAccessTokenRefresh(customerAccessToken: "${customerAccessToken}") {
        customerAccessToken {
          accessToken
          expiresAt
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  return await callShopifyApi(query);
}

export async function customerAddressCreate(address: any) {
  const query = `
    mutation {
      customerAddressCreate(input: {
        address1: "${address.address1}",
        address2: "${address.address2}",
        city: "${address.city}",
        country: "${address.country}",
        firstName: "${address.firstName}",
        lastName: "${address.lastName}",
        phone: "${address.phone}",
        province: "${address.province}",
        zip: "${address.zip}"
      }) {
        customerAddress {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  return await callShopifyApi(query);
}
export async function customerMetafieldUpdate(
  metafields: any,
  customerId: string,
) {
  const parts = metafields.map((metafield: any) => {
    return `
      {
        ownerId: "${customerId}",
        namespace: "custom",
        key: "${metafield.key}",
        value: "${metafield.value}",
        type: "${metafield.type}"
      }
    `;
  });
  const query = `
      mutation {
        metafieldsSet(metafields:[ ${parts.join(', ')} ]) {
          metafields {
            id
            namespace
            key
            value
          }
            userErrors {
              field
              message
            }
        }
      }
    `;
  console.log('query', query);
  return await callShopifyApi(query, true);
}
