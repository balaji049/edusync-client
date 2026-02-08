import React, { useEffect, useRef } from "react";
import socket from "../../services/socket";
import { useCall } from "../../context/CallContext";
import VideoGrid from "./video/VideoGrid";
import {
  startVideoCall,
  answerVideoCall,
  handleVideoAnswer,
  handleVideoIce,
  registerVideoStreamSetter,
} from "../../services/webrtcVideo";

const VideoCall = ({ communityId, channelId }) => {
  const {
    inCall,
    callType,
    participants,
    videoStreams,
    addParticipant,
    removeParticipant,
    setVideoStream,
  } = useCall();

  /* 🔊 audio elements per peer (for remote audio) */
  const audioRefs = useRef(new Map());

  /* =========================
     REGISTER VIDEO STREAM SETTER
     (WebRTC → CallContext)
  ========================= */
  useEffect(() => {
    registerVideoStreamSetter(setVideoStream);
  }, [setVideoStream]);

  /* =========================
     SOCKET → PARTICIPANTS
  ========================= */
  useEffect(() => {
    if (!inCall || callType !== "video") return;

    const handleExisting = async (socketIds) => {
      socketIds.forEach((id) => addParticipant(id));

      if (socketIds.length > 0) {
        await startVideoCall(socketIds);
      }
    };

    const handleJoined = async ({ socketId, user }) => {
      addParticipant(socketId, user);
      await startVideoCall([socketId]);
    };

    const handleLeft = ({ socketId }) => {
      removeParticipant(socketId);
      audioRefs.current.delete(socketId);
    };

    socket.on("call:existing-users", handleExisting);
    socket.on("call:user-joined", handleJoined);
    socket.on("call:user-left", handleLeft);

    return () => {
      socket.off("call:existing-users", handleExisting);
      socket.off("call:user-joined", handleJoined);
      socket.off("call:user-left", handleLeft);
    };
  }, [
    inCall,
    callType,
    communityId,
    channelId,
    addParticipant,
    removeParticipant,
  ]);

  /* =========================
     SOCKET → WEBRTC SIGNALING
  ========================= */
  useEffect(() => {
    if (!inCall || callType !== "video") return;

    socket.on("call:offer", ({ offer, from }) =>
      answerVideoCall(offer, from)
    );

    socket.on("call:answer", ({ answer, from }) =>
      handleVideoAnswer(answer, from)
    );

    socket.on("call:ice", ({ candidate, from }) =>
      handleVideoIce(candidate, from)
    );

    return () => {
      socket.off("call:offer");
      socket.off("call:answer");
      socket.off("call:ice");
    };
  }, [inCall, callType]);

  /* =========================
     ATTACH REMOTE AUDIO (CRITICAL)
  ========================= */
  useEffect(() => {
    participants.forEach((participant) => {
      const stream = videoStreams.get(participant.socketId);
      if (!stream) return;

      if (!audioRefs.current.has(participant.socketId)) {
        const audio = document.createElement("audio");
        audio.srcObject = stream;
        audio.autoplay = true;
        audio.playsInline = true;

        audio
          .play()
          .catch((err) =>
            console.warn("🔇 Audio autoplay blocked", err)
          );

        audioRefs.current.set(participant.socketId, audio);
      }
    });
  }, [participants, videoStreams]);

  /* =========================
     RENDER
  ========================= */
  if (!inCall || callType !== "video") return null;

  return (
    <div
      style={{
        marginTop: "10px",
        padding: "12px",
        background: "#0f172a",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          color: "#fff",
          marginBottom: "8px",
          fontSize: "14px",
        }}
      >
        🎥 Video Call — {participants.size} joined
      </div>

      <VideoGrid />
    </div>
  );
};

export default VideoCall;
