import React, { useState } from "react";
import API from "../../services/api";
import PrimaryButton from "../common/PrimaryButton";

const AddResourceModal = ({ communityId, onClose }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "note",
    link: "",
  });

  const [file, setFile] = useState(null);

  async function submit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("communityId", communityId);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("type", form.type);
    if (file) formData.append("file", file);
    if (form.link) formData.append("link", form.link);

    await API.post("/resources", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });


    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>Add Resource</h2>

        <form onSubmit={submit} className="auth-form">
          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>

          <label>
            Type
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="note">Note</option>
              <option value="link">Link</option>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
            </select>
          </label>

          {form.type === "link" ? (
            <label>
              Link
              <input
                value={form.link}
                onChange={(e) =>
                  setForm({ ...form, link: e.target.value })
                }
                placeholder="https://docs.google.com/..."
              />
            </label>
          ) : (
            <>
              <label>Upload File</label>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            </>
          )}

          <div className="modal-actions">
            <PrimaryButton type="submit">Save</PrimaryButton>
            <button className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResourceModal;
