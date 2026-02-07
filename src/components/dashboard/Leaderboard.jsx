import React, { useEffect, useState } from "react";
import API from "../../services/api";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchBoard() {
      setLoading(true);
      setError(null);
      try {
        const res = await API.get("/users/leaderboard");
        if (!mounted) return;
        setLeaders(res.data || []);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
        if (!mounted) return;
        setError("Failed to load leaderboard");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchBoard();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="leaderboard card">
        <h2>🏆 Top Learners</h2>
        <p>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard card">
        <h2>🏆 Top Learners</h2>
        <p className="muted">Error: {error}</p>
      </div>
    );
  }

  if (leaders.length === 0) {
    return (
      <div className="leaderboard card">
        <h2>🏆 Top Learners</h2>
        <p className="muted">No leaderboard data yet. Encourage your community to participate!</p>
      </div>
    );
  }

  return (
    <div className="leaderboard card">
      <h2>🏆 Top Learners</h2>

      <ol className="leader-list">
        {leaders.map((u, index) => {
          const rank = index + 1;
          const medal = rank <= 3 ? ["gold", "silver", "bronze"][rank - 1] : null;
          const avatar =
            (u.profile && u.profile.avatarUrl) ||
            u.profile?.avatarUrl ||
            null;

          return (
            <li key={u._id} className="leader-item">
              <div className="leader-left">
                <div className={`rank-badge ${medal || ""}`}>{rank}</div>

                <div className="leader-meta">
                  <div className="leader-name">
                    {avatar ? (
                      <img
                        src={
                          avatar.startsWith("http")
                            ? avatar
                            : `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${avatar}`
                        }
                        alt={`${u.name} avatar`}
                        className="leader-avatar"
                      />
                    ) : (
                      <div className="leader-avatar placeholder">{(u.name || "U").charAt(0)}</div>
                    )}
                    <div>
                      <div className="name">{u.name}</div>
                      <div className="sub muted">{u.role}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="leader-right">
                <div className="points">{u.points ?? 0} pts</div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default Leaderboard;
