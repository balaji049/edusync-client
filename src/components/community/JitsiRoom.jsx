import { useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

const JitsiRoom = ({
  communityId,
  channelId,
  mode = "video", // "video" | "voice"
  onClose,
}) => {
  const jitsiRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      alert("Jitsi failed to load");
      return;
    }

    const domain = "meet.jit.si";
    const roomName = `edusync-${communityId}-${channelId}`;

    const api = new window.JitsiMeetExternalAPI(domain, {
      roomName,
      parentNode: jitsiRef.current,
      width: "100%",
      height: 500,

      userInfo: {
        displayName: user?.name || "EduSync User",
      },

      configOverwrite: {
        prejoinPageEnabled: false,
        startWithAudioMuted: false,
        startWithVideoMuted: mode === "voice", // 🔥 KEY LINE
      },

      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
      },
    });

    return () => api.dispose();
  }, [communityId, channelId, user, mode]);

  return (
    <div style={{ marginTop: "12px" }}>
      <div ref={jitsiRef} />
      <button
        onClick={onClose}
        style={{
          marginTop: "8px",
          background: "#dc2626",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: "6px",
        }}
      >
        Leave Call
      </button>
    </div>
  );
};

export default JitsiRoom;
