import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import usePresenceStore from "../store/presenceStore";

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
      "ws://localhost:1234",
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