import React, { useEffect, useState } from "react";
import {
  LiveKitRoom,
  VideoConference,
} from "@livekit/components-react";
import "@livekit/components-styles";

import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useCall } from "../../context/CallContext";

const LiveKitRoomView = () => {
  const { user } = useAuth();
  const { inCall, callRoom, endCall } = useCall();

  const [token, setToken] = useState(null);
  const [serverUrl, setServerUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!inCall || !callRoom || !user) return;

    let cancelled = false;

    const fetchToken = async () => {
      try {
        setLoading(true);

        const res = await API.post("/livekit/token", {
          roomName: callRoom,
          userId: user._id,
          userName: user.name,
        });

        if (!cancelled) {
          setToken(res.data.token);       // ✅ string JWT
          setServerUrl(res.data.url);     // ✅ wss://xxx.livekit.cloud
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
  }, [inCall, callRoom, user]);

  // Guards
  if (!inCall) return null;

  if (loading || !token || !serverUrl) {
    return <p>Joining…</p>;
  }

  return (
    <div style={{ height: "420px" }}>
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect={inCall}     // 🔥 important
        audio
        video
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
