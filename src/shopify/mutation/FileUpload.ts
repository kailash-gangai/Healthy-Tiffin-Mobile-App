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
export async function createFile(file: any) {
  const query = `mutation {
      fileCreate(files: [
         {
          contentType: IMAGE,
          originalSource: "${file.originalSource}",
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
