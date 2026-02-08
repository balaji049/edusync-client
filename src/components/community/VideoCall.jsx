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
    callHost,
    participants,
    videoStreams,
    addParticipant,
    removeParticipant,
    setVideoStream,
  } = useCall();

  /* =========================
     REMOTE AUDIO ELEMENTS
  ========================= */
  const audioRefs = useRef(new Map());

  /* =========================
     REGISTER VIDEO STREAM SETTER
  ========================= */
  useEffect(() => {
    registerVideoStreamSetter(setVideoStream);
  }, [setVideoStream]);

  /* =========================
     SOCKET → CALL STATE
  ========================= */
  useEffect(() => {
    if (!inCall || callType !== "video") return;

    const handleCallState = ({ hostSocketId, participants }) => {
      participants.forEach((id) => addParticipant(id));

      // 🔥 HOST creates offers to existing participants
      if (hostSocketId === socket.id) {
        const others = participants.filter(
          (id) => id !== socket.id
        );
        if (others.length > 0) {
          startVideoCall(others);
        }
      }
    };

    const handleUserJoined = async ({ socketId, user }) => {
      addParticipant(socketId, user);

      // 🔥 ONLY HOST CREATES OFFER
      if (callHost === socket.id) {
        await startVideoCall([socketId]);
      }
    };

    const handleUserLeft = ({ socketId }) => {
      removeParticipant(socketId);

      const audio = audioRefs.current.get(socketId);
      if (audio) {
        audio.pause();
        audio.srcObject = null;
        audioRefs.current.delete(socketId);
      }
    };

    socket.on("call:state", handleCallState);
    socket.on("call:user-joined", handleUserJoined);
    socket.on("call:user-left", handleUserLeft);

    return () => {
      socket.off("call:state", handleCallState);
      socket.off("call:user-joined", handleUserJoined);
      socket.off("call:user-left", handleUserLeft);
    };
  }, [
    inCall,
    callType,
    callHost,
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
     ATTACH REMOTE AUDIO
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

        audio.play().catch(() => {});
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
