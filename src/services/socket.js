import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.NODE_ENV === "production"
    ? "https://edusync-server.onrender.com"
    : "http://localhost:5000";

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  secure: true,
});

export const registerPresence = (userId) => {
  if (!userId) return;
  socket.emit("register-user", userId);
};

export default socket;

/*import { io } from "socket.io-client";

/**
 * Decide backend URL dynamically
 
const SOCKET_URL =
  process.env.NODE_ENV === "production"
    ? "https://kyle-tradition-toilet-jason.trycloudflare.com"
    : "http://localhost:5000";

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  secure: SOCKET_URL.startsWith("https"),
});

export const registerPresence = (userId) => {
  if (!userId) return;
  socket.emit("register-user", userId);
};

export default socket;

/*import { io } from "socket.io-client";

const socket = io("/", {
  transports: ["websocket", "polling"],

  secure: true,
});




export const registerPresence = (userId) => {
  if (!userId) return;
  socket.emit("register-user", userId); // EXACT MATCH
};

export default socket;
*/