// src/pages/Dashboard/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import PrimaryButton from "../../components/common/PrimaryButton";
import Leaderboard from "../../components/dashboard/Leaderboard";

const DashboardPage = () => {
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    async function fetchCommunities() {
      try {
        const res = await API.get("/community/my");
        setCommunities(res.data);
      } catch (error) {
        console.log("Error fetching:", error);
      }
    }
    fetchCommunities();
  }, []);

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Your learning communities</h1>
          <p className="page-subtitle">
            Join AI-powered spaces for your classes, clubs, and exam prep.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link to="/community/create">
            <PrimaryButton>Create Community</PrimaryButton>
          </Link>

          <Link to="/community/join" className="nav-text-link">
            Join with ID →
          </Link>
        </div>
      </header>

      <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1rem" }}>
        <main>
          <section className="cards-grid">
            {communities.length === 0 ? (
              <div className="card">
                <p>No communities yet. Create or join one to get started!</p>
              </div>
            ) : (
              communities.map((c) => (
                <div className="card" key={c._id}>
                  <h2>{c.name}</h2>
                  <p>{c.description}</p>
                  <Link to={`/community/${c._id}`} className="card-link">
                    Enter community →
                  </Link>
                </div>
              ))
            )}
          </section>
        </main>

        <aside style={{ maxWidth: 420 }}>
          <Leaderboard />
        </aside>
      </div>
    </div>
  );
};

export default DashboardPage;
