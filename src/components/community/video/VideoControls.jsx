// src/components/community/video/VideoControls.jsx
import React from "react";
import { useCall } from "../../../context/CallContext";

const VideoControls = () => {
  const { endCall } = useCall();

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginTop: "8px",
      }}
    >
      <button
        style={{
          background: "#dc2626",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
        }}
        onClick={endCall}
      >
        Leave Call
      </button>
    </div>
  );
};

export default VideoControls;
