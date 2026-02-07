import socket from "./socket";

let peerConnection = null;
let localStream = null;
let setRemoteStreamFn = null;
let peerSocketId = null;

/* =========================
   ICE CONFIG
========================= */
const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

/* =========================
   ICE QUEUE (CRITICAL FIX)
========================= */
let pendingIceCandidates = [];

/* =========================
   REGISTER REMOTE STREAM
========================= */
export function registerRemoteStreamSetter(fn) {
  setRemoteStreamFn = fn;
}

/* =========================
   CREATE PEER CONNECTION
========================= */
function createPeer() {
  peerConnection = new RTCPeerConnection(ICE_SERVERS);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate && peerSocketId) {
      socket.emit("call:ice", {
        to: peerSocketId,
        candidate: event.candidate,
      });
    }
  };

  peerConnection.ontrack = (event) => {
    const [stream] = event.streams;
    setRemoteStreamFn?.(stream);
  };
}

/* =========================
   START CALL (CALLER)
========================= */
export async function initCall(targetSocketId) {
  peerSocketId = targetSocketId;
  pendingIceCandidates = [];

  createPeer();

  localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  localStream.getTracks().forEach((t) =>
    peerConnection.addTrack(t, localStream)
  );

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  socket.emit("call:offer", {
    to: peerSocketId,
    offer,
  });
}

/* =========================
   ANSWER CALL (RECEIVER)
========================= */
export async function answerCall(offer, fromSocketId) {
  peerSocketId = fromSocketId;
  pendingIceCandidates = [];

  createPeer();

  localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  localStream.getTracks().forEach((t) =>
    peerConnection.addTrack(t, localStream)
  );

  // ✅ Set remote description FIRST
  await peerConnection.setRemoteDescription(offer);

  // ✅ Flush queued ICE (if any arrived early)
  for (const candidate of pendingIceCandidates) {
    await peerConnection.addIceCandidate(candidate);
  }
  pendingIceCandidates = [];

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  socket.emit("call:answer", {
    to: peerSocketId,
    answer,
  });
}

/* =========================
   HANDLE ANSWER
========================= */
export async function handleAnswer(answer) {
  if (!peerConnection) return;

  await peerConnection.setRemoteDescription(answer);

  // ✅ Flush queued ICE
  for (const candidate of pendingIceCandidates) {
    await peerConnection.addIceCandidate(candidate);
  }
  pendingIceCandidates = [];
}

/* =========================
   HANDLE ICE (RACE-SAFE)
========================= */
export async function handleIce(candidate) {
  if (!peerConnection) return;

  // ⏳ Remote description not ready yet → queue ICE
  if (!peerConnection.remoteDescription) {
    pendingIceCandidates.push(candidate);
    return;
  }

  try {
    await peerConnection.addIceCandidate(candidate);
  } catch (err) {
    console.warn("ICE candidate ignored:", err);
  }
}

/* =========================
   END CALL
========================= */
export function endWebRTCCall() {
  pendingIceCandidates = [];

  localStream?.getTracks().forEach((t) => t.stop());
  localStream = null;

  peerConnection?.close();
  peerConnection = null;
  peerSocketId = null;
}
