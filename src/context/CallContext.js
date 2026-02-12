import React, {
  createContext,
  useContext,
  useState,
} from "react";

/*
  TEMPORARY SAFE CALL CONTEXT

  Purpose:
  - Prevent app crashes
  - Remove all WebRTC complexity
  - Prepare for Jitsi integration
*/

const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState(null);
  const [callRoom, setCallRoom] = useState(null);

  const startCall = (type, room) => {
    setInCall(true);
    setCallType(type);
    setCallRoom(room);
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
        startCall,
        endCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
