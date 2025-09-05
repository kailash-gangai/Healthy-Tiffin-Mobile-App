import { callShopifyApiWithVariable } from '../ShopifyConfig';

export const getCustomerOrder = async (
  customerAccessToken: string,
  first: number = 20,
) => {
  try {
    const query = `
        query getOrders($customerAccessToken: String!, $first: Int!) {
          customer(customerAccessToken: $customerAccessToken) {
            orders(first: $first) {
              edges {
                cursor
                node {
                  id
                  name
                  billingAddress{
                  address1
                  address2
                  city 
                  country
                  }
                  orderNumber
                  processedAt
                  financialStatus
                  fulfillmentStatus
                 
                  lineItems(first: 50) {
                    edges {
                      node {
                        quantity
                        title
                        variant {
                         id
                          title
                           sku
                           price{
                           amount
                           }
                         image{
                         altText
                          url
                          }
                           }
                      }
                    }
                  }
                }
              }
              pageInfo { hasNextPage startCursor hasPreviousPage endCursor  }
            }
          }
        }
      `;

    const variables = {
      customerAccessToken,
      first,
    };

    const data = await callShopifyApiWithVariable(query, variables);
    const raw = data?.customer?.orders;
    const orders = data?.customer?.orders.edges.map(({ node }: any) => ({
      id: node.id,
      name: node.name,
      orderNumber: node.orderNumber,
      processedAt: node.processedAt,
      financialStatus: node.financialStatus,
      address: node.billingAddress,
      fulfillmentStatus: node.fulfillmentStatus,
      items: node.lineItems.edges.map(({ node: li }: any) => ({
        title: li.title,
        price: li.variant?.price?.amount ?? null,
        quantity: li.quantity,
        variantId: li.variant?.id ?? null,
        variantTitle: li.variant?.title ?? null,
        sku: li.variant?.sku ?? null,
        imageUrl: li.variant?.image?.url ?? null,
        imageAlt: li.variant?.image?.altText ?? null,
      })),
    }));

    return {
      orders,
      pageInfo: {
        hasNextPage: raw.pageInfo.hasNextPage,
        hasPreviousPage: raw.pageInfo.hasPreviousPage,
        startCursor: raw.pageInfo.startCursor,
        endCursor: raw.pageInfo.endCursor,
      },
    };
  } catch (error) {
    console.log(error);
    return [];
  }
};
