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
  const mainProductid = 'gid://shopify/ProductVariant/47981134545138';
  const uniqueDays = new Set<string>();

  // Collect unique days
  input?.forEach(i => {
    uniqueDays.add(i.day);
  });

  // Variables for the request
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
      lines: input.map(item => {
        // Handle properties for 'main' type and other types
        const itemAttributes =
          item.type === 'main'
            ? [
                { key: 'Category', value: item.category?.toLowerCase() },
                { key: '_DayDate', value: item.date },
                { key: '_Day', value: item.day },
                { key: '_Type', value: item.type },
                { key: '_TiffinPlan', value: item.tiffinPlan.toString() },
                { key: '__mainprodid', value: mainProductid },
              ]
            : [
                { key: 'Category', value: item.category?.toLowerCase() },
                { key: 'DayDate', value: item.date },
                { key: 'Day', value: item.day },
                { key: 'Type', value: item.type },
                { key: 'TiffinPlan', value: item.tiffinPlan.toString() },
              ];

        return {
          quantity: item.qty,
          merchandiseId: item.variantId,
          attributes: itemAttributes,
        };
      }),
    },
  };

  // console.log(variables, 'varinales');
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
