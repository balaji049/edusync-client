import React, { useEffect, useState } from "react";
import socket from "../../services/socket";
import {
  startSpeakingDetection,
  stopSpeakingDetection,
} from "../../services/voiceUtils";

const VoiceControls = ({ localStream, room, userId }) => {
  const [muted, setMuted] = useState(false);

  /* =========================
     MUTE / UNMUTE MIC
  ========================= */
  const toggleMute = () => {
    if (!localStream) return;

    const audioTracks = localStream.getAudioTracks();
    if (!audioTracks.length) return;

    audioTracks[0].enabled = muted; // 🔁 toggle mic
    setMuted(!muted);
  };

  /* =========================
     SPEAKING INDICATOR
  ========================= 
  useEffect(() => {
    if (!localStreamgetAudiom || !userId) return;

    startSpeakingDetection(
      localStream,
      () =>
        socket.emit("speaking:start", {
          room,
          userId,
        }),
      () =>
        socket.emit("speaking:stop", {
          room,
          userId,
        })
    );

    return () => {
      stopSpeakingDetection();
      socket.emit("speaking:stop", { room, userId });
    };
  }, [localStream, room, userId]);  */

  return (
    <div style={{ marginTop: "8px" }}>
      <button
        onClick={toggleMute}
        style={{
          background: muted ? "#9ca3af" : "#2563eb",
          color: "#fff",
          padding: "8px 14px",
          borderRadius: "50%",
          fontSize: "18px",
          cursor: "pointer",
          border: "none",
        }}
        title={muted ? "Unmute Mic" : "Mute Mic"}
      >
        {muted ? "🎤❌" : "🎤"}
      </button>
    </div>
  );
};

export default VoiceControls;
