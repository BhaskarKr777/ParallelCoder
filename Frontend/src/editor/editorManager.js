import { MonacoBinding } from "y-monaco";
import { getRoom } from "./roomManager";

export const bindEditorToFile =
  (
    editor,
    fileId
  ) => {
    const room =
      getRoom(fileId);

    const binding =
      new MonacoBinding(
        room.yText,
        editor.getModel(),
        new Set([editor]),
        room.provider.awareness
      );

    return binding;
  };