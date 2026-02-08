// src/components/community/VideoButton.jsx
import React, { useEffect, useRef } from "react";
import socket from "../../services/socket";
import { useCall } from "../../context/CallContext";
import { startVideoCall, endVideoCall } from "../../services/webrtcVideo";

const VideoButton = ({ communityId, channelId, user }) => {
  const { inCall, callType, startCall, endCall, setLocalStream } = useCall();
  const localVideoRef = useRef(null);

  /* =========================
     JOIN VIDEO CALL
  ========================= */
  const handleJoin = async () => {
    // 1️⃣ Join signaling room
    socket.emit("call:join", {
      communityId,
      channelId,
      user,
    });

    // 2️⃣ Get camera + mic (user gesture)
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setLocalStream(stream);

    // 3️⃣ Local preview
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
      await localVideoRef.current.play().catch(() => {});
    }

    // 4️⃣ Update global call state
    startCall("video", `${communityId}:${channelId}`);
  };

  /* =========================
     HANDLE EXISTING USERS
     (THIS WAS MISSING)
  ========================= */
  useEffect(() => {
    const handleExistingUsers = async (peerSocketIds) => {
      if (!peerSocketIds || peerSocketIds.length === 0) return;

      // 🔥 ONLY the new user calls existing users
      await startVideoCall(peerSocketIds);
    };

    socket.on("call:existing-users", handleExistingUsers);

    return () => {
      socket.off("call:existing-users", handleExistingUsers);
    };
  }, []);

  /* =========================
     LEAVE VIDEO CALL
  ========================= */
  const handleLeave = () => {
    socket.emit("call:leave", { communityId, channelId });
    endVideoCall();
    endCall();
  };

  return (
    <>
      <button
        onClick={inCall && callType === "video" ? handleLeave : handleJoin}
        style={{
          background: inCall ? "#dc2626" : "#2563eb",
          color: "#fff",
          padding: "8px 14px",
          borderRadius: "8px",
          fontWeight: "bold",
          marginRight: "8px",
        }}
      >
        {inCall && callType === "video"
          ? "Leave Video Call"
          : "Join Video Call"}
      </button>

      {/* ✅ LOCAL VIDEO PREVIEW */}
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "240px",
          marginTop: "10px",
          background: "#000",
          borderRadius: "8px",
        }}
      />
    </>
  );
};

export default VideoButton;
