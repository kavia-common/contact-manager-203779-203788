import React, { useEffect, useMemo, useState } from "react";
import { validateContact } from "../utils/validation";

const emptyValues = { name: "", email: "", phone: "" };

// PUBLIC_INTERFACE
export default function ContactForm({
  mode, // "create" | "edit"
  initialValues,
  onSubmit,
  onCancel,
  busy,
  submitLabel,
}) {
  /** Add/Edit contact form. Controlled component with validation and accessible error messaging. */
  const init = useMemo(() => ({ ...emptyValues, ...(initialValues || {}) }), [initialValues]);
  const [values, setValues] = useState(init);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues(init);
    setTouched({});
    setErrors({});
  }, [init]);

  function updateField(field, nextValue) {
    setValues((v) => ({ ...v, [field]: nextValue }));
  }

  function handleBlur(field) {
    setTouched((t) => ({ ...t, [field]: true }));
    const v = validateContact(values);
    setErrors(v.errors);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validateContact(values);
    setErrors(v.errors);
    setTouched({ name: true, email: true, phone: true });
    if (!v.valid) return;

    // Normalize payload
    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
    };

    await onSubmit(payload);
  }

  const title = mode === "edit" ? "Edit contact" : "Add new contact";

  return (
    <form className="card" onSubmit={handleSubmit} aria-label={title}>
      <div className="cardHeader">
        <div>
          <h2 className="cardTitle">{title}</h2>
          <p className="cardSubtitle">Name is required. Email/phone are optional.</p>
        </div>
        {onCancel ? (
          <button className="btn btnSecondary" type="button" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
        ) : null}
      </div>

      <div className="formGrid">
        <div className="field">
          <label className="label" htmlFor="name">
            Name <span className="req">*</span>
          </label>
          <input
            id="name"
            className={`input ${touched.name && errors.name ? "inputError" : ""}`}
            value={values.name}
            onChange={(e) => updateField("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            placeholder="e.g., Ada Lovelace"
            autoComplete="name"
            disabled={busy}
            aria-invalid={touched.name && !!errors.name}
            aria-describedby={touched.name && errors.name ? "name-error" : undefined}
          />
          {touched.name && errors.name ? (
            <div className="fieldError" id="name-error" role="alert">
              {errors.name}
            </div>
          ) : null}
        </div>

        <div className="field">
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className={`input ${touched.email && errors.email ? "inputError" : ""}`}
            value={values.email}
            onChange={(e) => updateField("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            placeholder="e.g., ada@example.com"
            autoComplete="email"
            disabled={busy}
            aria-invalid={touched.email && !!errors.email}
            aria-describedby={touched.email && errors.email ? "email-error" : undefined}
          />
          {touched.email && errors.email ? (
            <div className="fieldError" id="email-error" role="alert">
              {errors.email}
            </div>
          ) : null}
        </div>

        <div className="field">
          <label className="label" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            className={`input ${touched.phone && errors.phone ? "inputError" : ""}`}
            value={values.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            onBlur={() => handleBlur("phone")}
            placeholder="e.g., +1 (555) 123-4567"
            autoComplete="tel"
            disabled={busy}
            aria-invalid={touched.phone && !!errors.phone}
            aria-describedby={touched.phone && errors.phone ? "phone-error" : undefined}
          />
          {touched.phone && errors.phone ? (
            <div className="fieldError" id="phone-error" role="alert">
              {errors.phone}
            </div>
          ) : null}
        </div>
      </div>

      <div className="cardFooter">
        <button className="btn btnPrimary" type="submit" disabled={busy}>
          {busy ? "Saving..." : submitLabel || "Save"}
        </button>
      </div>
    </form>
  );
}
