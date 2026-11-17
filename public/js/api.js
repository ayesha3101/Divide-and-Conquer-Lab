/** Upload a file to the Flask API and return the solved JSON. Throws Error(message) on failure. */
export async function solve(file, want) {
  const form = new FormData();
  form.append('file', file);
  if (want) form.append('want', want);
  let res;
  try {
    res = await fetch('/api/solve', { method: 'POST', body: form });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Server error (${res.status}).`);
  return body;
}
