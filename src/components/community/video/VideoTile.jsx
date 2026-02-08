// src/components/community/video/VideoTile.jsx
import React, { useEffect, useRef } from "react";
import { useCall } from "../../../context/CallContext";

const VideoTile = ({ participant }) => {
  const { videoStreams } = useCall();
  const videoRef = useRef(null);

  const stream = videoStreams.get(participant.socketId);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  return (
    <div
      style={{
        position: "relative",
        background: "#020617",
        borderRadius: "10px",
        overflow: "hidden",
        height: "160px",
      }}
    >
      {stream ? (
        <video
  ref={videoRef}
  autoPlay
  playsInline
  muted={false}   // 🔥 IMPORTANT
  onLoadedMetadata={() => {
    videoRef.current?.play().catch(console.warn);
  }}
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover",
    background: "#000",
  }}
/>

      ) : (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            fontSize: "14px",
          }}
        >
          📷 Camera Off
        </div>
      )}

      {/* Name badge */}
      <div
        style={{
          position: "absolute",
          bottom: "4px",
          left: "6px",
          background: "rgba(0,0,0,0.6)",
          padding: "2px 6px",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#fff",
        }}
      >
        {participant.user?.name || "User"}
      </div>
    </div>
  );
};

export default VideoTile;
