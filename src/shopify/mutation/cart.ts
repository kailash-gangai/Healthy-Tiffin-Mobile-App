import { callShopifyApi } from '../ShopifyConfig';

export const createCart = async (input: any) => {
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

  const variables = {
    input: {
      lines: input.map(item => ({
        quantity: item.qty,
        merchandiseId: item.variantId,
        attributes: [
          { key: 'Category', value: item.category },
          { key: 'Date', value: item.date },
          { key: 'Day', value: item.day },
        ],
      })),
    },
  };

  try {
    // Call Shopify API with the mutation query and variables
    const data = await callShopifyApi(mutation, variables);

    if (data?.cartCreate?.cart) {
      console.log('Cart created successfully:', data.cartCreate.cart);
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
