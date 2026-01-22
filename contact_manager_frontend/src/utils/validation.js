// PUBLIC_INTERFACE
export function validateContact(values) {
  /** Validate contact fields. Returns { valid: boolean, errors: Record<string,string> } */
  const errors = {};

  const name = (values.name || "").trim();
  const email = (values.email || "").trim();
  const phone = (values.phone || "").trim();

  if (!name) errors.name = "Name is required.";

  if (email) {
    // Simple pragmatic email check.
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) errors.email = "Enter a valid email address.";
  }

  if (phone) {
    // Allow digits, spaces, parentheses, +, and hyphens.
    const phoneOk = /^[0-9+\-()\s.]{7,}$/.test(phone);
    if (!phoneOk) errors.phone = "Enter a valid phone number.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
