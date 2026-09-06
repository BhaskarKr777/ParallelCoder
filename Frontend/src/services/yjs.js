import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import usePresenceStore from "../store/presenceStore";

/*
  The Yjs websocket server is its own process/port even in
  production (see docker-compose.yml), not something the Vite dev
  proxy or same-origin serving can cover, so it's configured at
  build time instead of hardcoded.
*/
const getCleanYjsUrl = () => {
  let raw = (import.meta.env.VITE_YJS_URL || "").trim();

  // Strip invalid characters like angle brackets < > or quotes
  raw = raw.replace(/['"<>]/g, "").replace(/\/+$/, "");

  if (raw.startsWith("http://")) raw = raw.replace("http://", "ws://");
  if (raw.startsWith("https://")) raw = raw.replace("https://", "wss://");

  const isWindowDefined = typeof window !== "undefined";
  const isProdHost = isWindowDefined && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";

  if (!raw || (isProdHost && raw.includes("localhost"))) {
    if (isWindowDefined) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      return `${protocol}//${window.location.host}`;
    }
  }

  return raw || "ws://localhost:1234";
};

const YJS_URL = getCleanYjsUrl();

const rooms =
  new Map();

export const getYjsRoom = (
  roomId,
  initialContent
) => {
  /*
    Existing room
  */
  if (
    rooms.has(roomId)
  ) {
    return rooms.get(
      roomId
    );
  }

  /*
    Shared user identity
  */
  const currentUser =
    usePresenceStore.getState()
      .currentUser;

  const ydoc =
    new Y.Doc();

  const provider =
    new WebsocketProvider(
      YJS_URL,
      roomId,
      ydoc
    );

  const awareness =
    provider.awareness;

  /*
    Use SAME identity
    as Team Space
  */
  awareness.setLocalState({
    user: {
      name:
        currentUser
          ?.username ||
        "Guest",

      color:
        currentUser
          ?.color ||
        "#3B82F6",

      socketId:
        currentUser
          ?.socketId,
    },

    cursor: null,
  });

  const text =
    ydoc.getText(
      "monaco"
    );

  /*
    Seed brand-new rooms
    from saved DB content
  */
  provider.once(
    "sync",
    (isSynced) => {
      if (
        isSynced &&
        text.length === 0 &&
        initialContent
      ) {
        text.insert(
          0,
          initialContent
        );
      }
    }
  );

  const room = {
    ydoc,
    provider,
    awareness,
    text,
  };

  rooms.set(
    roomId,
    room
  );

  return room;
};

/*
  The live (possibly unsaved) content of an already-open file, for
  things like Run that need what's actually in the editor right now
  rather than whatever was last autosaved.
*/
export const getRoomText = (
  roomId
) =>
  rooms.get(roomId)
    ?.text
    ?.toString() ??
  null;