import { callShopifyApi, escapeString } from '../ShopifyConfig';
export async function stagedUploadsCreate(file: any) {
  const query = `mutation {
      stagedUploadsCreate(input: {
            filename: "${file.fileName}",
            mimeType: "${file.mimeType}",
            fileSize: "${file.fileSize}",  
            resource:IMAGE,
      }) {
     stagedTargets {
      url
      resourceUrl
      parameters {
        name
        value
      }
    }
    userErrors {
      field
      message
    }
      }
      }
      `;

  return await callShopifyApi(query, true);
}
export async function createFile(originalSource: any) {
  const query = `mutation {
      fileCreate(files: [
         {
          contentType: IMAGE,
          originalSource: "${originalSource}",
        }
]) {
        files {
          id
          preview{image{id url}}  
          fileStatus
        }
          userErrors{
            field
            message
          }
      }
    }`;

  return await callShopifyApi(query, true);
}

export async function previewImage(id: string) {
  const query = ` query {
      nodes(ids:"${id}" ) {
        ... on File {
          fileStatus
          preview {
            image {
              url
            }
          }
        }
      }
    }`;
  return await callShopifyApi(query, true);
}
