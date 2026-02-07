import React, { useEffect, useRef, useState } from "react";
import socket from "../services/socket";
//import {
  //loadDevice,
 // createSendTransport,
  //createRecvTransport,
  //produceAudio,
  //consumeAudio,
//} from "../services/mediasoupClient";

export default function VoiceRoom({ roomId }) {
  const [joined, setJoined] = useState(false);
  const audioContainerRef = useRef(null);

  useEffect(() => {
    socket.on("new-producer", async ({ producerId }) => {
      const stream = await consumeAudio(producerId);

      const audio = document.createElement("audio");
      audio.srcObject = stream;
      audio.autoplay = true;
      audio.playsInline = true;

      audioContainerRef.current.appendChild(audio);
    });

    return () => {
      socket.off("new-producer");
    };
  }, []);

  async function joinVoiceRoom() {
    /* 1️⃣ Join room */
    const { routerRtpCapabilities } = await socketRequest(
      "join-voice-room",
      { roomId }
    );

    /* 2️⃣ Load mediasoup device */
    await loadDevice(routerRtpCapabilities);

    /* 3️⃣ Create transports */
    await createSendTransport();
    await createRecvTransport();

    /* 4️⃣ Start producing audio */
    await produceAudio();

    setJoined(true);
  }

  return (
    <div>
      <h3>🎧 Voice Room</h3>

      {!joined && (
        <button onClick={joinVoiceRoom}>
          Join Voice Room
        </button>
      )}

      <div ref={audioContainerRef} />
    </div>
  );
}

/* =========================
   SOCKET REQUEST HELPER
========================= */
function socketRequest(type, data = {}) {
  return new Promise((resolve) => {
    socket.emit(type, data, resolve);
  });
}
