import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const rooms =
  new Map();

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#A855F7",
  "#EC4899",
];

export const getYjsRoom = (
  roomId
) => {
  if (rooms.has(roomId)) {
    return rooms.get(roomId);
  }

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

  const color =
    COLORS[
      Math.floor(
        Math.random() *
          COLORS.length
      )
    ];

  const username =
    `Guest-${Math.floor(
      Math.random() * 999
    )}`;

  awareness.setLocalState({
    user: {
      name:
        username,
      color,
    },

    cursor: null,
  });

  const room = {
    ydoc,
    provider,
    awareness,
    text:
      ydoc.getText(
        "monaco"
      ),
  };

  rooms.set(
    roomId,
    room
  );

  return room;
};