// src/components/community/VideoButton.jsx
import { useEffect } from "react";
import socket from "../../services/socket";
import { useCall } from "../../context/CallContext";
import { startVideoCall, endVideoCall } from "../../services/webrtcVideo";

const VideoButton = ({ communityId, channelId, user }) => {
  const { inCall, callType, startCall, endCall: endCtxCall } = useCall();

  useEffect(() => {
    // When joining, backend tells who is already in call
    socket.on("call:existing-users", async (users) => {
      if (users.length > 0) {
        // NEW USER calls EXISTING user
        await startVideoCall(users[0]);
      }
    });

    return () => {
      socket.off("call:existing-users");
    };
  }, []);

  const handleJoin = () => {
    socket.emit("call:join", {
      communityId,
      channelId,
      user,
    });

    startCall("video", `${communityId}:${channelId}`);
  };

  const handleLeave = () => {
    endVideoCall();
    endCtxCall();

    socket.emit("call:leave", {
      communityId,
      channelId,
    });
  };

  return (
    <button
      onClick={
        inCall && callType === "video" ? handleLeave : handleJoin
      }
      style={{
        background: inCall ? "#dc2626" : "#2563eb",
        color: "#fff",
        padding: "8px 14px",
        borderRadius: "6px",
        marginLeft: "8px",
      }}
    >
      {inCall && callType === "video"
        ? "Leave Video Call"
        : "Join Video Call"}
    </button>
  );
};

export default VideoButton;
