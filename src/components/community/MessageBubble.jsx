// src/components/community/MessageBubble.jsx
import React from "react";
import API from "../../services/api";

/* ============================
   MESSAGE TYPE COLORS
============================ */
const typeStyles = {
  ai: "#4f46e5",
  system: "#374151",
  text: "#1f2937",
  file: "#065f46",
  image: "#7c3aed",
};

const MessageBubble = ({
  type = "text",
  name = "System",
  isSelf = false,
  resource = null,
  children,
}) => {
  /* ============================
     SYSTEM MESSAGE
  ============================ */
  if (type === "system") {
    return (
      <div className="system-message">
        🔔 {children}
      </div>
    );
  }

  /* ============================
     AI MESSAGE
  ============================ */
  if (type === "ai") {
    return (
      <div className="message-row ai">
        <div
          className="message-bubble"
          style={{ background: typeStyles.ai }}
        >
          <div className="message-meta">
            <span className="message-name">
              EduSync AI
            </span>
          </div>
          <div className="message-text">
            {children}
          </div>
        </div>
      </div>
    );
  }

  /* ============================
     FILE / IMAGE MESSAGE
  ============================ */
  if ((type === "file" || type === "image") && resource) {
    const handleView = async () => {
      if (!resource?._id) return;
      try {
        await API.post(
          `/resources/${resource._id}/view`
        );
      } catch (err) {
        console.error("View failed:", err);
      }
    };

    const handleDownload = async () => {
      if (!resource?._id) return;
      try {
        await API.post(
          `/resources/${resource._id}/download`
        );
        window.open(resource.url, "_blank");
      } catch (err) {
        console.error("Download failed:", err);
      }
    };

    return (
      <div
        className={`message-row ${
          isSelf ? "self" : "other"
        }`}
      >
        <div
          className="message-bubble"
          style={{
            background:
              type === "image"
                ? typeStyles.image
                : typeStyles.file,
          }}
        >
          <div className="message-meta">
            <span className="message-name">
              {name}
            </span>
          </div>

          {type === "image" ? (
            <img
              src={resource.url}
              alt={resource.title || "image"}
              className="chat-image-preview"
              onClick={handleView}
            />
          ) : (
            <div className="message-text">
              📎 {resource.title}
            </div>
          )}

          <div className="resource-actions">
            <button onClick={handleView}>
              👁 View
            </button>
            <button onClick={handleDownload}>
              ⬇ Download
            </button>
          </div>

          <div className="resource-stats">
            👁 {resource.views || 0} | ⬇{" "}
            {resource.downloads || 0}
          </div>
        </div>
      </div>
    );
  }

  /* ============================
     DEFAULT TEXT MESSAGE
  ============================ */
  return (
    <div
      className={`message-row ${
        isSelf ? "self" : "other"
      }`}
      style={{
        justifyContent: isSelf
          ? "flex-end"
          : "flex-start",
      }}
    >
      <div
        className="message-bubble"
        style={{ background: typeStyles.text }}
      >
        <div className="message-meta">
          <span className="message-name">
            {name}
          </span>
        </div>

        <div className="message-text">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
