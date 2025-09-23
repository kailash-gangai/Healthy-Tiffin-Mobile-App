import { tags } from 'react-native-svg/lib/typescript/xmlTags';
import { callShopifyApi } from '../ShopifyConfig';

// Define types for the response data structure
interface MetaObjectField {
  key: string;
  value: string;
}

interface MetaObject {
  id: string;
  handle: string;
  type?: string;
  fields?: MetaObjectField[];
}

interface MetaObjectFieldReturnType {
  metaobjects: {
    nodes: MetaObject[];
  };
}

export const getAllMetaobjects = async (
  type: string,
): Promise<MetaObject[]> => {
  const query = `
    query {
      metaobjects(type: "${type}", first: 250) {
        nodes {
          id
          handle
          type
          fields {
            key
            value
          }
        }
      }
    }
  `;

  try {
    const data: MetaObjectFieldReturnType = await callShopifyApi(query);
    if (!data?.metaobjects?.nodes) {
      console.warn('No data found');
      return [];
    }

    return data.metaobjects.nodes.map(m => ({
      id: m.id,
      handle: m.handle,
    }));
  } catch (error) {
    console.error('Error fetching metaobjects:', error);
    return []; // Return an empty array in case of an error
  }
};

export const getMetaObjectByHandle = async (id: string) => {
  const query = `
    query {
      metaobject(id:"${id}") {
        id
        handle
        type
        fields{
        key
        value
        }
        }
}
`;
  try {
    // Call Shopify API with query and variables
    const data = await callShopifyApi(query);
    if (!data?.metaobject) {
      console.log('No data found');
      return [];
    }
    return data.metaobject.fields;
  } catch (error: any) {
    console.log('Error', error?.message);
    return [];
  }
};

// Fetch product info by array of product IDs (only title, description, and image)
