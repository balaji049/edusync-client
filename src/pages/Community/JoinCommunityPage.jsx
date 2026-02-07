import React, { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../../components/common/PrimaryButton";

const JoinCommunityPage = () => {
  const [communityId, setCommunityId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleJoin(e) {
    e.preventDefault();
    setError("");

    try {
      await API.post(`/community/join/${communityId}`);
      navigate(`/community/${communityId}`);
    } catch (err) {
      setError("Invalid or inaccessible community.");
    }
  }

  return (
    <div className="page-container">
      <h1>Join a community 🔗</h1>

      <form className="auth-form" onSubmit={handleJoin}>
        <label>
          Community Invite ID
          <input
            type="text"
            value={communityId}
            onChange={(e) => setCommunityId(e.target.value)}
            required
          />
        </label>

        <PrimaryButton type="submit">Join</PrimaryButton>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default JoinCommunityPage;
