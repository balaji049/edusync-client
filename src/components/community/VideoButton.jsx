import React, { useEffect, useRef } from "react";
import socket from "../../services/socket";
import { useCall } from "../../context/CallContext";
import { endVideoCall } from "../../services/webrtcVideo";

const VideoButton = ({ communityId, channelId }) => {
  const {
    inCall,
    callType,
    callHost,
    startCall,
    endCall,
    setLocalStream,
    setCallHost,
  } = useCall();

  const localVideoRef = useRef(null);
  const room = `call:${communityId}:${channelId}`;

  /* =========================
     RECEIVE CALL STATE
  ========================= */
  useEffect(() => {
    const handleCallState = ({ hostSocketId }) => {
      setCallHost(hostSocketId);
    };

    const handleHostChanged = ({ hostSocketId }) => {
      setCallHost(hostSocketId);
    };

    socket.on("call:state", handleCallState);
    socket.on("call:host-changed", handleHostChanged);

    return () => {
      socket.off("call:state", handleCallState);
      socket.off("call:host-changed", handleHostChanged);
    };
  }, [setCallHost]);

  /* =========================
     START / JOIN CALL
  ========================= */
  const handleJoin = async () => {
    startCall("video", room);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setLocalStream(stream);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
      await localVideoRef.current.play().catch(() => {});
    }

    socket.emit("call:join", {
      communityId,
      channelId,
    });
  };

  const handleLeave = () => {
    endVideoCall();
    socket.emit("call:leave", { communityId, channelId });
    endCall();
  };

  /* =========================
     UI LOGIC
  ========================= */
  const callExists = !!callHost;
  const isInVideo = inCall && callType === "video";

  let buttonText = "Start Video Call";
  if (callExists && !isInVideo) buttonText = "Join Video Call";
  if (isInVideo) buttonText = "Leave Video Call";

  let onClick = handleJoin;
  if (isInVideo) onClick = handleLeave;

  return (
    <>
      <button
        onClick={onClick}
        style={{
          background: isInVideo ? "#dc2626" : "#2563eb",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: "6px",
          marginLeft: "8px",
        }}
      >
        {buttonText}
      </button>

      {isInVideo && (
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: "220px",
            marginTop: "8px",
            borderRadius: "8px",
            background: "#000",
          }}
        />
      )}
    </>
  );
};

export default VideoButton;
