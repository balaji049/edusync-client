import React from "react";

/**
 * CommunitySidebar
 *
 * Responsibilities:
 * - Display fixed list of channels
 * - Highlight active channel
 * - Notify parent when channel changes
 *
 * ❌ No sockets
 * ❌ No API calls
 * ❌ No local state
 */
const CommunitySidebar = ({
  communityId,
  activeChannel,
  onChannelChange,
}) => {
  const channels = [
    { id: "general", label: "# general" },
    { id: "doubts", label: "# doubts" },
    { id: "resources", label: "# resources" },
    { id: "exams", label: "# exams" },
    { id: "ask-ai", label: "# ask-ai" },
  ];

  return (
    <aside className="community-sidebar">
      {/* Community title */}
      <h2 className="community-title">{communityId}</h2>

      {/* Channels */}
      <div className="sidebar-section">
        <p className="sidebar-label">Channels</p>

        <ul className="sidebar-list">
          {channels.map((ch) => (
            <li
              key={ch.id}
              className={`channel-item ${
                ch.id === activeChannel ? "active" : ""
              }`}
              onClick={() => onChannelChange(ch.id)}
            >
              {ch.label}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default CommunitySidebar;

// src/components/community/CommunitySidebar.jsx
/*import React from "react";

const CommunitySidebar = ({
  communityId,
  activeChannel,
  onChannelChange,
}) => {
  const channels = [
    { id: "general", label: "# general" },
    { id: "doubts", label: "# doubts" },
    { id: "resources", label: "# resources" },
    { id: "exams", label: "# exams" },
    { id: "ask-ai", label: "# ask-ai" },
  ];

  return (
    <aside className="community-sidebar">
      <h2 className="community-title">{communityId}</h2>

      <div className="sidebar-section">
        <p className="sidebar-label">Channels</p>

        <ul className="sidebar-list">
          {channels.map((ch) => (
            <li
              key={ch.id}
              className={ch.id === activeChannel ? "active" : ""}
              onClick={() => onChannelChange(ch.id)}
            >
              {ch.label}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default CommunitySidebar;
*/