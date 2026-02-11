import React from "react";
import { useCall } from "../../context/CallContext";

const LiveKitButton = ({ communityId, channelId }) => {
  const { inCall, startVideoCall, endCall } = useCall();

  const roomName = `community-${communityId}-${channelId}`;

  const handleClick = () => {
    if (inCall) {
      endCall();                 // ✅ FUNCTION
    } else {
      startVideoCall(roomName);  // ✅ FUNCTION
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: "6px 12px",
        borderRadius: "6px",
        background: inCall ? "#dc2626" : "#2563eb",
        color: "#fff",
        border: "none",
        cursor: "pointer",
      }}
    >
      {inCall ? "Leave Video Call" : "Join Video Call"}
    </button>
  );
};

export default LiveKitButton;
