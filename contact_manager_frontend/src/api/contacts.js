/**
 * Contact API client (frontend).
 *
 * Uses a configurable base URL so deployments can point at different backends.
 * If REACT_APP_API_BASE_URL is not set, defaults to http://localhost:3001.
 */

// Prefer the canonical env var; also support older aliases that may exist in some environments.
const API_BASE_URL = (
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_BACKEND_URL ||
  'http://localhost:3001'
).replace(/\/*$/, '');

/**
 * Extracts a user-friendly error message from common backend error shapes.
 * @param {any} payload
 * @param {number} status
 * @returns {string}
 */
function getErrorMessage(payload, status) {
  if (payload && typeof payload === 'object') {
    // Backend uses: { error: { code, message, details } }
    if (payload.error && typeof payload.error === 'object') {
      if (typeof payload.error.message === 'string') return payload.error.message;
      if (typeof payload.error.code === 'string') return payload.error.code;
    }
    if (typeof payload.message === 'string') return payload.message;
  }
  if (typeof payload === 'string' && payload.trim()) return payload;
  return `Request failed (${status})`;
}

/**
 * Parses JSON responses while preserving useful error messages.
 * @param {Response} res Fetch Response
 * @returns {Promise<any>}
 */
async function parseJsonOrThrow(res) {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  const payload = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => '');

  if (!res.ok) {
    const err = new Error(getErrorMessage(payload, res.status));
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

/**
 * Many endpoints return { data: ... }. This helper unwraps that consistently.
 * @param {any} payload
 * @returns {any}
 */
function unwrapData(payload) {
  if (payload && typeof payload === 'object' && 'data' in payload) return payload.data;
  return payload;
}

// PUBLIC_INTERFACE
export async function listContacts() {
  /** Fetch all contacts. Returns an array. */
  const res = await fetch(`${API_BASE_URL}/contacts`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  const payload = await parseJsonOrThrow(res);
  return unwrapData(payload);
}

// PUBLIC_INTERFACE
export async function createContact(contact) {
  /** Create a contact. Expects {name, email, phone}. Returns created contact. */
  const res = await fetch(`${API_BASE_URL}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(contact),
  });

  const payload = await parseJsonOrThrow(res);
  return unwrapData(payload);
}

// PUBLIC_INTERFACE
export async function updateContact(id, contact) {
  /** Update a contact by id. Returns updated contact. */
  const res = await fetch(`${API_BASE_URL}/contacts/${encodeURIComponent(String(id))}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(contact),
  });

  const payload = await parseJsonOrThrow(res);
  return unwrapData(payload);
}

// PUBLIC_INTERFACE
export async function deleteContact(id) {
  /** Delete a contact by id. Returns {id, deleted:true} or a status object depending on backend. */
  const res = await fetch(`${API_BASE_URL}/contacts/${encodeURIComponent(String(id))}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });

  // Some delete endpoints return 204
  if (res.status === 204) return { status: 'ok' };

  const payload = await parseJsonOrThrow(res);
  return unwrapData(payload);
}

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns the configured API base URL. */
  return API_BASE_URL;
}
