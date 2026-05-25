import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const rooms = new Map();

export const getRoom = (
  fileId
) => {
  if (rooms.has(fileId)) {
    return rooms.get(fileId);
  }

  const ydoc = new Y.Doc();

  const provider =
    new WebsocketProvider(
      "ws://localhost:1234",
      `file-${fileId}`,
      ydoc
    );

  const yText =
    ydoc.getText("monaco");

  const room = {
    ydoc,
    provider,
    yText,
  };

  rooms.set(fileId, room);

  return room;
};