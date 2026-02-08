import React from "react";
import { useCall } from "../../context/CallContext";

const LiveKitButton = ({ communityId, channelId }) => {
  const { inCall, callType, startCall, endCall } = useCall();

  const room = `call:${communityId}:${channelId}`;

  const handleJoin = () => {
    startCall("video", room);
  };

  const handleLeave = () => {
    endCall();
  };

  return (
    <button
      onClick={inCall ? handleLeave : handleJoin}
      style={{
        background: inCall ? "#dc2626" : "#2563eb",
        color: "#fff",
        padding: "6px 12px",
        borderRadius: "6px",
      }}
    >
      {inCall ? "Leave Video Call" : "Join Video Call"}
    </button>
  );
};

export default LiveKitButton;
