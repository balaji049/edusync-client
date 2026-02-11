// src/context/CallContext.js
import React, { createContext, useContext, useState } from "react";

const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState(null); // "audio" | "video"
  const [roomName, setRoomName] = useState(null);

  const startCall = (type, room) => {
    setCallType(type);
    setRoomName(room);
    setCallActive(true);
  };

  const endCall = () => {
    setCallActive(false);
    setCallType(null);
    setRoomName(null);
  };

  return (
    <CallContext.Provider
      value={{
        callActive,
        callType,
        roomName,
        startCall,
        endCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
