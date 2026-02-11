import React, {
  createContext,
  useContext,
  useState,
} from "react";

/*
  CallContext = SINGLE SOURCE OF TRUTH
  ----------------------------------
  ✅ No WebRTC logic
  ✅ No LiveKit logic
  ✅ No socket.io logic
  👉 Only CALL INTENT + STATE
*/

const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  /* =========================
     CALL SESSION STATE
  ========================= */
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState(null); // "voice" | "video"
  const [callRoom, setCallRoom] = useState(null);

  /* =========================
     HOST (OPTIONAL, FUTURE)
  ========================= */
  const [callHost, setCallHost] = useState(null);

  /* =========================
     PARTICIPANTS (OPTIONAL)
  ========================= */
  const [participants, setParticipants] = useState(new Map());

  /* =========================
     MEDIA (OPTIONAL / FUTURE)
  ========================= */
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [videoStreams, setVideoStreams] = useState(new Map());

  /* =========================
     🔥 LIVEKIT-FRIENDLY ACTIONS
  ========================= */

  // ✅ Used by LiveKitButton
  const startVideoCall = (roomName) => {
    if (!roomName || inCall) return;

    setInCall(true);
    setCallType("video");
    setCallRoom(roomName);
  };

  // (kept for compatibility with older code)
  const startCall = (type, room, hostSocketId = null) => {
    if (inCall) return;

    setInCall(true);
    setCallType(type);
    setCallRoom(room);
    setCallHost(hostSocketId);
  };

  const endCall = () => {
    // UI state first
    setInCall(false);
    setCallType(null);
    setCallRoom(null);
    setCallHost(null);

    // Stop any leftover media (safe even if null)
    localStream?.getTracks().forEach((t) => t.stop());
    remoteStream?.getTracks().forEach((t) => t.stop());
    videoStreams.forEach((stream) => {
      stream.getTracks().forEach((t) => t.stop());
    });

    // Clear memory
    setLocalStream(null);
    setRemoteStream(null);
    setVideoStreams(new Map());
    setParticipants(new Map());
  };

  /* =========================
     PARTICIPANT HELPERS
     (SAFE TO KEEP)
  ========================= */
  const addParticipant = (socketId, user = null) => {
    setParticipants((prev) => {
      if (prev.has(socketId)) return prev;
      const next = new Map(prev);
      next.set(socketId, { socketId, user });
      return next;
    });
  };

  const removeParticipant = (socketId) => {
    setParticipants((prev) => {
      const next = new Map(prev);
      next.delete(socketId);
      return next;
    });

    setVideoStreams((prev) => {
      const next = new Map(prev);
      next.delete(socketId);
      return next;
    });
  };

  return (
    <CallContext.Provider
      value={{
        /* call state */
        inCall,
        callType,
        callRoom,
        callHost,

        /* LiveKit actions */
        startVideoCall, // ✅ REQUIRED
        endCall,        // ✅ REQUIRED

        /* legacy / future */
        startCall,
        setCallHost,

        /* participants */
        participants,
        addParticipant,
        removeParticipant,

        /* media (future-safe) */
        localStream,
        remoteStream,
        videoStreams,
        setLocalStream,
        setRemoteStream,
        setVideoStreams,
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
