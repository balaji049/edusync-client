// src/services/webrtcVideo.js
import socket from "./socket";

let pc = null;
let localStream = null;
let remoteStream = null;
let setRemoteStream = null;
let currentPeerId = null;

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

/* =========================
   REGISTER REMOTE STREAM SETTER
========================= */
export function registerRemoteStreamSetter(fn) {
  setRemoteStream = fn;
}

/* =========================
   CREATE PEER CONNECTION
========================= */
function createPeerConnection() {
  pc = new RTCPeerConnection(ICE_SERVERS);

  pc.onicecandidate = (e) => {
    if (e.candidate && currentPeerId) {
      socket.emit("call:ice", {
        to: currentPeerId,
        candidate: e.candidate,
      });
    }
  };

  pc.ontrack = (e) => {
    if (!remoteStream) {
      remoteStream = new MediaStream();
      setRemoteStream?.(remoteStream);
    }
    remoteStream.addTrack(e.track);
  };
}

/* =========================
   START VIDEO CALL (CALLER)
========================= */
export async function startVideoCall(peerSocketId) {
  currentPeerId = peerSocketId;

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  createPeerConnection();

  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  socket.emit("call:offer", {
    to: peerSocketId,
    offer,
  });

  return localStream;
}

/* =========================
   ANSWER VIDEO CALL (RECEIVER)
========================= */
export async function answerVideoCall(offer, from) {
  currentPeerId = from;

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  createPeerConnection();

  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  await pc.setRemoteDescription(new RTCSessionDescription(offer));

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  socket.emit("call:answer", {
    to: from,
    answer,
  });

  return localStream;
}

/* =========================
   HANDLE ANSWER
========================= */
export async function handleVideoAnswer(answer) {
  if (!pc) return;
  await pc.setRemoteDescription(new RTCSessionDescription(answer));
}

/* =========================
   HANDLE ICE
========================= */
export async function handleVideoIce(candidate) {
  if (candidate && pc) {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }
}

/* =========================
   END CALL
========================= */
export function endVideoCall() {
  localStream?.getTracks().forEach((t) => t.stop());
  remoteStream?.getTracks().forEach((t) => t.stop());
  pc?.close();

  pc = null;
  localStream = null;
  remoteStream = null;
  currentPeerId = null;
}
