// src/components/community/VideoButton.jsx
import React, { useEffect, useRef } from "react";
import socket from "../../services/socket";
import {
  getLocalStream,
  callPeer,
  endVideoCall,
} from "../../services/webrtcVideo";
import { useCall } from "../../context/CallContext";

const VideoButton = ({ communityId, channelId }) => {
  const { inCall, startCall, endCall, setLocalStream } = useCall();
  const localVideoRef = useRef(null);

  const roomId = `video:${communityId}:${channelId}`;

  const handleJoin = async () => {
    const stream = await getLocalStream();
    setLocalStream(stream);

    localVideoRef.current.srcObject = stream;
    localVideoRef.current.muted = true;
    await localVideoRef.current.play();

    socket.emit("call:join", { roomId });
    startCall("video", roomId);
  };

  const handleLeave = () => {
    endVideoCall();
    endCall();
  };

  useEffect(() => {
    socket.on("call:peers", (peers) => {
      peers.forEach(callPeer);
    });

    socket.on("call:user-joined", callPeer);

    return () => {
      socket.off("call:peers");
      socket.off("call:user-joined");
    };
  }, []);

  return (
    <>
      <button onClick={inCall ? handleLeave : handleJoin}>
        {inCall ? "Leave Video Call" : "Join Video Call"}
      </button>

      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{ width: "220px", background: "#000" }}
      />
    </>
  );
};

export default VideoButton;
