/** BATO patient authentication — staging environment. */
import { patientHttpJson } from './patientHttp';

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

export function sendPatientOtp(mobileNumber) {
  return patientHttpJson(`${PATIENT_API_BASE_URL}/patient/send-otp`, {
    method: 'POST',
    body: { login_method: 'mobile', mobile_number: mobileNumber },
  });
}
export function verifyPatientOtp(otpKey, otp) {
  return patientHttpJson(`${PATIENT_API_BASE_URL}/patient/verify-otp`, {
    method: 'POST',
    body: { otp_key: otpKey, otp },
  });
}

/** Fetch the authenticated patient's current record. */
export async function getPatientProfile() {
  const session = readPatientAuth();
  if (!session?.token) throw new Error('Please sign in to view your patient profile.');
  const payload = await patientHttpJson(`${PATIENT_API_BASE_URL}/patient/profile`, { token: session.token });
  if (!payload?.data || typeof payload.data !== 'object') throw new Error('Invalid patient profile response.');
  return payload.data;
}

/** Load appointments using patient_code without its P- prefix (existing behavior). */
export async function getPatientAppointments({ status = '', limit = 50, offset = 0 } = {}) {
  const session = readPatientAuth();
  if (!session?.token) throw new Error('Please sign in to view appointments.');
  const patient = await getPatientProfile();
  const patientId = String(patient.patient_code ?? '').replace(/^P-/i, '');
  if (!/^\d+$/.test(patientId)) throw new Error('Patient profile is missing a valid patient code.');
  const params = new URLSearchParams({ status, limit: String(limit), offset: String(offset) });
  const payload = await patientHttpJson(`${PATIENT_API_BASE_URL}/appointment/patient/${encodeURIComponent(patientId)}?${params}`, { token: session.token });
  if (!Array.isArray(payload?.data)) throw new Error('Invalid appointments response from BATO server.');
  return payload.data;
}

/** Patient medical reports; both endpoints use the OTP-issued Bearer token. */
async function getPatientJson(path) {
  const session = readPatientAuth();
  if (!session?.token) throw new Error('Please sign in to view medical reports.');
  const payload = await patientHttpJson(`${PATIENT_API_BASE_URL}${path}`, { token: session.token });
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
