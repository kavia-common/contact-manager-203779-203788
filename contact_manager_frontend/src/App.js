import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import ContactForm from "./components/ContactForm";
import ContactsTable from "./components/ContactsTable";
import { createContact, deleteContact, getApiBaseUrl, listContacts, updateContact } from "./api/contacts";

// PUBLIC_INTERFACE
function App() {
  /** Contact Manager SPA: lists contacts and supports add/edit/delete using backend /contacts CRUD. */

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");

  const [mode, setMode] = useState("create"); // create | edit
  const [editing, setEditing] = useState(null);
  const [formBusy, setFormBusy] = useState(false);
  const [rowBusyId, setRowBusyId] = useState("");

  const apiBase = useMemo(() => getApiBaseUrl(), []);

  const selectedId = editing?.id ?? editing?._id ?? editing?.contactId ?? editing?.uuid ?? null;

  async function refresh() {
    setGlobalError("");
    setLoading(true);
    try {
      const data = await listContacts();
      // Accept either raw array or {contacts:[...]}
      const list = Array.isArray(data) ? data : data?.contacts || [];
      // Sort by name for nicer UX
      list.sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
      setContacts(list);
    } catch (e) {
      setGlobalError(e.message || "Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function startCreate() {
    setMode("create");
    setEditing(null);
    setGlobalError("");
  }

  function startEdit(contact) {
    setMode("edit");
    setEditing(contact);
    setGlobalError("");
  }

  async function handleCreate(payload) {
    setFormBusy(true);
    setGlobalError("");
    try {
      const created = await createContact(payload);
      // Optimistically update list; fallback to refresh if backend returns unexpected shape.
      if (created && (created.id || created._id || created.name)) {
        setContacts((prev) => {
          const next = [created, ...prev];
          next.sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
          return next;
        });
      } else {
        await refresh();
      }
      startCreate();
    } catch (e) {
      setGlobalError(e.message || "Failed to create contact.");
    } finally {
      setFormBusy(false);
    }
  }

  async function handleUpdate(payload) {
    if (!selectedId) {
      setGlobalError("Missing contact id for update.");
      return;
    }
    setFormBusy(true);
    setGlobalError("");
    try {
      const updated = await updateContact(selectedId, payload);
      setContacts((prev) => {
        const next = prev.map((c) => {
          const id = c.id ?? c._id ?? c.contactId ?? c.uuid;
          return String(id) === String(selectedId) ? (updated && (updated.id || updated._id) ? updated : { ...c, ...payload }) : c;
        });
        next.sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
        return next;
      });
      startCreate();
    } catch (e) {
      setGlobalError(e.message || "Failed to update contact.");
    } finally {
      setFormBusy(false);
    }
  }

  async function handleDelete(contact) {
    const id = contact?.id ?? contact?._id ?? contact?.contactId ?? contact?.uuid;
    if (!id) {
      setGlobalError("Missing contact id for delete.");
      return;
    }

    const ok = window.confirm(`Delete "${contact?.name || "this contact"}"?`);
    if (!ok) return;

    setGlobalError("");
    setRowBusyId(`delete:${id}`);
    try {
      await deleteContact(id);
      setContacts((prev) => prev.filter((c) => String(c.id ?? c._id ?? c.contactId ?? c.uuid) !== String(id)));
      if (String(selectedId) === String(id)) startCreate();
    } catch (e) {
      setGlobalError(e.message || "Failed to delete contact.");
    } finally {
      setRowBusyId("");
    }
  }

  const initialValues =
    mode === "edit"
      ? {
          name: editing?.name || "",
          email: editing?.email || "",
          phone: editing?.phone || "",
        }
      : { name: "", email: "", phone: "" };

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbarInner">
          <div className="brand">
            <div className="brandMark" aria-hidden="true">
              CM
            </div>
            <div>
              <h1 className="brandTitle">Contact Manager</h1>
              <p className="brandSubtitle">Add, edit, and delete contacts</p>
            </div>
          </div>

          <div className="topbarRight">
            <div className="apiHint" title="Backend API base URL">
              API: <span className="mono">{apiBase}</span>
            </div>
            <button className="btn btnPrimary" type="button" onClick={startCreate} disabled={formBusy}>
              + New contact
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {globalError ? (
          <div className="alert alertError" role="alert">
            <div className="alertTitle">Something went wrong</div>
            <div className="alertText">{globalError}</div>
          </div>
        ) : null}

        <div className="grid">
          <section className="leftCol" aria-label="Contacts list">
            <div className="sectionHeader">
              <h2 className="sectionTitle">Contacts</h2>
              <button className="btn btnSecondary" type="button" onClick={refresh} disabled={loading || formBusy}>
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {loading ? (
              <div className="card skeleton" role="status" aria-live="polite">
                <div className="skeletonLine w60" />
                <div className="skeletonLine w90" />
                <div className="skeletonLine w80" />
              </div>
            ) : (
              <ContactsTable contacts={contacts} onEdit={startEdit} onDelete={handleDelete} busyId={rowBusyId} />
            )}
          </section>

          <section className="rightCol" aria-label="Contact editor">
            <ContactForm
              mode={mode}
              initialValues={initialValues}
              busy={formBusy}
              submitLabel={mode === "edit" ? "Save changes" : "Add contact"}
              onCancel={mode === "edit" ? startCreate : null}
              onSubmit={mode === "edit" ? handleUpdate : handleCreate}
            />

            <div className="card tip">
              <h3 className="tipTitle">Tips</h3>
              <ul className="tipList">
                <li>Click “Edit” to update a contact, then “Save changes”.</li>
                <li>Use “Refresh” if you changed data elsewhere.</li>
                <li>Configure <span className="mono">REACT_APP_API_BASE_URL</span> to point to your backend.</li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="footerInner">
          <span className="muted">Contact Manager • CRUD demo</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
