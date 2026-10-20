import { PATIENT_API_BASE_URL, readPatientAuth } from './patientApi';
import { patientHttpJson } from './patientHttp';
import { Capacitor, CapacitorHttp } from '@capacitor/core';

const ROOT = `${PATIENT_API_BASE_URL}/api/v1/patient/onboarding`;

async function onboardingRequest(path, { method = 'GET', body, file = false, binary = false } = {}) {
  const token = readPatientAuth()?.token;
  if (!token) throw new Error('Please sign in to continue onboarding.');

  // Native JSON traffic uses CapacitorHttp (not affected by WebView CORS).
  if (!file && !binary) {
    const result = await patientHttpJson(`${ROOT}${path}`, { method, token, body });
    return result.data ?? result;
  }

  // File blobs and multipart FormData keep the existing upload/download behavior.
  // Native file uploads may require an additional transport change if the server
  // doesn't allow the app origin in its CORS policy.
  let response;
  try {
    response = await fetch(`${ROOT}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(file ? {} : { Accept: 'application/json' }) },
      ...(body ? { body } : {}),
    });
  } catch (error) {
    console.error('[BATO onboarding files] Transport error:', error);
    throw new Error('Could not transfer onboarding file. Check server CORS and network connection.');
  }
  if (binary && response.ok) return response.blob();
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success === false) {
    const message = result?.message || result?.error || `Request failed (HTTP ${response.status})`;
    throw new Error(message);
  }
  if (!result || typeof result !== 'object') throw new Error('Unexpected response from BATO.');
  return result.data ?? result;
}

export const getOnboardingQuestions = () => onboardingRequest('/questions');
export const getOnboardingState = () => onboardingRequest('');
export const getOnboardingStep = step => onboardingRequest(`/steps/${encodeURIComponent(step)}`);
export const saveOnboardingStep = (step, answers) => onboardingRequest(`/steps/${encodeURIComponent(step)}`, { method: 'PUT', body: { answers } });
export const completeOnboarding = () => onboardingRequest('/complete', { method: 'POST' });
export const getOnboardingFile = fileId => onboardingRequest(`/files/${encodeURIComponent(fileId)}`, { binary: true });
export const deleteOnboardingFile = fileId => onboardingRequest(`/files/${encodeURIComponent(fileId)}`, { method: 'DELETE' });
// Native multipart transport avoids WKWebView CORS restrictions. Files are converted
// into a binary multipart body and sent using the Capacitor HTTP native bridge.
async function multipartBase64(file, step, slot, boundary) {
  const encoder = new TextEncoder();
  const safeName = String(file.name || 'upload.jpg').replace(/[\r\n"\\]/g, '_');
  const prefix = encoder.encode(
    `--${boundary}\r\nContent-Disposition: form-data; name="step"\r\n\r\n${step}\r\n` +
    `--${boundary}\r\nContent-Disposition: form-data; name="slot"\r\n\r\n${slot}\r\n` +
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${safeName}"\r\n` +
    `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`
  );
  const fileBytes = new Uint8Array(await file.arrayBuffer());
  const suffix = encoder.encode(`\r\n--${boundary}--\r\n`);
  const bytes = new Uint8Array(prefix.length + fileBytes.length + suffix.length);
  bytes.set(prefix);
  bytes.set(fileBytes, prefix.length);
  bytes.set(suffix, prefix.length + fileBytes.length);
  // FileReader avoids overflowing the JS call stack for multi-megabyte photos.
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('Unable to read selected file.'));
    reader.readAsDataURL(new Blob([bytes], { type: 'application/octet-stream' }));
  });
}

export async function uploadOnboardingFile(file, step, slot) {
  if (!file || !['photos', 'health'].includes(step) || !slot) {
    throw new Error('Select a valid file and upload slot.');
  }
  if (file.size > 10 * 1024 * 1024) throw new Error('Each file must be 10 MB or smaller.');
  const token = readPatientAuth()?.token;
  if (!token) throw new Error('Please sign in to upload a file.');
  if (Capacitor.isNativePlatform()) {
    const boundary = `BATOUpload${Date.now().toString(36)}`;
    const data = await multipartBase64(file, step, slot, boundary);
    let response;
    try {
      response = await CapacitorHttp.request({
        url: `${ROOT}/files`, method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json',
          'Content-Type': `multipart/form-data; boundary=${boundary}` },
        data, dataType: 'file', responseType: 'json',
        connectTimeout: 15000, readTimeout: 60000,
      });
    } catch (cause) {
      console.error('[BATO onboarding upload] Native transport:', cause);
      throw new Error(`Photo upload failed: ${cause?.message || String(cause)}`);
    }
    const payload = typeof response.data === 'string'
      ? (() => { try { return JSON.parse(response.data); } catch { return null; } })()
      : response.data;
    if (response.status < 200 || response.status >= 300 || payload?.success === false) {
      throw new Error(payload?.message || payload?.error || `Upload failed (HTTP ${response.status})`);
    }
    if (!payload || typeof payload !== 'object') throw new Error('Unexpected response from file upload.');
    return payload.data ?? payload;
  }
  const form = new FormData();
  form.append('step', step);
  form.append('slot', slot);
  form.append('file', file);
  return onboardingRequest('/files', { method: 'POST', body: form, file: true });
}
