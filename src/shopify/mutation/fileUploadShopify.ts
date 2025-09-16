import { STORE_ADMIN_API_KEY, STORE_ADMIN_API_URL } from '../ShopifyConfig';

type StagedTarget = {
  url: string;
  resourceUrl: string;
  parameters: { name: string; value: string }[];
};

async function adminGraphQL<T>(query: string, variables: any): Promise<T> {
  const res = await fetch(STORE_ADMIN_API_URL, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': STORE_ADMIN_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  console.log('res', json);
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
  }>(STAGED_UPLOADS_MUT, variables);

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

const FILE_UPDATE_MUT = `
mutation fileUpdate($files: [FileUpdateInput!]!) {
  fileUpdate(files: $files) {
    files { id fileStatus preview { image { url } } }
    userErrors { field message }
  }
}`;

async function fileCreate(
  resourceUrl: string,
  alt: string,
  mediaId: string,
): Promise<string> {
  const variables = {
    files: [
      {
        alt,
        ...(!mediaId?.includes('gid://shopify/')
          ? { contentType: 'IMAGE' }
          : {}),
        originalSource: resourceUrl,
        ...(mediaId?.includes('gid://shopify/') ? { id: mediaId } : {}),
      },
    ],
  };
  console.log('variables', variables);
  if (mediaId) {
    const data = await adminGraphQL<{
      fileUpdate: { files: { id: string }[]; userErrors: any[] };
    }>(FILE_UPDATE_MUT, variables);
    console.log('data', data);
    const err = data.fileUpdate.userErrors?.[0];
    if (err) throw new Error(err.message);
    const id = data.fileUpdate.files?.[0]?.id;
    if (!id) throw new Error('fileCreate returned no id');
    return id;
  } else {
    const data = await adminGraphQL<{
      fileCreate: { files: { id: string }[]; userErrors: any[] };
    }>(FILE_CREATE_MUT, variables);
    console.log('data', data);
    const err = data.fileCreate.userErrors?.[0];
    if (err) throw new Error(err.message);
    const id = data.fileCreate.files?.[0]?.id;
    if (!id) throw new Error('fileCreate returned no id');
    return id;
  }
}

const GET_FILE_QUERY = `
query GetFilePreviews($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on File { fileStatus preview { image { url } } }
  }
}`;

async function pollFileReady(
  fileId: string,
  { retries = 10, intervalMs = 3000 } = {},
): Promise<string> {
  while (retries-- > 0) {
    const data = await adminGraphQL<{ nodes: any[] }>(GET_FILE_QUERY, {
      ids: [fileId],
    });
    const node = data.nodes?.[0];
    const status = node?.fileStatus;
    const url = node?.preview?.image?.url;
    if (status === 'READY' && url) return url;
    await new Promise((r: any) => setTimeout(r, intervalMs));
  }
  throw new Error('File not READY after polling');
}

export async function uploadImageDirectFromRN(
  file: {
    uri: string;
    name?: string;
    type?: string;
  },
  mediaId?: string,
) {
  const name = file.name ?? `image-${Date.now()}.jpg`;
  const type = file.type ?? 'image/jpeg';
  const target = await createStagedTarget(name, type);
  const resourceUrl = await postToStagedUrl(target, {
    uri: file.uri,
    name,
    type,
  });

  const fileId = await fileCreate(resourceUrl, name, mediaId ?? '');
  const previewUrl = await pollFileReady(fileId);
  return { fileId, previewUrl };
}
