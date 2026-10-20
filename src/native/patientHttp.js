/**
 * Scoped BATO JSON transport.
 * WKWebView fetch() is subject to CORS; CapacitorHttp sends requests via iOS/Android
 * native networking. Other app requests and UI code are left untouched.
 */
import { Capacitor, CapacitorHttp } from '@capacitor/core';

function decodePayload(data) {
  if (typeof data !== 'string') return data;
  try { return JSON.parse(data); } catch { return null; }
}

function networkError(error) {
  const cause = error instanceof Error ? error.message : String(error ?? 'Unknown error');
  console.error('[BATO patient API] Transport error:', cause);
  return new Error(`Could not connect to BATO staging API: ${cause}`);
}

/** Return the parsed JSON payload, or throw with the HTTP/API error message. */
export async function patientHttpJson(url, { method = 'GET', token, body } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let status;
  let payload;
  try {
    if (Capacitor.isNativePlatform()) {
      const response = await CapacitorHttp.request({
        url,
        method,
        headers,
        ...(body !== undefined ? { data: body } : {}),
        responseType: 'json',
        connectTimeout: 15000,
        readTimeout: 30000,
      });
      status = response.status;
      payload = decodePayload(response.data);
    } else {
      const response = await fetch(url, {
        method,
        headers,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
      status = response.status;
      payload = await response.json().catch(() => null);
    }
  } catch (error) {
    throw networkError(error);
  }

  if (status < 200 || status >= 300 || payload?.success === false) {
    const fieldErrors = payload?.errors;
    const detailed = Array.isArray(fieldErrors) && fieldErrors.length
      ? fieldErrors.map(e => `${e.field ? `${e.field}: ` : ''}${e.message || 'Invalid answer'}`).join('\n')
      : null;
    const message = detailed || payload?.message || payload?.error || `Request failed (HTTP ${status})`;
    throw new Error(typeof message === 'string' ? message : `Request failed (HTTP ${status})`);
  }
  if (!payload || typeof payload !== 'object') {
    throw new Error(`Unexpected JSON response from BATO (HTTP ${status}).`);
  }
  return payload;
}
