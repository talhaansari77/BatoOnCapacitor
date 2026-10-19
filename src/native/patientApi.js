/** BATO patient authentication — staging environment. */
export const PATIENT_API_BASE_URL = 'https://betaapi.batoclinic.com';
const SESSION_KEY = 'bato-patient-auth-v1';

export function readPatientAuth() {
  try {
    const value = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    return value && typeof value.token === 'string' && value.token ? value : null;
  } catch { return null; }
}
export function savePatientAuth(data) {
  const token = data?.token;
  if (typeof token !== 'string' || !token) throw new Error('Verification succeeded but the server did not return a token.');
  const session = { token, patient: data.patient ?? data.user ?? null, savedAt: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}
export function clearPatientAuth() { localStorage.removeItem(SESSION_KEY); }

async function request(path, body) {
  let response;
  try {
    response = await fetch(`${PATIENT_API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch { throw new Error('Unable to reach BATO staging server. Check your internet connection.'); }
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    const message = payload?.message || payload?.error || `Request failed (${response.status})`;
    throw new Error(typeof message === 'string' ? message : 'Request failed.');
  }
  if (!payload || typeof payload !== 'object') throw new Error('Unexpected response from BATO server.');
  return payload;
}
export function sendPatientOtp(mobileNumber) {
  return request('/patient/send-otp', { login_method: 'mobile', mobile_number: mobileNumber });
}
export function verifyPatientOtp(otpKey, otp) {
  return request('/patient/verify-otp', { otp_key: otpKey, otp });
}

/** Fetch the authenticated patient's current record. */
export async function getPatientProfile() {
  const session = readPatientAuth();
  if (!session?.token) throw new Error('Please sign in to view your patient profile.');
  let response;
  try {
    response = await fetch(`${PATIENT_API_BASE_URL}/patient/profile`, {
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${session.token}` },
    });
  } catch { throw new Error('Unable to reach BATO staging server. Check your internet connection.'); }
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || payload?.error || `Unable to load profile (${response.status}).`);
  }
  if (!payload?.data || typeof payload.data !== 'object') throw new Error('Invalid patient profile response.');
  return payload.data;
}

/** Load appointments using patient_code without its P- prefix. */
export async function getPatientAppointments({ status = '', limit = 50, offset = 0 } = {}) {
  const session = readPatientAuth();
  if (!session?.token) throw new Error('Please sign in to view appointments.');
  const patient = await getPatientProfile();
  const patientId = String(patient.patient_code ?? '').replace(/^P-/i, '');
  if (!/^\d+$/.test(patientId)) throw new Error('Patient profile is missing a valid patient code.');
  const params = new URLSearchParams({ status, limit: String(limit), offset: String(offset) });
  let response;
  try {
    response = await fetch(`${PATIENT_API_BASE_URL}/appointment/patient/${encodeURIComponent(patientId)}?${params}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${session.token}` },
    });
  } catch { throw new Error('Unable to reach BATO staging server. Check your internet connection.'); }
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) throw new Error(payload?.message || payload?.error || `Unable to load appointments (${response.status}).`);
  if (!Array.isArray(payload?.data)) throw new Error('Invalid appointments response from BATO server.');
  return payload.data;
}


/** Patient medical reports; both endpoints use the OTP-issued Bearer token. */
async function getPatientJson(path) {
  const session = readPatientAuth();
  if (!session?.token) throw new Error('Please sign in to view medical reports.');
  let response;
  try {
    response = await fetch(`${PATIENT_API_BASE_URL}${path}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${session.token}` },
    });
  } catch { throw new Error('Unable to reach BATO staging server. Check your internet connection.'); }
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || payload?.error || `Unable to load medical reports (${response.status}).`);
  }
  if (!payload || typeof payload !== 'object') throw new Error('Invalid medical reports response.');
  return payload.data;
}

export async function getPatientReports({ range = 'all', search = '' } = {}) {
  const params = new URLSearchParams({ range: String(range), search: String(search) });
  const data = await getPatientJson(`/patient/reports?${params}`);
  if (!Array.isArray(data?.reports)) throw new Error('Invalid medical reports list response.');
  return data;
}

export async function getPatientReportDetail(reportToken) {
  if (typeof reportToken !== 'string' || !/^[A-Za-z0-9_-]+$/.test(reportToken)) {
    throw new Error('Invalid report token.');
  }
  return getPatientJson(`/patient/reports/${encodeURIComponent(reportToken)}`);
}
