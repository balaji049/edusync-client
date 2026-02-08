import socket from "./socket";

/* =========================
   ICE CONFIG
========================= */
const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

/* =========================
   MODULE STATE
========================= */

// peerSocketId -> RTCPeerConnection
const peerConnections = new Map();

// peerSocketId -> MediaStream
const remoteStreams = new Map();

// peerSocketId -> ICE candidates queue
const pendingIce = new Map();

let localStream = null;
let setVideoStreamFn = null;

/* =========================
   REGISTER STREAM SETTER
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

  /* Remote media */
  pc.ontrack = (event) => {
    const stream = event.streams[0];
    if (!stream) return;

    if (!remoteStreams.has(peerSocketId)) {
      remoteStreams.set(peerSocketId, stream);
      if (setVideoStreamFn) {
        setVideoStreamFn(peerSocketId, stream);
      }
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

    // Add local tracks FIRST (caller side)
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
   ANSWER VIDEO CALL (FIXED)
========================= */
export async function answerVideoCall(offer, from) {
  const stream = await getLocalStream();
  const pc = createPeerConnection(from);

  // 🔥 STEP 1: set remote description FIRST
  await pc.setRemoteDescription(offer);

  // 🔥 STEP 2: add local tracks AFTER remote SDP
  stream.getTracks().forEach((track) =>
    pc.addTrack(track, stream)
  );

  // 🔥 STEP 3: flush ICE queue
  const queued = pendingIce.get(from) || [];
  for (const candidate of queued) {
    await pc.addIceCandidate(candidate);
  }
  pendingIce.set(from, []);

  // 🔥 STEP 4: create & send answer
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
   HANDLE ICE
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
