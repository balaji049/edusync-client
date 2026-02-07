import React, { useState } from "react";
import API from "../../services/api";

const GlobalSearch = ({ communityId, onJump }) => {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!q.trim()) return;

    setLoading(true);
    const res = await API.get("/search/messages", {
      params: { q, communityId },
    });
    setResults(res.data);
    setLoading(false);
  };

  return (
    <div className="search-modal">
      <input
        placeholder="Search messages…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && search()}
      />

      {loading && <p>Searching…</p>}

      <ul className="search-results">
        {results.map((r) => (
          <li key={r._id} onClick={() => onJump(r)}>
            <strong>{r.sender.name}</strong>
            <span> #{r.channel}</span>
            <p>{r.text.slice(0, 120)}...</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GlobalSearch;
