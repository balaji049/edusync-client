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

  // ✅ SIMPLE room name (LiveKit safe)
  const roomName = `community-${communityId}-${channelId}`;

  useEffect(() => {
    if (!inCall || callType !== "video" || !user) return;

    let cancelled = false;

    const fetchToken = async () => {
      try {
        setLoading(true);

        const response = await API.post("/livekit/token", {
          roomName,
          userId: user._id,
          userName: user.name,
          isHost: true,
        });

        // 🔒 HARD GUARANTEE
        const tokenString = response.data?.token;
        const urlString = response.data?.url;

        console.log("LIVEKIT TOKEN TYPE:", typeof tokenString);
        console.log("LIVEKIT URL:", urlString);

        if (!cancelled) {
          setToken(tokenString);
          setServerUrl(urlString);
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
        token={token}              // ✅ STRING
        serverUrl={serverUrl}      // ✅ wss://xxx.livekit.cloud
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
