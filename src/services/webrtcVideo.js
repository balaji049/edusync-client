// src/services/webrtcVideo.js
import socket from "./socket";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

let localStream = null;
const peerConnections = {}; // socketId -> RTCPeerConnection
let setRemoteStreamFn = null;

/* =========================
   REGISTER REMOTE STREAM
========================= */
export function registerRemoteStreamSetter(fn) {
  setRemoteStreamFn = fn;
}

/* =========================
   GET LOCAL MEDIA
========================= */
export async function getLocalStream() {
  if (!localStream) {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  }
  return localStream;
}

/* =========================
   CREATE PEER CONNECTION
========================= */
function createPeerConnection(remoteSocketId) {
  const pc = new RTCPeerConnection(ICE_SERVERS);

  peerConnections[remoteSocketId] = pc;

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

  localStream.getTracks().forEach(track =>
    pc.addTrack(track, localStream)
  );

  return pc;
}

/* =========================
   CALLER → CREATE OFFER
========================= */
export async function callPeer(remoteSocketId) {
  const pc = createPeerConnection(remoteSocketId);

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  socket.emit("call:offer", {
    to: remoteSocketId,
    offer,
  });
}

/* =========================
   RECEIVER → HANDLE OFFER
========================= */
export async function handleOffer(from, offer) {
  const pc = createPeerConnection(from);

  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  socket.emit("call:answer", {
    to: from,
    answer,
  });
}

/* =========================
   CALLER → HANDLE ANSWER
========================= */
export async function handleAnswer(from, answer) {
  const pc = peerConnections[from];
  if (!pc) return;

  if (pc.signalingState !== "stable") {
    await pc.setRemoteDescription(answer);
  }
}

/* =========================
   HANDLE ICE
========================= */
export async function handleIce(from, candidate) {
  const pc = peerConnections[from];
  if (pc) {
    await pc.addIceCandidate(candidate);
  }
}

/* =========================
   CLEANUP
========================= */
export function endVideoCall() {
  Object.values(peerConnections).forEach(pc => pc.close());
  localStream?.getTracks().forEach(t => t.stop());

  localStream = null;
  Object.keys(peerConnections).forEach(k => delete peerConnections[k]);
}
