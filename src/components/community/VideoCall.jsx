// src/components/community/VideoCall.jsx
import React, { useEffect, useRef } from "react";
import socket from "../../services/socket";
import {
  registerRemoteStreamHandler,
  answerVideoCall,
  handleVideoAnswer,
  handleVideoIce,
} from "../../services/webrtcVideo";
import { useCall } from "../../context/CallContext";

const VideoCall = () => {
  const { inCall, callType, videoStreams, setVideoStreams } = useCall();
  const containerRef = useRef(null);

  /* =========================
     REGISTER REMOTE STREAM HANDLER
  ========================= */
  useEffect(() => {
    registerRemoteStreamHandler((peerId, stream) => {
      setVideoStreams((prev) => {
        if (prev.some((v) => v.peerId === peerId)) return prev;
        return [...prev, { peerId, stream }];
      });
    });
  }, [setVideoStreams]);

  /* =========================
     SOCKET SIGNALING
  ========================= */
  useEffect(() => {
    socket.on("call:offer", ({ from, offer }) =>
      answerVideoCall(offer, from)
    );

    socket.on("call:answer", ({ from, answer }) =>
      handleVideoAnswer(answer, from)
    );

    socket.on("call:ice", ({ from, candidate }) =>
      handleVideoIce(candidate, from)
    );

    return () => {
      socket.off("call:offer");
      socket.off("call:answer");
      socket.off("call:ice");
    };
  }, []);

  /* =========================
     RENDER REMOTE VIDEOS
  ========================= */
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    videoStreams.forEach(({ peerId, stream }) => {
      const video = document.createElement("video");
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.style.width = "240px";
      video.style.borderRadius = "8px";
      video.style.background = "#000";
      containerRef.current.appendChild(video);
    });
  }, [videoStreams]);

  if (!inCall || callType !== "video") return null;

  return (
    <div style={{ marginTop: "10px" }}>
      <h4>🎥 Video Call</h4>
      <div
        ref={containerRef}
        style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
      />
    </div>
  );
};

export default VideoCall;
