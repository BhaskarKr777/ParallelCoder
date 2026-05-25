import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";

/*
  Persistent docs cache
*/
const docs = new Map();

export const setupYjs = (
  editor,
  roomId = "parallel-room"
) => {
  /*
    Reuse existing room
  */
  if (docs.has(roomId)) {
    const existing =
      docs.get(roomId);

    new MonacoBinding(
      existing.yText,
      editor.getModel(),
      new Set([editor]),
      existing.provider.awareness
    );

    return existing;
  }

  /*
    Create new room
  */
  const ydoc = new Y.Doc();

  const provider =
    new WebsocketProvider(
      "ws://localhost:1234",
      roomId,
      ydoc
    );

  const yText =
    ydoc.getText("monaco");

  new MonacoBinding(
    yText,
    editor.getModel(),
    new Set([editor]),
    provider.awareness
  );

  const room = {
    ydoc,
    provider,
    yText,
  };

  docs.set(roomId, room);

  return room;
};