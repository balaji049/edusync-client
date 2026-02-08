import socket from "./socket";

/* =========================
   ICE CONFIG (STUN + TURN)
   🔥 REQUIRED FOR RENDER
========================= */
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.relay.metered.ca:80" },

    {
      urls: "turn:global.relay.metered.ca:80",
      username: process.env.REACT_APP_TURN_USERNAME,
      credential: process.env.REACT_APP_TURN_CREDENTIAL,
    },
    {
      urls: "turn:global.relay.metered.ca:80?transport=tcp",
      username: process.env.REACT_APP_TURN_USERNAME,
      credential: process.env.REACT_APP_TURN_CREDENTIAL,
    },
    {
      urls: "turn:global.relay.metered.ca:443",
      username: process.env.REACT_APP_TURN_USERNAME,
      credential: process.env.REACT_APP_TURN_CREDENTIAL,
    },
    {
      urls: "turns:global.relay.metered.ca:443?transport=tcp",
      username: process.env.REACT_APP_TURN_USERNAME,
      credential: process.env.REACT_APP_TURN_CREDENTIAL,
    },
  ],
};


/* =========================
   MODULE STATE (SINGLETON)
========================= */

// peerSocketId → RTCPeerConnection
const peerConnections = new Map();

// peerSocketId → MediaStream
const remoteStreams = new Map();

// peerSocketId → queued ICE
const pendingIce = new Map();

let localStream = null;
let setVideoStreamFn = null;

/* =========================
   REGISTER STREAM SETTER
   (VideoCall → CallContext)
========================= */
export function registerVideoStreamSetter(fn) {
  setVideoStreamFn = fn;
}

/* =========================
   GET LOCAL MEDIA (ONCE)
========================= */
async function getLocalStream() {
  if (localStream) return localStream;

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  return localStream;
}

/* =========================
   CREATE PEER CONNECTION
========================= */
function createPeerConnection(peerSocketId) {
  if (peerConnections.has(peerSocketId)) {
    return peerConnections.get(peerSocketId);
  }

  const pc = new RTCPeerConnection(ICE_SERVERS);

  peerConnections.set(peerSocketId, pc);
  pendingIce.set(peerSocketId, []);

  /* ICE → signaling */
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("call:ice", {
        to: peerSocketId,
        candidate: event.candidate,
      });
    }
  };

  /* Remote tracks (video + audio) */
  pc.ontrack = ({ streams }) => {
    const stream = streams[0];
    if (!stream) return;

    if (!remoteStreams.has(peerSocketId)) {
      remoteStreams.set(peerSocketId, stream);
      setVideoStreamFn?.(peerSocketId, stream);
    }
  };

  return pc;
}

/* =========================
   START VIDEO CALL (CALLER)
   🔥 ONLY HOST CALLS THIS
========================= */
export async function startVideoCall(peerSocketIds = []) {
  const stream = await getLocalStream();

  for (const peerId of peerSocketIds) {
    if (peerConnections.has(peerId)) continue;

    const pc = createPeerConnection(peerId);

    // Add local tracks BEFORE offer
    stream.getTracks().forEach((track) =>
      pc.addTrack(track, stream)
    );

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("call:offer", {
      to: peerId,
      offer,
    });
  }

  return stream;
}

/* =========================
   ANSWER VIDEO CALL
========================= */
export async function answerVideoCall(offer, from) {
  const stream = await getLocalStream();
  const pc = createPeerConnection(from);

  // 1️⃣ Set remote SDP first
  await pc.setRemoteDescription(offer);

  // 2️⃣ Add local tracks after SDP
  stream.getTracks().forEach((track) =>
    pc.addTrack(track, stream)
  );

  // 3️⃣ Flush queued ICE
  const queued = pendingIce.get(from) || [];
  for (const candidate of queued) {
    await pc.addIceCandidate(candidate);
  }
  pendingIce.set(from, []);

  // 4️⃣ Answer
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  socket.emit("call:answer", {
    to: from,
    answer,
  });

  return stream;
}

/* =========================
   HANDLE ANSWER (CALLER)
========================= */
export async function handleVideoAnswer(answer, from) {
  const pc = peerConnections.get(from);
  if (!pc) return;

  if (!pc.currentRemoteDescription) {
    await pc.setRemoteDescription(answer);
  }

  const queued = pendingIce.get(from) || [];
  for (const candidate of queued) {
    await pc.addIceCandidate(candidate);
  }
  pendingIce.set(from, []);
}

/* =========================
   HANDLE ICE (RACE SAFE)
========================= */
export async function handleVideoIce(candidate, from) {
  const pc = peerConnections.get(from);
  if (!pc) return;

  if (!pc.remoteDescription) {
    pendingIce.get(from)?.push(candidate);
    return;
  }

  try {
    await pc.addIceCandidate(candidate);
  } catch (err) {
    console.warn("ICE error:", err);
  }
}

/* =========================
   END VIDEO CALL
========================= */
export function endVideoCall() {
  peerConnections.forEach((pc) => pc.close());
  peerConnections.clear();

  pendingIce.clear();
  remoteStreams.clear();

  localStream?.getTracks().forEach((t) => t.stop());
  localStream = null;
}
