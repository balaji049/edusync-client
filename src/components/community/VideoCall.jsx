// src/components/community/VideoCall.jsx
import React, { useEffect, useRef } from "react";
import socket from "../../services/socket";
import {
  registerRemoteStreamSetter,
  handleOffer,
  handleAnswer,
  handleIce,
} from "../../services/webrtcVideo";
import { useCall } from "../../context/CallContext";

const VideoCall = () => {
  const { inCall, callType, remoteStream, setRemoteStream } = useCall();
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    registerRemoteStreamSetter(setRemoteStream);

    socket.on("call:offer", ({ from, offer }) =>
      handleOffer(from, offer)
    );
    socket.on("call:answer", ({ from, answer }) =>
      handleAnswer(from, answer)
    );
    socket.on("call:ice", ({ from, candidate }) =>
      handleIce(from, candidate)
    );

    return () => {
      socket.off("call:offer");
      socket.off("call:answer");
      socket.off("call:ice");
    };
  }, []);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  if (!inCall || callType !== "video") return null;

  return (
    <video
      ref={remoteVideoRef}
      autoPlay
      playsInline
      style={{ width: "240px", background: "#000" }}
    />
  );
};

export default VideoCall;
