import React, { useRef } from "react";
import socket from "../../services/socket";
import { useCall } from "../../context/CallContext";
import {
  startVideoCall,
  endVideoCall,
} from "../../services/webrtcVideo";

const VideoButton = ({ communityId, channelId, user }) => {
  const {
    inCall,
    callType,
    startCall,
    endCall,
    setLocalStream,
  } = useCall();

  const localVideoRef = useRef(null);

  /* =========================
     JOIN VIDEO CALL
  ========================= */
  const handleJoin = async () => {
    const room = `call:${communityId}:${channelId}`;

    // 1️⃣ Join call room (socket)
    socket.emit("call:join", {
      communityId,
      channelId,
      user,
    });

    // 2️⃣ Receive existing users → start WebRTC
    socket.once("call:existing-users", async (peers) => {
      const stream = await startVideoCall(peers);

      setLocalStream(stream);

      // 3️⃣ Local preview
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.playsInline = true;
        await localVideoRef.current.play();
      }

      // 4️⃣ Update global state
      startCall("video", room);
    });
  };

  /* =========================
     LEAVE VIDEO CALL
  ========================= */
  const handleLeave = () => {
    socket.emit("call:leave", {
      communityId,
      channelId,
    });

    endVideoCall();
    endCall();
  };

  return (
    <div style={{ marginTop: "8px" }}>
      <button
        onClick={
          inCall && callType === "video"
            ? handleLeave
            : handleJoin
        }
        style={{
          background:
            inCall && callType === "video"
              ? "#dc2626"
              : "#2563eb",
          color: "#fff",
          padding: "8px 14px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          fontWeight: "600",
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
          width: "220px",
          marginTop: "10px",
          background: "#000",
          borderRadius: "8px",
        }}
      />
    </div>
  );
};

export default VideoButton;
