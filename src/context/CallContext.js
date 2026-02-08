import React, {
  createContext,
  useContext,
  useState,
} from "react";

const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  /* =========================
     CALL SESSION STATE
  ========================= */
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState(null); // "voice" | "video"
  const [callChannel, setCallChannel] = useState(null); // channelId or roomId

  /* =========================
     PARTICIPANTS (WHO)
     socketId -> participant
  ========================= */
  const [participants, setParticipants] = useState(
    new Map()
  );

  /* =========================
     MEDIA STREAMS (HOW)
  ========================= */
  const [localStream, setLocalStream] = useState(null);

  // Voice (1-to-1)
  const [remoteStream, setRemoteStream] = useState(null);

  // Video (mesh)
  const [videoStreams, setVideoStreams] = useState(
    new Map()
  );

  /* =========================
     CALL LIFECYCLE
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

    // stop local media
    localStream?.getTracks().forEach((t) => t.stop());

    // stop remote voice
    remoteStream?.getTracks().forEach((t) => t.stop());

    // stop all remote videos
    videoStreams.forEach((stream) => {
      stream.getTracks().forEach((t) => t.stop());
    });

    setLocalStream(null);
    setRemoteStream(null);
    setVideoStreams(new Map());
    setParticipants(new Map());
  };

  /* =========================
     PARTICIPANT MANAGEMENT
  ========================= */
  const addParticipant = (socketId, user) => {
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
        callChannel,

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
