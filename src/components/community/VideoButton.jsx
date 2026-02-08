import React, { useRef } from "react";
import socket from "../../services/socket";
import { useCall } from "../../context/CallContext";
import { endVideoCall } from "../../services/webrtcVideo";

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

    // 1️⃣ Enter video mode FIRST
    startCall("video", room);

    // 2️⃣ Get local media (preview only)
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setLocalStream(stream);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
      await localVideoRef.current.play().catch(() => {});
    }

    // 3️⃣ Join signaling room (NO WebRTC start here)
    socket.emit("call:join", {
      communityId,
      channelId,
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
          background:
            inCall && callType === "video" ? "#dc2626" : "#2563eb",
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
