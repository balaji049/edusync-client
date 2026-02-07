import React, { useEffect, useRef, useState } from "react";
import socket from "../../services/socket";
import {
  answerCall,
  handleAnswer,
  handleIce,
  registerRemoteStreamSetter,
} from "../../services/webrtc";
import { useCall } from "../../context/CallContext";
import { useAuth } from "../../context/AuthContext";
import VoiceControls from "./VoiceControls";

const VoiceCall = ({ communityId, channelId }) => {
  const { inCall, callType, remoteStream, setRemoteStream } = useCall();
  const { user } = useAuth();

  const audioRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);

  /* =========================
     REGISTER REMOTE STREAM
  ========================= */
  useEffect(() => {
    registerRemoteStreamSetter(setRemoteStream);
  }, [setRemoteStream]);

  /* =========================
     SOCKET EVENTS
  ========================= */
  useEffect(() => {
    socket.on("call:offer", ({ offer, from }) => {
      answerCall(offer, from);
    });

    socket.on("call:answer", ({ answer }) => {
      handleAnswer(answer);
    });

    socket.on("call:ice", ({ candidate }) => {
      handleIce(candidate);
    });

    return () => {
      socket.off("call:offer");
      socket.off("call:answer");
      socket.off("call:ice");
    };
  }, []);

  /* =========================
     ATTACH REMOTE AUDIO
  ========================= */
  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
      audioRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  /* =========================
     CAPTURE LOCAL MIC STREAM
  ========================= */
  useEffect(() => {
    if (!inCall || callType !== "voice") return;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(setLocalStream)
      .catch(console.error);

    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, [inCall, callType]);

  if (!inCall || callType !== "voice") return null;

  return (
    <div className="voice-call-panel">
      <p>🔊 Voice Call Active</p>

      {/* Remote audio */}
      <audio ref={audioRef} autoPlay playsInline />

      {/* Voice controls (MUTE + SPEAKING INDICATOR) */}
      <VoiceControls
        localStream={localStream}
        room={`call:${communityId}:${channelId}`}
        userId={user?._id}
      />
    </div>
  );
};

export default VoiceCall;
