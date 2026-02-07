// src/components/community/VideoButton.jsx
import React, { useRef } from "react";
import socket from "../../services/socket";
import { useCall } from "../../context/CallContext";
import { startVideoCall, endVideoCall } from "../../services/webrtcVideo";

const VideoButton = ({ communityId, channelId, user }) => {
  const { inCall, callType, startCall, endCall } = useCall();
  const localVideoRef = useRef(null);

  const handleJoin = async () => {
    // 1️⃣ Join signaling room
    socket.emit("call:join", {
      communityId,
      channelId,
      user,
    });

    // 2️⃣ Wait for existing users
    socket.once("call:existing-users", async (peers) => {
      // 3️⃣ Start WebRTC (send offers to peers)
      const stream = await startVideoCall(peers);

      // 4️⃣ Local preview
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.playsInline = true;
        localVideoRef.current
          .play()
          .catch(() => {});
      }

      // 5️⃣ Update global call state
      startCall("video", `${communityId}:${channelId}`);
    });
  };

  const handleLeave = () => {
    endVideoCall();
    endCall();

    socket.emit("call:leave", {
      communityId,
      channelId,
    });
  };

  return (
    <>
      <button
        onClick={inCall && callType === "video" ? handleLeave : handleJoin}
        style={{
          background:
            inCall && callType === "video" ? "#dc2626" : "#2563eb",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: "6px",
          marginLeft: "8px",
          cursor: "pointer",
        }}
      >
        {inCall && callType === "video"
          ? "Leave Video Call"
          : "Join Video Call"}
      </button>

      {/* ✅ LOCAL PREVIEW */}
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
