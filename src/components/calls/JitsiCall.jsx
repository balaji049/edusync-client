// src/components/calls/JitsiCall.jsx
import React from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { useCall } from "../../context/CallContext";

const JitsiCall = () => {
  const { callActive, callType, roomName, endCall } = useCall();

  if (!callActive || !roomName) return null;

  return (
    <div style={{ height: "420px", marginBottom: "10px" }}>
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: false,
          startWithVideoMuted: callType === "audio",
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        }}
        getIFrameRef={(iframe) => {
          iframe.style.height = "100%";
          iframe.style.width = "100%";
        }}
        onApiReady={(api) => {
          api.addEventListener("readyToClose", endCall);
        }}
      />
    </div>
  );
};

export default JitsiCall;
