import { callShopifyApiWithVariable } from '../ShopifyConfig';

export const createCart = async (
  input: any[],
  customerAccessToken: string,
  email: string,
) => {
  const mutation = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
           
          }      
        }
      }
    `;

  const uniqueDays = new Set<string>();
  input?.forEach(i => {
    uniqueDays.add(i.day);
  });

  const variables = {
    input: {
      attributes: [
        { key: 'DayCount', value: uniqueDays.size.toString() },
        { key: 'Discount', value: '10' },
      ],
      buyerIdentity: {
        customerAccessToken: customerAccessToken,
        email: email,
      },
      lines: input.map(item => ({
        quantity: item.qty,
        merchandiseId: item.variantId,
        attributes: [
          { key: 'Category', value: item.category },
          { key: 'DayDate', value: item.date },
          { key: 'Day', value: item.day },
          { key: 'Type', value: item.type },
        ],
      })),
    },
  };

  try {
    // Call Shopify API with the mutation query and variables
    const data = await callShopifyApiWithVariable(mutation, variables);

    if (data?.cartCreate?.cart) {
      return data.cartCreate.cart;
    } else {
      console.log('Error creating cart:', data?.cartCreate?.userErrors);
      return null;
    }
  } catch (error: any) {
    console.log('Error:', error?.message);
    return null;
  }
};
