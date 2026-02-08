// src/components/community/VideoButton.jsx
import React, { useRef } from "react";
import socket from "../../services/socket";
import { useCall } from "../../context/CallContext";
import { startVideoCall, endVideoCall } from "../../services/webrtcVideo";

const VideoButton = ({ communityId, channelId }) => {
  const { inCall, callType, startCall, endCall } = useCall();
  const localVideoRef = useRef(null);

  const handleJoin = async () => {
    socket.emit("call:join", {
      communityId,
      channelId,
    });

    socket.once("call:existing-users", async (peers) => {
      const stream = await startVideoCall(peers);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.play();
      }

      startCall("video", `${communityId}:${channelId}`);
    });
  };

  const handleLeave = () => {
    endVideoCall();
    socket.emit("call:leave", { communityId, channelId });
    endCall();
  };

  return (
    <>
      <button
        onClick={inCall && callType === "video" ? handleLeave : handleJoin}
        style={{
          background: inCall ? "#dc2626" : "#2563eb",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: "6px",
          marginLeft: "8px",
        }}
      >
        {inCall && callType === "video"
          ? "Leave Video Call"
          : "Join Video Call"}
      </button>

      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "220px",
          marginTop: "8px",
          borderRadius: "8px",
          background: "#000",
        }}
      />
    </>
  );
};

export default VideoButton;
