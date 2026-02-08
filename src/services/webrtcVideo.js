// src/services/webrtcVideo.js
import socket from "./socket";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// peerSocketId -> RTCPeerConnection
const peerConnections = new Map();

// peerSocketId -> MediaStream
const remoteStreams = new Map();

let localStream = null;
let remoteStreamHandler = null;

/* =========================
   REGISTER REMOTE STREAM HANDLER
========================= */
export function registerRemoteStreamHandler(fn) {
  remoteStreamHandler = fn;
}

/* =========================
   ENSURE LOCAL STREAM
========================= */
async function ensureLocalStream() {
  if (!localStream) {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
  }
  return localStream;
}

/* =========================
   CREATE PEER CONNECTION
========================= */
function createPeerConnection(peerId) {
  if (peerConnections.has(peerId)) {
    return peerConnections.get(peerId);
  }

  const pc = new RTCPeerConnection(ICE_SERVERS);

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit("call:ice", {
        to: peerId,
        candidate: e.candidate,
      });
    }
  };

  pc.ontrack = (e) => {
    let stream = remoteStreams.get(peerId);
    if (!stream) {
      stream = new MediaStream();
      remoteStreams.set(peerId, stream);
      remoteStreamHandler?.(peerId, stream);
    }
    stream.addTrack(e.track);
  };

  peerConnections.set(peerId, pc);
  return pc;
}

/* =========================
   START VIDEO CALL (CALLER)
========================= */
export async function startVideoCall(peerIds) {
  const stream = await ensureLocalStream();

  for (const peerId of peerIds) {
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
  const stream = await ensureLocalStream();
  const pc = createPeerConnection(from);

  stream.getTracks().forEach((track) =>
    pc.addTrack(track, stream)
  );

  await pc.setRemoteDescription(offer);

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
  if (!pc || pc.signalingState === "stable") return;

  await pc.setRemoteDescription(answer);
}

/* =========================
   HANDLE ICE
========================= */
export async function handleVideoIce(candidate, from) {
  const pc = peerConnections.get(from);
  if (pc && candidate) {
    await pc.addIceCandidate(candidate);
  }
}

/* =========================
   END CALL
========================= */
export function endVideoCall() {
  peerConnections.forEach((pc) => pc.close());
  peerConnections.clear();

  localStream?.getTracks().forEach((t) => t.stop());
  localStream = null;

  remoteStreams.clear();
}
