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

  const audioRefs = useRef(new Map());
  const isHostRef = useRef(false); // 🔑 HOST FLAG

  /* Register stream setter */
  useEffect(() => {
    registerVideoStreamSetter(setVideoStream);
  }, [setVideoStream]);

  /* =========================
     JOIN LOGIC (HOST VS JOINER)
  ========================= */
  useEffect(() => {
    if (!inCall || callType !== "video") return;

    const handleExisting = async (socketIds) => {
      socketIds.forEach((id) => addParticipant(id));

      if (socketIds.length === 0) {
        // 🟢 FIRST USER = HOST
        isHostRef.current = true;
        console.log("🎥 I am host");
      } else {
        // 🔵 JOINER → wait, do NOT create offer
        isHostRef.current = false;
        console.log("🎥 I am joiner");
      }
    };

    const handleUserJoined = async ({ socketId, user }) => {
      addParticipant(socketId, user);

      // 🟢 ONLY HOST CREATES OFFER
      if (isHostRef.current) {
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

    socket.on("call:existing-users", handleExisting);
    socket.on("call:user-joined", handleUserJoined);
    socket.on("call:user-left", handleUserLeft);

    return () => {
      socket.off("call:existing-users", handleExisting);
      socket.off("call:user-joined", handleUserJoined);
      socket.off("call:user-left", handleUserLeft);
    };
  }, [inCall, callType]);

  /* =========================
     WEBRTC SIGNALING
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
    participants.forEach((p) => {
      const stream = videoStreams.get(p.socketId);
      if (!stream || audioRefs.current.has(p.socketId)) return;

      const audio = document.createElement("audio");
      audio.srcObject = stream;
      audio.autoplay = true;
      audio.playsInline = true;
      audio.play().catch(() => {});
      audioRefs.current.set(p.socketId, audio);
    });
  }, [participants, videoStreams]);

  if (!inCall || callType !== "video") return null;

  return (
    <div style={{ padding: 12, background: "#0f172a", borderRadius: 10 }}>
      <div style={{ color: "#fff", marginBottom: 8 }}>
        🎥 Video Call — {participants.size + 1} joined
      </div>
      <VideoGrid />
    </div>
  );
};

export default VideoCall;
