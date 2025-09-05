// shopifyUploadRN.ts
// RN 0.70+ / TypeScript. No server needed. Uses fetch + FormData.

const API_VERSION = '2025-07';

type StagedTarget = {
  url: string;
  resourceUrl: string;
  parameters: { name: string; value: string }[];
};

async function adminGraphQL<T>(
  shop: string, // e.g. "your-store.myshopify.com"
  adminToken: string, // Admin API access token
  query: string,
  variables: any,
): Promise<T> {
  const res = await fetch(
    `https://${shop}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': adminToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    },
  );
  const json = await res.json();
  if (!res.ok || json.errors)
    throw new Error(JSON.stringify(json.errors ?? json));
  return json.data as T;
}

const STAGED_UPLOADS_MUT = `
mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
  stagedUploadsCreate(input: $input) {
    stagedTargets { url resourceUrl parameters { name value } }
    userErrors { field message }
  }
}`;

async function createStagedTarget(
  shop: string,
  adminToken: string,
  filename: string,
  mimeType: string,
): Promise<StagedTarget> {
  const variables = {
    input: [
      {
        filename,
        httpMethod: 'POST',
        mimeType,
        resource: 'FILE',
      },
    ],
  };
  const data = await adminGraphQL<{
    stagedUploadsCreate: { stagedTargets: StagedTarget[]; userErrors: any[] };
  }>(shop, adminToken, STAGED_UPLOADS_MUT, variables);

  const err = data.stagedUploadsCreate.userErrors?.[0];
  if (err) throw new Error(err.message);
  const target = data.stagedUploadsCreate.stagedTargets?.[0];
  if (!target) throw new Error('No staged target');
  return target;
}

async function postToStagedUrl(
  target: StagedTarget,
  file: { uri: string; name: string; type: string },
) {
  const form = new FormData();
  target.parameters.forEach(p => form.append(p.name, p.value));
  // RN FormData file part:
  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  // Important: do NOT set Content-Type manually (fetch sets boundary)
  const res = await fetch(target.url, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Staged upload failed ${res.status}`);
  return target.resourceUrl;
}

const FILE_CREATE_MUT = `
mutation fileCreate($files: [FileCreateInput!]!) {
  fileCreate(files: $files) {
    files { id fileStatus preview { image { url } } }
    userErrors { field message }
  }
}`;

async function fileCreate(
  shop: string,
  adminToken: string,
  resourceUrl: string,
  alt: string,
): Promise<string> {
  const variables = {
    files: [{ alt, contentType: 'IMAGE', originalSource: resourceUrl }],
  };
  const data = await adminGraphQL<{
    fileCreate: { files: { id: string }[]; userErrors: any[] };
  }>(shop, adminToken, FILE_CREATE_MUT, variables);

  const err = data.fileCreate.userErrors?.[0];
  if (err) throw new Error(err.message);
  const id = data.fileCreate.files?.[0]?.id;
  if (!id) throw new Error('fileCreate returned no id');
  return id;
}

const GET_FILE_QUERY = `
query GetFilePreviews($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on File { fileStatus preview { image { url } } }
  }
}`;

async function pollFileReady(
  shop: string,
  adminToken: string,
  fileId: string,
  { retries = 10, intervalMs = 3000 } = {},
): Promise<string> {
  while (retries-- > 0) {
    const data = await adminGraphQL<{ nodes: any[] }>(
      shop,
      adminToken,
      GET_FILE_QUERY,
      { ids: [fileId] },
    );
    const node = data.nodes?.[0];
    const status = node?.fileStatus;
    const url = node?.preview?.image?.url;
    if (status === 'READY' && url) return url;
    await new Promise((r: any) => setTimeout(r, intervalMs));
  }
  throw new Error('File not READY after polling');
}

/**
 * Upload an image file (uri/name/type from image picker) directly to Shopify.
 * Returns { fileId, previewUrl }.
 */
export async function uploadImageDirectFromRN(
  shop: string,
  adminToken: string,
  file: { uri: string; name?: string; type?: string },
) {
  const name = file.name ?? `image-${Date.now()}.jpg`;
  const type = file.type ?? 'image/jpeg';

  const target = await createStagedTarget(shop, adminToken, name, type);
  const resourceUrl = await postToStagedUrl(target, {
    uri: file.uri,
    name,
    type,
  });
  const fileId = await fileCreate(shop, adminToken, resourceUrl, name);
  const previewUrl = await pollFileReady(shop, adminToken, fileId);
  return { fileId, previewUrl };
}
