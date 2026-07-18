import { io } from "socket.io-client";

/*
  No URL means same-origin: the backend serves the built frontend
  and Socket.IO from that same origin in production, and the Vite
  dev proxy forwards /socket.io to the backend in dev (see
  vite.config.js). A hardcoded http://localhost:3000 here would
  only ever work on a developer's own machine.

  The server now requires a valid session cookie to connect
  (see collaboration.socket.js), so autoConnect is off here —
  authStore explicitly connects once a session is confirmed and
  disconnects on logout, instead of racing the login flow.
*/
const socket = io({
  withCredentials: true,
  autoConnect: false,
});

export default socket;