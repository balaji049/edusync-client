// src/services/webrtcVideo.js
import socket from "./socket";

let pc = null;
let localStream = null;
let remoteStream = null;
let setRemoteStreamFn = null;

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
function createPeerConnection() {
  pc = new RTCPeerConnection(ICE_SERVERS);

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit("call:ice", {
        to: currentPeer,
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
}

let currentPeer = null;

/* =========================
   START VIDEO CALL (CALLER)
========================= */
export async function startVideoCall(peers) {
  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });

  createPeerConnection();

  localStream.getTracks().forEach((track) =>
    pc.addTrack(track, localStream)
  );

  for (const peerSocketId of peers) {
    currentPeer = peerSocketId;

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("call:offer", {
      to: peerSocketId,
      offer,
    });
  }

  return localStream;
}

/* =========================
   ANSWER VIDEO CALL (RECEIVER)
========================= */
export async function answerVideoCall(offer, from) {
  currentPeer = from;

  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });

  createPeerConnection();

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
export async function handleVideoAnswer(answer) {
  await pc.setRemoteDescription(answer);
}

/* =========================
   HANDLE ICE
========================= */
export async function handleVideoIce(candidate) {
  if (candidate && pc) {
    await pc.addIceCandidate(candidate);
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
  currentPeer = null;
}
