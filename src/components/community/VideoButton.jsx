// src/components/community/VideoButton.jsx
import React, { useEffect, useRef } from "react";
import socket from "../../services/socket";
import {
  startVideoCall,
  endVideoCall,
} from "../../services/webrtcVideo";
import { useCall } from "../../context/CallContext";

const VideoButton = ({ communityId, channelId, user }) => {
  const { inCall, callType, startCall, endCall } = useCall();
  const localVideoRef = useRef(null);

  const handleJoin = () => {
    socket.emit("call:join", {
      communityId,
      channelId,
      user,
    });

    startCall("video", `${communityId}:${channelId}`);
  };

  const handleLeave = () => {
    socket.emit("call:leave", { communityId, channelId });
    endVideoCall();
    endCall();
  };

  useEffect(() => {
    socket.on("call:existing-users", async (peerIds) => {
      if (peerIds.length === 0) return;

      const stream = await startVideoCall(peerIds);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.playsInline = true;
      }
    });

    socket.on("call:user-joined", async ({ socketId }) => {
      const stream = await startVideoCall([socketId]);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.playsInline = true;
      }
    });

    return () => {
      socket.off("call:existing-users");
      socket.off("call:user-joined");
    };
  }, []);

  return (
    <>
      <button
        onClick={inCall && callType === "video" ? handleLeave : handleJoin}
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
