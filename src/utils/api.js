export function getApiBase() {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  const origin = window.location.origin;
  try {
    const url = new URL(origin);
    const host = url.hostname || 'localhost';
    const is5173 = url.port === '5173';
    const is3000 = url.port === '3000' || (!url.port && origin.includes('localhost'));
    if (is5173 || is3000) return `http://${host}:5000/api`;
  } catch (_) {}
  return 'http://localhost:5000/api';
}

export async function apiFetch(path, { method = 'GET', headers = {}, body, signal, timeoutMs } = {}) {
  let base = getApiBase();
  const token = localStorage.getItem('hodhod_token');
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const urlPath = `${base}${path.startsWith('/') ? '' : '/'}${path}`;

  const runWithTimeout = async (makeReq) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs ?? (process.env.NODE_ENV === 'production' ? 8000 : 3000));
    try {
      return await makeReq(ctl.signal);
    } finally {
      clearTimeout(t);
    }
  };

  const doRequest = async (b, sig) => fetch(`${b}${path.startsWith('/') ? '' : '/'}${path}` , {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
    signal: sig || signal,
    cache: 'no-store',
  });

  let res;
  try {
    res = await runWithTimeout((sig) => doRequest(base, sig));
  } catch (e) {
    // Network/timeout: try alternate local port (5000 <-> 5001)
    if (base.includes('http://localhost:5000')) {
      base = base.replace('http://localhost:5000', 'http://localhost:5001');
    } else if (base.includes('http://localhost:5001')) {
      base = base.replace('http://localhost:5001', 'http://localhost:5000');
    }
    res = await runWithTimeout((sig) => doRequest(base, sig));
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = isJson ? data?.message || 'Request failed' : 'Request failed';
    throw new Error(message);
  }
  return data;
}


