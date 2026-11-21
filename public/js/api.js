export async function solve(file, want) {
  let res;
  try {
    res = await fetch(`/api/solve${want ? `?want=${want}` : ''}`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: await file.text() });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Server error (${res.status}). The API may not be deployed.`);
  return body;
}