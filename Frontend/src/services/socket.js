import { io } from "socket.io-client";

/*
  The server now requires a valid session cookie to connect
  (see collaboration.socket.js), so autoConnect is off here —
  authStore explicitly connects once a session is confirmed and
  disconnects on logout, instead of racing the login flow.
*/
const socket = io("http://localhost:3000", {
  withCredentials: true,
  autoConnect: false,
});

export default socket;