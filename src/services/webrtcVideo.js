// src/services/webrtcVideo.js
import socket from "./socket";

/* =========================
   GLOBAL STATE
========================= */
let localStream = null;
let remoteStream = null;
let setRemoteStreamFn = null;

// One PeerConnection per peer
const peerConnections = {};

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

/* =========================
   REGISTER REMOTE STREAM SETTER
========================= */
export function registerRemoteStreamSetter(fn) {
  setRemoteStreamFn = fn;
}

/* =========================
   CREATE PEER CONNECTION
========================= */
function createPeerConnection(peerId) {
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
    if (!remoteStream) {
      remoteStream = new MediaStream();
      setRemoteStreamFn?.(remoteStream);
    }
    remoteStream.addTrack(e.track);
  };

  peerConnections[peerId] = pc;
  return pc;
}

/* =========================
   START VIDEO CALL (CALLER)
========================= */
export async function startVideoCall(peerIds) {
  if (!localStream) {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  }

  for (const peerId of peerIds) {
    const pc = createPeerConnection(peerId);

    localStream.getTracks().forEach((track) =>
      pc.addTrack(track, localStream)
    );

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("call:offer", {
      to: peerId,
      offer,
    });
  }

  return localStream;
}

/* =========================
   ANSWER VIDEO CALL (RECEIVER)
========================= */
export async function answerVideoCall(offer, from) {
  if (!localStream) {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  }

  const pc = createPeerConnection(from);

  localStream.getTracks().forEach((track) =>
    pc.addTrack(track, localStream)
  );

  await pc.setRemoteDescription(offer);

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
export async function handleVideoAnswer(answer, from) {
  const pc = peerConnections[from];
  if (pc) {
    await pc.setRemoteDescription(answer);
  }
}

/* =========================
   HANDLE ICE
========================= */
export async function handleVideoIce(candidate, from) {
  const pc = peerConnections[from];
  if (pc && candidate) {
    await pc.addIceCandidate(candidate);
  }
}

/* =========================
   END CALL
========================= */
export function endVideoCall() {
  Object.values(peerConnections).forEach((pc) => pc.close());

  Object.keys(peerConnections).forEach(
    (k) => delete peerConnections[k]
  );

  localStream?.getTracks().forEach((t) => t.stop());
  remoteStream?.getTracks().forEach((t) => t.stop());

  localStream = null;
  remoteStream = null;
}
