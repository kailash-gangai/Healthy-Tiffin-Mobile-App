import { callShopifyApi } from '../ShopifyConfig';

export const getProductsByIds = async (productIds: string) => {
  const query = `
      query {
        nodes(ids: ${productIds}) {
          ... on Product {
            id
            handle
            title
            tags
            description
          metafields(identifiers: [
                {namespace: "custom", key: "dietary_tags"},
                {namespace: "custom", key: "nutrients_information"}
              ]) {
                key
                value
              }
              variants(first: 1) {
                edges {
                  node {
                  id
                    priceV2 {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            images(first: 1) {
              edges {
                node {
                  src
                  altText
                }
              }
            }
          }
        }
      }
    `;

  try {
    const data = await callShopifyApi(query);

    if (data && data.nodes) {
      const filteredData = data.nodes.filter(
        (product: any) => product !== null,
      );
      return filteredData.map((product: any) => ({
        id: product.id,
        handle: product.handle,
        variantId: product.variants.edges?.[0]?.node.id || null,
        title: product.title,
        description: product.description,
        tags: product.tags,
        image: product.images.edges[0]?.node.src || null,
        price: product.variants.edges?.[0]?.node.priceV2?.amount || 'N/A',
        metafields: product.metafields,
      }));
    } else {
      console.log('No products found.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};
