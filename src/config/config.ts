export async function getDataFromApi(url: string, accessToken: string) {
  const r = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  return j;
}
export async function postDataToApi(url: string, accessToken: string) {
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();

  return j;
}
