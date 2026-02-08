import React, {
  createContext,
  useContext,
  useState,
  useRef,
} from "react";

/*
  CallContext is the SINGLE SOURCE OF TRUTH
  for voice + video call state.

  It does NOT know about:
  - WebRTC internals
  - socket.io events
*/

const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  /* =========================
     CALL SESSION STATE
  ========================= */
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState(null); // "voice" | "video"
  const [callRoom, setCallRoom] = useState(null); // call:<community>:<channel>

  /* =========================
     PARTICIPANTS
     socketId -> participant
  ========================= */
  const [participants, setParticipants] = useState(new Map());

  /* =========================
     MEDIA STREAMS
  ========================= */
  const [localStream, setLocalStream] = useState(null);

  // Voice (single remote stream)
  const [remoteStream, setRemoteStream] = useState(null);

  // Video (mesh)
  const [videoStreams, setVideoStreams] = useState(new Map());

  /* =========================
     CALL LIFECYCLE
  ========================= */
  const startCall = (type, room) => {
    // HARD GUARANTEE: only one call at a time
    if (inCall) return;

    setInCall(true);
    setCallType(type);
    setCallRoom(room);
  };

  const endCall = () => {
    // UI state reset FIRST
    setInCall(false);
    setCallType(null);
    setCallRoom(null);

    // Stop local tracks (camera/mic)
    localStream?.getTracks().forEach((t) => t.stop());

    // Stop remote voice
    remoteStream?.getTracks().forEach((t) => t.stop());

    // Stop all remote video streams
    videoStreams.forEach((stream) => {
      stream.getTracks().forEach((t) => t.stop());
    });

    // Clear all state
    setLocalStream(null);
    setRemoteStream(null);
    setVideoStreams(new Map());
    setParticipants(new Map());
  };

  /* =========================
     PARTICIPANT MANAGEMENT
  ========================= */
  const addParticipant = (socketId, user = null) => {
    setParticipants((prev) => {
      if (prev.has(socketId)) return prev;

      const next = new Map(prev);
      next.set(socketId, {
        socketId,
        user,
        joinedAt: Date.now(),
      });
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

  /* =========================
     VIDEO STREAM MANAGEMENT
  ========================= */
  const setVideoStream = (socketId, stream) => {
    setVideoStreams((prev) => {
      const next = new Map(prev);
      next.set(socketId, stream);
      return next;
    });
  };

  const removeVideoStream = (socketId) => {
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

        /* participants */
        participants,
        addParticipant,
        removeParticipant,

        /* media */
        localStream,
        remoteStream,
        videoStreams,

        /* setters */
        setLocalStream,
        setRemoteStream,
        setVideoStream,
        removeVideoStream,

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
