import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { createPreviewClient, activePersona } from '../test-mode/previewClient';

const { appId, serverUrl, token, functionsVersion } = appParams;

//Create a client with authentication required
const isStandalone = import.meta.env.MODE === 'mobile';
const realClient = isStandalone ? null : createClient({
  appId,
  serverUrl,
  token,
  functionsVersion,
  requiresAuth: false
});

// Mobile builds deliberately use an isolated *offline simulation*.
// Hosted web builds retain their existing Base44 SDK behavior.
export const base44 = (isStandalone || import.meta.env.DEV) ? createPreviewClient(realClient) : realClient;
export const previewCartKey = (accountEmail) => (isStandalone || import.meta.env.DEV) && activePersona()
  ? "bato-preview-cart:" + activePersona().id : "bato_clinic_cart:"+encodeURIComponent(accountEmail||"guest");
export const previewCartStorage = () => (isStandalone || import.meta.env.DEV) && activePersona() ? (isStandalone ? localStorage : sessionStorage) : localStorage;
