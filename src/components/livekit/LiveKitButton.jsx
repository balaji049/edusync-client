import React from "react";
import { useCall } from "../../context/CallContext";

const LiveKitButton = ({ communityId, channelId }) => {
  const { inCall, startVideoCall, endCall } = useCall();

  const handleClick = () => {
    if (inCall) {
      endCall();
    } else {
      // 🔥 MUST match LiveKitRoomView
      const roomName = `community-${communityId}-${channelId}`;
      startVideoCall(roomName);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: "6px 12px",
        background: inCall ? "#dc2626" : "#2563eb",
        color: "#fff",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      {inCall ? "Leave Video Call" : "Join Video Call"}
    </button>
  );
};

export default LiveKitButton;
