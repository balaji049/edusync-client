// src/components/community/ChatSearchBar.jsx
import React, { useState } from "react";
import API from "../../services/api";

const ChatSearchBar = ({ communityId, onResults, onQuery }) => {
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;

    onQuery?.(query); // ✅ SAFE
    setLoading(true);

    try {
      const params = {
        q: query,
        communityId,
      };

      if (channel) params.channel = channel;
      if (from) params.from = from;

      // ✅ include full day for "to" date
      if (to) {
        const endOfDay = new Date(to);
        endOfDay.setHours(23, 59, 59, 999);
        params.to = endOfDay.toISOString();
      }

      const res = await API.get("/search/messages", { params });
      onResults(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-search-bar">
      {/* 🔍 QUERY */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search messages..."
        onKeyDown={(e) => e.key === "Enter" && search()}
      />

      {/* 🎛 FILTERS */}
      <div className="search-filters">
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        >
          <option value="">All Channels</option>
          <option value="general">#general</option>
          <option value="doubts">#doubts</option>
          <option value="resources">#resources</option>
          <option value="exams">#exams</option>
          <option value="ask-ai">#ask-ai</option>
        </select>

        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />

        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      {/* 🔘 ACTION */}
      <button onClick={search} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>
    </div>
  );
};

export default ChatSearchBar;
