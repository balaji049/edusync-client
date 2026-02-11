import React from "react";
import { useCall } from "../../context/CallContext";

const LiveKitButton = ({ communityId, channelId }) => {
  const { inCall, startVideoCall, endCall } = useCall();

  const roomName = `community-${communityId}-${channelId}`;

  return (
    <button
      onClick={() =>
        inCall ? endCall() : startVideoCall(roomName)
      }
      style={{
        padding: "6px 12px",
        borderRadius: "6px",
        background: inCall ? "#dc2626" : "#2563eb",
        color: "#fff",
      }}
    >
      {inCall ? "Leave Video Call" : "Join Video Call"}
    </button>
  );
};

export default LiveKitButton;
