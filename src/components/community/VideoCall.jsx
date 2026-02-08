// src/components/community/VideoCall.jsx
import React, { useEffect, useRef } from "react";
import socket from "../../services/socket";
import {
  answerVideoCall,
  handleVideoAnswer,
  handleVideoIce,
  registerRemoteStreamSetter,
} from "../../services/webrtcVideo";
import { useCall } from "../../context/CallContext";

const VideoCall = () => {
  const { inCall, callType, remoteStream, setRemoteStream } = useCall();

  const remoteVideoRef = useRef(null);

  /* =========================
     REGISTER REMOTE STREAM
  ========================= */
  useEffect(() => {
    registerRemoteStreamSetter(setRemoteStream);
  }, [setRemoteStream]);

  /* =========================
     SOCKET SIGNALING
  ========================= */
  useEffect(() => {
    socket.on("call:offer", async ({ offer, from }) => {
  await answerVideoCall(offer, from);
});

socket.on("call:answer", ({ answer, from }) => {
  handleVideoAnswer(answer, from);
});

socket.on("call:ice", ({ candidate, from }) => {
  handleVideoIce(candidate, from);
});


    return () => {
      socket.off("call:offer");
      socket.off("call:answer");
      socket.off("call:ice");
    };
  }, []);

  /* =========================
     ATTACH REMOTE STREAM
  ========================= */
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current
        .play()
        .catch(() => {});
    }
  }, [remoteStream]);

  if (!inCall || callType !== "video") return null;

  return (
    <div style={{ marginTop: "10px" }}>
      <h4>🎥 Video Call Active</h4>

      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{
          width: "240px",
          background: "#000",
          borderRadius: "8px",
        }}
      />
    </div>
  );
};

export default VideoCall;
