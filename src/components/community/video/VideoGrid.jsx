// src/components/community/video/VideoGrid.jsx
import React from "react";
import { useCall } from "../../../context/CallContext";
import VideoTile from "./VideoTile";

const VideoGrid = () => {
  const { participants } = useCall();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          participants.size <= 1
            ? "1fr"
            : participants.size === 2
            ? "1fr 1fr"
            : "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "10px",
      }}
    >
      {[...participants.values()].map((participant) => (
        <VideoTile
          key={participant.socketId}
          participant={participant}
        />
      ))}
    </div>
  );
};

export default VideoGrid;
