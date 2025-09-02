import { callShopifyApi } from "../ShopifyConfig";

export const getProductsByIds = async (productIds:string) => {
    const query = `
      query {
        nodes(ids: ${productIds}) {
          ... on Product {
            id
            title
            tags
            description
            priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
              variants(first: 1) {
                edges {
                  node {
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
      // Call Shopify API with the direct query
      const data = await callShopifyApi(query);
      if (data && data.nodes) {
        // Map over the products to get the title, description, and image
        return data.nodes.map((product: any) => ({
          id: product.id,
          title: product.title,
          description: product.description,
          tags: product.tags,
          image: product.images.edges[0]?.node.src || null,
          price:product.priceRange,
          variants:product.variants // Get the image URL (if available)
        }));
      } else {
        console.log("No products found.");
        return [];
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  };
  