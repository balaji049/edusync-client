// src/components/community/VideoCall.jsx
import { useEffect, useRef } from "react";
import socket from "../../services/socket";
import {
  answerVideoCall,
  handleVideoAnswer,
  handleVideoIce,
  registerRemoteStreamSetter,
} from "../../services/webrtcVideo";
import { useCall } from "../../context/CallContext";

const VideoCall = () => {
  const { inCall, callType, remoteStream, setRemoteStream } =
    useCall();

  const remoteVideoRef = useRef(null);

  /* Register remote stream setter */
  useEffect(() => {
    registerRemoteStreamSetter(setRemoteStream);
  }, [setRemoteStream]);

  /* Socket signaling */
  useEffect(() => {
    socket.on("call:offer", async ({ offer, from }) => {
      await answerVideoCall(offer, from);
    });

    socket.on("call:answer", ({ answer }) => {
      handleVideoAnswer(answer);
    });

    socket.on("call:ice", ({ candidate }) => {
      handleVideoIce(candidate);
    });

    return () => {
      socket.off("call:offer");
      socket.off("call:answer");
      socket.off("call:ice");
    };
  }, []);

  /* Attach remote stream */
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!inCall || callType !== "video") return null;

  return (
    <div style={{ marginTop: "12px" }}>
      <h4>🎥 Remote Video</h4>
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{
          width: "260px",
          background: "#000",
          borderRadius: "8px",
        }}
      />
    </div>
  );
};

export default VideoCall;
