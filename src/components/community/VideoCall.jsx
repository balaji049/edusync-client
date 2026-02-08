import React, { useEffect } from "react";
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
    addParticipant,
    removeParticipant,
    setVideoStream,
  } = useCall();

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

    /* Existing users (when I join) */
    socket.on("call:existing-users", async (socketIds) => {
      socketIds.forEach((id) => addParticipant(id));

      // 🔥 I am the caller for existing users
      if (socketIds.length > 0) {
        await startVideoCall(socketIds);
      }
    });

    /* New user joined */
    socket.on("call:user-joined", async ({ socketId, user }) => {
      addParticipant(socketId, user);

      // 🔥 I initiate offer to the new user
      await startVideoCall([socketId]);
    });

    /* User left */
    socket.on("call:user-left", ({ socketId }) => {
      removeParticipant(socketId);
    });

    return () => {
      socket.off("call:existing-users");
      socket.off("call:user-joined");
      socket.off("call:user-left");
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

    socket.on("call:offer", async ({ offer, from }) => {
      await answerVideoCall(offer, from);
    });

    socket.on("call:answer", async ({ answer, from }) => {
      await handleVideoAnswer(answer, from);
    });

    socket.on("call:ice", async ({ candidate, from }) => {
      await handleVideoIce(candidate, from);
    });

    return () => {
      socket.off("call:offer");
      socket.off("call:answer");
      socket.off("call:ice");
    };
  }, [inCall, callType]);

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

      {/* Discord / Zoom style video grid */}
      <VideoGrid />
    </div>
  );
};

export default VideoCall;
