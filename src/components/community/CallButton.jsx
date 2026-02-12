/* src/components/community/CallButton.jsx
import React from "react";
import socket from "../../services/socket";
import { useCall } from "../../context/CallContext";
import { initCall, endWebRTCCall } from "../../services/webrtc";

const CallButton = ({ communityId, channelId, user }) => {
  const { inCall, callType, startCall, endCall } = useCall();

  const disabled = inCall && callType !== "voice";

  const handleJoin = async () => {
    //  permission must be inside click
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    socket.emit("call:join", { communityId, channelId, user });

    socket.once("call:existing-users", (users) => {
      if (users.length > 0) {
        initCall(users[0], stream);
      }
      startCall("voice", channelId);
    });
  };

  const handleLeave = () => {
    socket.emit("call:leave", { communityId, channelId });
    endWebRTCCall();
    endCall();
  };

  return (
    <button
      disabled={disabled}
      onClick={inCall && callType === "voice" ? handleLeave : handleJoin}
      style={{
        background:
          inCall && callType === "voice" ? "#dc2626" : "#16a34a",
        color: "#fff",
        padding: "6px 12px",
        borderRadius: "6px",
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {inCall && callType === "voice"
        ? "Leave Voice Call"
        : "Join Voice Call"}
    </button>
  );
};

export default CallButton;
*/