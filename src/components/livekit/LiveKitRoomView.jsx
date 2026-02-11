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
  const { inCall, roomName, endCall } = useCall();

  const [token, setToken] = useState(null);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!inCall || !roomName) return;

    API.post("/livekit/token", {
      roomName,
      userId: user._id,
      userName: user.name,
    }).then((res) => {
      setToken(res.data.token);
      setUrl(res.data.url);
    });
  }, [inCall, roomName, user]);

  if (!inCall) return null;
  if (!token || !url) return <p>Joining…</p>;

  return (
    <div style={{ height: "420px" }}>
      <LiveKitRoom
        token={token}
        serverUrl={url}
        connect
        audio
        video
        onDisconnected={endCall}
        data-lk-theme="default"
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
};

export default LiveKitRoomView;
