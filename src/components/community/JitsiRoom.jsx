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
      height: mode === "voice" ? 0 : 500, // 🔥 hide video in voice mode

      userInfo: {
        displayName: user?.name || "EduSync User",
      },

      configOverwrite: {
        prejoinPageEnabled: false,
        startWithAudioMuted: false,
        startWithVideoMuted: mode === "voice",
      },

      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS:
          mode === "voice"
            ? ["microphone", "hangup"]
            : undefined,
      },
    });

    return () => api.dispose();
  }, [communityId, channelId, user, mode]);

  /* =========================
     VOICE MODE UI (DISCORD STYLE)
  ========================= */
  if (mode === "voice") {
    return (
      <div
        style={{
          marginTop: "12px",
          padding: "10px",
          background: "#111827",
          color: "#fff",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>🔊 Voice call active</span>

        <button
          onClick={onClose}
          style={{
            background: "#dc2626",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "6px",
            border: "none",
          }}
        >
          Leave
        </button>

        {/* Hidden Jitsi iframe */}
        <div ref={jitsiRef} style={{ display: "none" }} />
      </div>
    );
  }

  /* =========================
     VIDEO MODE UI
  ========================= */
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
