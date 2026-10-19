/**
 * Node.js API transport foundation. NOT YET wired to BATO's feature screens.
 * Once the backend API contract is provided, migrate Base44 SDK calls here.
 * Authentication token retrieval should use a platform-safe secure session
 * implementation, never hard-code credentials or tokens in source code.
 */
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || '';

export function createNodeApiClient({ baseUrl = configuredBaseUrl, getAccessToken } = {}) {
  const root = baseUrl.replace(/\/+$/, '');

  async function request(path, { method = 'GET', body, headers = {}, signal } = {}) {
    if (!root) {
      throw new Error('Node API URL not configured. Set VITE_API_BASE_URL in .env.mobile.local.');
    }
    const base = new URL(`${root}/`);
    if (base.protocol !== 'https:' && !import.meta.env.DEV) {
      throw new Error('Production mobile API endpoints must use HTTPS.');
    }
    const url = new URL(String(path).replace(/^\/+/, ''), base);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) {
      throw new Error('Only relative paths under the configured API URL are allowed.');
    }
    const token = getAccessToken ? await getAccessToken() : null;
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const requestHeaders = { Accept: 'application/json', ...headers };
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
    if (body !== undefined && !isFormData && !('Content-Type' in requestHeaders)) {
      requestHeaders['Content-Type'] = 'application/json';
    }
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      signal,
    });
    const type = response.headers.get('content-type') || '';
    const data = response.status === 204 ? null
      : type.includes('application/json') ? await response.json()
      : await response.text();
    if (!response.ok) {
      const error = new Error(data?.message || data?.error || `API request failed (${response.status})`);
      error.status = response.status;
      error.details = data;
      throw error;
    }
    return data;
  }

  return {
    request,
    get: (path, options) => request(path, options),
    post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
    put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
    patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
    delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  };
}

export const nodeApi = createNodeApiClient();
