import * as monaco from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import { getYjsRoom } from "../services/yjs";
import { filesApi } from "../services/api";

let decorations =
  [];

const SAVE_DEBOUNCE_MS = 1500;

export const bindEditorToFile =
  (
    editor,
    fileId,
    initialContent
  ) => {
    const room =
      getYjsRoom(
        fileId,
        initialContent
      );

    const model =
      editor.getModel();

    if (!model) {
      return {
        destroy() { },
      };
    }

    /*
      Text Sync
    */
    const binding =
      new MonacoBinding(
        room.text,
        model,
        new Set([
          editor,
        ]),
        room.awareness
      );

    /*
      Debounced save to DB
    */
    let saveTimeout = null;
    let dirty = false;

    const persist =
      () => {
        clearTimeout(
          saveTimeout
        );

        saveTimeout = null;
        dirty = false;

        filesApi
          .update(
            fileId,
            {
              content:
                room.text.toString(),
            }
          )
          .catch(
            (err) =>
              console.error(
                "Failed to save file:",
                err
              )
          );
      };

    const scheduleSave =
      () => {
        clearTimeout(
          saveTimeout
        );

        dirty = true;

        saveTimeout =
          setTimeout(
            persist,
            SAVE_DEBOUNCE_MS
          );
      };

    room.ydoc.on(
      "update",
      scheduleSave
    );

    /*
      Update local cursor
    */
    editor.onDidChangeCursorPosition(
      () => {
        const position =
          editor.getPosition();

        const selection =
          editor.getSelection();

        room.awareness.setLocalStateField(
          "cursor",
          {
            line:
              position.lineNumber,

            column:
              position.column,

            selection: {
              startLine:
                selection
                  ?.startLineNumber,

              startColumn:
                selection
                  ?.startColumn,

              endLine:
                selection
                  ?.endLineNumber,

              endColumn:
                selection
                  ?.endColumn,
            },
          }
        );
      }
    );

    /*
      Render remote cursors
    */
    const renderPresence =
      () => {
        const states =
          Array.from(
            room.awareness.getStates()
          );

        const newDecorations =
          [];

        states.forEach(
          ([
            clientId,
            state,
          ]) => {
            const user =
              state?.user;

            const cursor =
              state?.cursor;

            const localId =
              room.awareness
                .clientID;

            if (
              !user ||
              !cursor ||
              clientId ===
              localId
            ) {
              return;
            }

            const className =
              `remote-cursor-${clientId}`;

            /*
              Dynamic CSS
            */
            if (
              !document.getElementById(
                className
              )
            ) {
              const style =
                document.createElement(
                  "style"
                );

              style.id =
                className;

              style.innerHTML = `
              .${className} {
                border-left: 2px solid ${user.color};
                position: relative;
              }

              .${className}::after {
                content: "${user.name}";
                position: absolute;
                top: -26px;
                left: -2px;
                background: ${user.color};
                color: white;
                font-size: 11px;
                font-weight: 600;
                padding: 4px 10px;
                border-radius: 999px;
                white-space: nowrap;
                box-shadow:
                  0 0 20px ${user.color}40;
              }
              `;

              document.head.appendChild(
                style
              );
            }

            newDecorations.push(
              {
                range:
                  new monaco.Range(
                    cursor.line,
                    cursor.column,
                    cursor.line,
                    cursor.column
                  ),

                options:
                {
                  className,
                  stickiness:
                    1,
                },
              }
            );
            if (
              cursor.selection
            ) {
              newDecorations.push(
                {
                  range:
                    new monaco.Range(
                      cursor.selection
                        .startLine,
                      cursor.selection
                        .startColumn,
                      cursor.selection
                        .endLine,
                      cursor.selection
                        .endColumn
                    ),

                  options: {
                    className:
                      `selection-${clientId}`,
                  },
                }
              );

              /*
                Dynamic selection css
              */
              if (
                !document.getElementById(
                  `selection-${clientId}`
                )
              ) {
                const style =
                  document.createElement(
                    "style"
                  );

                style.id =
                  `selection-${clientId}`;

                style.innerHTML = `
      .selection-${clientId} {
        background:
          ${user.color}25;
        border-radius: 6px;
      }
    `;

                document.head.appendChild(
                  style
                );
              }
            }
          }
        );

        decorations =
          editor.deltaDecorations(
            decorations,
            newDecorations
          );
      };

    room.awareness.on(
      "change",
      renderPresence
    );

    renderPresence();

    return {
      destroy() {
        binding.destroy();

        room.awareness.off(
          "change",
          renderPresence
        );

        room.ydoc.off(
          "update",
          scheduleSave
        );

        if (dirty) {
          persist();
        }
      },
    };
  };