/**
 * Contact API client (frontend).
 *
 * Uses a configurable base URL so deployments can point at different backends.
 * If REACT_APP_API_BASE_URL is not set, defaults to http://localhost:3001.
 */

const API_BASE_URL =
  (process.env.REACT_APP_API_BASE_URL || "http://localhost:3001").replace(/\/+$/, "");

/**
 * Parses JSON responses while preserving useful error messages.
 * @param {Response} res Fetch Response
 * @returns {Promise<any>}
 */
async function parseJsonOrThrow(res) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");
  if (!res.ok) {
    const message =
      (payload && typeof payload === "object" && (payload.error || payload.message)) ||
      (typeof payload === "string" && payload) ||
      `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  return payload;
}

// PUBLIC_INTERFACE
export async function listContacts() {
  /** Fetch all contacts. Returns an array. */
  const res = await fetch(`${API_BASE_URL}/contacts`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return parseJsonOrThrow(res);
}

// PUBLIC_INTERFACE
export async function createContact(contact) {
  /** Create a contact. Expects {name, email, phone}. Returns created contact. */
  const res = await fetch(`${API_BASE_URL}/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(contact),
  });
  return parseJsonOrThrow(res);
}

// PUBLIC_INTERFACE
export async function updateContact(id, contact) {
  /** Update a contact by id. Returns updated contact. */
  const res = await fetch(`${API_BASE_URL}/contacts/${encodeURIComponent(String(id))}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(contact),
  });
  return parseJsonOrThrow(res);
}

// PUBLIC_INTERFACE
export async function deleteContact(id) {
  /** Delete a contact by id. Returns a status object or deleted contact depending on backend. */
  const res = await fetch(`${API_BASE_URL}/contacts/${encodeURIComponent(String(id))}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  // Some delete endpoints return 204
  if (res.status === 204) return { status: "ok" };
  return parseJsonOrThrow(res);
}

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns the configured API base URL. */
  return API_BASE_URL;
}
