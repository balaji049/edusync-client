import React, { useRef } from "react";
import socket from "../../services/socket";
import { useCall } from "../../context/CallContext";
import { startVideoCall, endVideoCall } from "../../services/webrtcVideo";

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
    // 1️⃣ Join signaling room
    socket.emit("call:join", {
      communityId,
      channelId,
    });

    // 2️⃣ Wait for existing users
    socket.once("call:existing-users", async (users) => {
      // 3️⃣ Start WebRTC if peers exist
      const stream = await startVideoCall(users);

      // 4️⃣ Attach local preview
      if (localVideoRef.current && stream) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.play().catch(() => {});
      }

      // 5️⃣ Update CallContext
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

      {/* Local video preview */}
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
