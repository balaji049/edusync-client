import React, { createContext, useContext, useState } from "react";

/*
  CallContext
  ===========
  Single source of truth for call intent.
  No WebRTC / LiveKit logic here.
*/

const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState(null); // "video"
  const [callRoom, setCallRoom] = useState(null);

  // 🔥 Start video call (used by LiveKitButton)
  const startVideoCall = (roomName) => {
    if (!roomName || inCall) return;

    setInCall(true);
    setCallType("video");
    setCallRoom(roomName);
  };

  const endCall = () => {
    setInCall(false);
    setCallType(null);
    setCallRoom(null);
  };

  return (
    <CallContext.Provider
      value={{
        inCall,
        callType,
        callRoom,

        startVideoCall,
        endCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) {
    throw new Error("useCall must be used inside CallProvider");
  }
  return ctx;
};
