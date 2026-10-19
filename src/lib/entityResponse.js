/**
 * Guard entity collection responses at the network boundary.
 * Base44 SDK collection methods normally resolve to arrays. Some HTTP layers
 * wrap collections in `{ data: [...] }`, which is also accepted here.
 * An API error/object must not be silently treated as an empty patient record.
 */
export function requireEntityList(response, entityName) {
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object' && Array.isArray(response.data)) {
    return response.data;
  }

  // Diagnostic metadata only: never log patient records, credentials or payloads.
  const responseType = response === null ? 'null' : typeof response;
  const keys = response && typeof response === 'object'
    ? Object.keys(response).slice(0, 12) : [];
  console.error(`[BATO] Unexpected ${entityName} list response`, { responseType, keys });
  throw new TypeError(
    `${entityName} API returned an unexpected result (expected a list). ` +
    'Check your Base44 app configuration, sign-in state, and API response.'
  );
}
