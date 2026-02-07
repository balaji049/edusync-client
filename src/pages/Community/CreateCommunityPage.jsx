import React, { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../../components/common/PrimaryButton";

const CreateCommunityPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/community/create", form);
      navigate(`/community/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create community");
    }
  }

  return (
    <div className="page-container">
      <h1>Create your learning community 🎓</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Community Name
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <PrimaryButton type="submit">Create Community</PrimaryButton>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default CreateCommunityPage;
