// src/services/webrtcVideo.js
import socket from "./socket";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// socketId -> RTCPeerConnection
const peers = new Map();

let localStream = null;
let setRemoteStreamFn = null;

/* =========================
   REGISTER REMOTE STREAM SETTER
========================= */
export function registerRemoteStreamSetter(fn) {
  setRemoteStreamFn = fn;
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
function createPeerConnection(remoteSocketId) {
  const pc = new RTCPeerConnection(ICE_SERVERS);

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit("call:ice", {
        to: remoteSocketId,
        candidate: e.candidate,
      });
    }
  };

  pc.ontrack = (e) => {
    const stream = e.streams[0];
    setRemoteStreamFn?.(stream);
  };

  peers.set(remoteSocketId, pc);
  return pc;
}

/* =========================
   START VIDEO CALL (CALLER)
========================= */
export async function startVideoCall(existingPeers) {
  const stream = await getLocalStream();

  for (const peerId of existingPeers) {
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
  const pc = peers.get(from);
  if (!pc) return;

  await pc.setRemoteDescription(answer);
}

/* =========================
   HANDLE ICE
========================= */
export async function handleVideoIce(candidate, from) {
  const pc = peers.get(from);
  if (!pc) return;

  await pc.addIceCandidate(candidate);
}

/* =========================
   END CALL
========================= */
export function endVideoCall() {
  peers.forEach((pc) => pc.close());
  peers.clear();

  localStream?.getTracks().forEach((t) => t.stop());
  localStream = null;
}
