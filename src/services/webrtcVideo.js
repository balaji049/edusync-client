import socket from "./socket";

/* =========================
   ICE CONFIG
========================= */
const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

/* =========================
   STATE (MODULE SINGLETON)
========================= */

// peerSocketId -> RTCPeerConnection
const peerConnections = new Map();

// peerSocketId -> MediaStream
const remoteStreams = new Map();

// peerSocketId -> ICE candidate queue
const pendingIce = new Map();

let localStream = null;
let setVideoStreamFn = null;

/* =========================
   REGISTER STREAM SETTER
   (from CallContext)
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
  const pc = new RTCPeerConnection(ICE_SERVERS);

  peerConnections.set(peerSocketId, pc);
  pendingIce.set(peerSocketId, []);

  /* ICE → SIGNALING */
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("call:ice", {
        to: peerSocketId,
        candidate: event.candidate,
      });
    }
  };

  /* REMOTE TRACKS */
  pc.ontrack = ({ streams: [stream] }) => {
    if (!remoteStreams.has(peerSocketId)) {
      remoteStreams.set(peerSocketId, stream);
      setVideoStreamFn?.(peerSocketId, stream);
    }
  };

  return pc;
}

/* =========================
   START VIDEO CALL (CALLER)
========================= */
export async function startVideoCall(peerSocketIds = []) {
  const stream = await getLocalStream();

  for (const peerId of peerSocketIds) {
    if (peerConnections.has(peerId)) continue;

    const pc = createPeerConnection(peerId);

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

  stream.getTracks().forEach((track) =>
    pc.addTrack(track, stream)
  );

  /* IMPORTANT ORDER */
  await pc.setRemoteDescription(offer);

  /* FLUSH ICE */
  const queued = pendingIce.get(from) || [];
  for (const candidate of queued) {
    await pc.addIceCandidate(candidate);
  }
  pendingIce.set(from, []);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  socket.emit("call:answer", {
    to: from,
    answer,
  });

  return stream;
}

/* =========================
   HANDLE ANSWER
========================= */
export async function handleVideoAnswer(answer, from) {
  const pc = peerConnections.get(from);
  if (!pc) return;

  if (pc.signalingState !== "stable") {
    await pc.setRemoteDescription(answer);
  }

  /* FLUSH ICE */
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
    console.warn("ICE ignored:", err);
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
