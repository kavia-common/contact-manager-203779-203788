import React from "react";

// PUBLIC_INTERFACE
export default function ContactsTable({ contacts, onEdit, onDelete, busyId }) {
  /** Table view for contacts with row actions. */
  if (!contacts || contacts.length === 0) {
    return (
      <div className="card emptyState" role="status" aria-live="polite">
        <h3 className="emptyTitle">No contacts yet</h3>
        <p className="emptyText">Add your first contact to get started.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="tableWrap" role="region" aria-label="Contacts table" tabIndex={0}>
        <table className="table">
          <thead>
            <tr>
              <th className="th">Name</th>
              <th className="th hideSm">Email</th>
              <th className="th">Phone</th>
              <th className="th actionsCol">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => {
              const id = c.id ?? c._id ?? c.contactId ?? c.uuid ?? c.email ?? c.name;
              const deleting = busyId === `delete:${id}`;
              return (
                <tr key={String(id)}>
                  <td className="td">
                    <div className="nameCell">
                      <div className="avatar" aria-hidden="true">
                        {(c.name || "?").trim().slice(0, 1).toUpperCase()}
                      </div>
                      <div className="nameMeta">
                        <div className="name">{c.name || "-"}</div>
                        <div className="sub hideMd">{c.email || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="td hideSm">{c.email || "—"}</td>
                  <td className="td">{c.phone || "—"}</td>
                  <td className="td actionsCol">
                    <div className="rowActions">
                      <button
                        className="btn btnSecondary btnSmall"
                        type="button"
                        onClick={() => onEdit(c)}
                        disabled={deleting}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btnDanger btnSmall"
                        type="button"
                        onClick={() => onDelete(c)}
                        disabled={deleting}
                        aria-busy={deleting}
                      >
                        {deleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
