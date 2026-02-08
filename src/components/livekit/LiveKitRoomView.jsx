import React, { useEffect, useState } from "react";
import {
  LiveKitRoom,
  VideoConference,
} from "@livekit/components-react";
import "@livekit/components-styles";

import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useCall } from "../../context/CallContext";

const LiveKitRoomView = ({ communityId, channelId }) => {
  const { user } = useAuth();
  const { inCall, callType, endCall } = useCall();

  const [token, setToken] = useState(null);
  const [serverUrl, setServerUrl] = useState(null);

  const roomName = `call:${communityId}:${channelId}`;

  /* =========================
     FETCH TOKEN
  ========================= */
  useEffect(() => {
    if (!inCall || callType !== "video") return;

    const fetchToken = async () => {
      const res = await API.post("/livekit/token", {
        roomName,
        userId: user._id,
        userName: user.name,
        isHost: true, // safe for now
      });

      setToken(res.data.token);
      setServerUrl(res.data.url);
    };

    fetchToken().catch(console.error);
  }, [inCall, callType, roomName, user]);

  if (!inCall || callType !== "video") return null;
  if (!token || !serverUrl) return <p>Joining video call…</p>;

  return (
    <div
      style={{
        height: "420px",
        background: "#0f172a",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        video={true}
        audio={true}
        onDisconnected={endCall}
        data-lk-theme="default"
        style={{ height: "100%" }}
      >
        {/* ✅ ONE COMPONENT HANDLES EVERYTHING */}
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
};

export default LiveKitRoomView;
