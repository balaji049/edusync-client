// src/components/livekit/LiveKitRoomView.jsx
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
  const [loading, setLoading] = useState(false);

  // ✅ SIMPLE room name (NO colons)
  const roomName = `community-${communityId}-${channelId}`;

  useEffect(() => {
    if (!inCall || callType !== "video" || !user) return;

    let cancelled = false;

    const fetchToken = async () => {
      try {
        setLoading(true);

        const res = await API.post("/livekit/token", {
          roomName,
          userId: user._id,
          userName: user.name,
          isHost: true,
        });

        /*
          🔥 HARD SAFETY:
          Force token to be STRING no matter what
        */
        const rawToken = res.data?.token;
        const url = res.data?.url;

        const jwt =
          typeof rawToken === "string"
            ? rawToken
            : String(rawToken);

        console.log("LIVEKIT TOKEN TYPE:", typeof jwt);
        console.log("LIVEKIT URL:", url);

        if (!cancelled) {
          setToken(jwt);       // ✅ ALWAYS STRING
          setServerUrl(url);   // ✅ wss://xxxx.livekit.cloud
        }
      } catch (err) {
        console.error("❌ LiveKit token fetch failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchToken();
    return () => {
      cancelled = true;
    };
  }, [inCall, callType, roomName, user]);

  /* =========================
     GUARDS
  ========================= */
  if (!inCall || callType !== "video") return null;

  if (loading || !token || !serverUrl) {
    return (
      <div
        style={{
          height: "420px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#fff",
          borderRadius: "12px",
        }}
      >
        Joining video call…
      </div>
    );
  }

  /* =========================
     RENDER LIVEKIT
  ========================= */
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
        token={token}           // ✅ STRING JWT
        serverUrl={serverUrl}   // ✅ wss://...
        connect={true}
        video={true}
        audio={true}
        onDisconnected={endCall}
        data-lk-theme="default"
        style={{ height: "100%" }}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
};

export default LiveKitRoomView;
