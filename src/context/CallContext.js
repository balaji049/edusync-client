// frontend/src/context/CallContext.js
import React, { createContext, useContext, useState } from "react";

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  /* =========================
     CALL STATE
  ========================= */
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState(null); // "voice" | "video" | null
  const [callChannel, setCallChannel] = useState(null);

  /* =========================
     MEDIA STREAMS (P2P)
  ========================= */
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  /* =========================
     CONTROLS
  ========================= */
  const startCall = (type, channelId) => {
    setInCall(true);
    setCallType(type);
    setCallChannel(channelId);
  };

  const endCall = () => {
    setInCall(false);
    setCallType(null);
    setCallChannel(null);

    // cleanup streams
    localStream?.getTracks().forEach((t) => t.stop());
    remoteStream?.getTracks().forEach((t) => t.stop());

    setLocalStream(null);
    setRemoteStream(null);
  };

  return (
    <CallContext.Provider
      value={{
        /* state */
        inCall,
        callType,
        callChannel,

        /* media */
        localStream,
        remoteStream,

        /* setters */
        setLocalStream,
        setRemoteStream,

        /* actions */
        startCall,
        endCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
