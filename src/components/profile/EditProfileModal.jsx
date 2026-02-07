import React, { useState } from "react";
import "./EditProfileModal.css";
import API from "../../services/api";
import PrimaryButton from "../common/PrimaryButton";
import { FaTimes } from "react-icons/fa";

const EditProfileModal = ({ user, onClose, onUpdate }) => {
  const [form, setForm] = useState({
    name: user.name || "",
    headline: user.headline || "",
    bio: user.bio || "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("headline", form.headline);
    formData.append("bio", form.bio);
    if (file) formData.append("avatar", file);

    try {
      const res = await API.put("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });


      onUpdate(res.data.user);
      onClose();
    } catch (err) {
      console.log("Profile update error:", err);
    }
    setLoading(false);
  }

  return (
    <div className="modal-overlay">
      <div className="profile-modal">
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <h2>Edit Profile</h2>

        <form onSubmit={handleSave} className="profile-edit-form">
          <label>
            Full Name
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>

          <label>
            Headline (e.g., "AI/ML Student | Backend Developer")
            <input
              type="text"
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
            />
          </label>

          <label>
            Bio
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
            />
          </label>

          <label>
            Profile Photo
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          </label>

          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
