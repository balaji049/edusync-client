import React, { useRef } from "react";
import socket from "../../services/socket";
import { useCall } from "../../context/CallContext";
import {
  startVideoCall,
  endVideoCall,
} from "../../services/webrtcVideo";

const VideoButton = ({ communityId, channelId }) => {
  const {
    inCall,
    callType,
    startCall,
    endCall,
    setLocalStream,
  } = useCall();

  const localVideoRef = useRef(null);

  const handleJoin = async () => {
    const room = `call:${communityId}:${channelId}`;

    /* =========================
       1️⃣ ENTER VIDEO MODE FIRST
       (prevents race conditions)
    ========================= */
    startCall("video", room);

    /* =========================
       2️⃣ JOIN SIGNALING ROOM
    ========================= */
    socket.emit("call:join", {
      communityId,
      channelId,
    });

    /* =========================
       3️⃣ HANDLE EXISTING USERS
    ========================= */
    socket.once("call:existing-users", async (users) => {
      // Start WebRTC (even if users is empty)
      const stream = await startVideoCall(users);

      // Store local stream in context
      setLocalStream(stream);

      // Attach local preview
      if (localVideoRef.current && stream) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true; // local preview only
        localVideoRef.current.playsInline = true;

        try {
          await localVideoRef.current.play();
        } catch (err) {
          console.warn("Local video autoplay blocked", err);
        }
      }
    });
  };

  const handleLeave = () => {
    endVideoCall();

    socket.emit("call:leave", {
      communityId,
      channelId,
    });

    endCall();
  };

  return (
    <>
      <button
        onClick={inCall && callType === "video" ? handleLeave : handleJoin}
        style={{
          background:
            inCall && callType === "video"
              ? "#dc2626"
              : "#2563eb",
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

      {/* Local camera preview */}
      {inCall && callType === "video" && (
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
      )}
    </>
  );
};

export default VideoButton;
