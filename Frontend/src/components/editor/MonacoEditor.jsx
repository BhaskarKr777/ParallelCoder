import * as monaco from "monaco-editor";
import {
  useEffect,
  useRef,
} from "react";

import Editor from "@monaco-editor/react";
import {
  FileCode2,
} from "lucide-react";

import { bindEditorToFile } from "../../editor/editorManager";

const MonacoEditor = ({
  activeTab,
}) => {
  const editorRef =
    useRef(null);

  const bindingRef =
    useRef(null);

  const handleMount = (
    editor,
    monaco
  ) => {
    editorRef.current =
      editor.updateOptions({
  cursorSmoothCaretAnimation:
    "on",
  smoothScrolling:
    true,
});

    /*
      Parallel Luxury Theme
    */
    monaco.editor.defineTheme(
      "parallel-dark",
      {
        base: "vs-dark",
        inherit: true,

        rules: [
          {
            token:
              "comment",
            foreground:
              "6B7280",
          },

          {
            token:
              "keyword",
            foreground:
              "FFFFFF",
          },

          {
            token:
              "string",
            foreground:
              "A1A1AA",
          },
        ],

        colors: {
          "editor.background":
            "#0a0a0a",

          "editor.lineHighlightBackground":
            "#111111",

          "editorCursor.foreground":
            "#ffffff",

          "editorLineNumber.foreground":
            "#4B5563",

          "editorLineNumber.activeForeground":
            "#ffffff",

          "editor.selectionBackground":
            "#262626",

          "editor.inactiveSelectionBackground":
            "#171717",
        },
      }
    );

    monaco.editor.setTheme(
      "parallel-dark"
    );

    /*
      Bind realtime room
    */
    if (
      activeTab?.id
    ) {
      bindingRef.current =
        bindEditorToFile(
          editor,
          activeTab.id
        );
    }
  };

  /*
    Handle tab switching
  */
  useEffect(() => {
    if (
      !editorRef.current ||
      !activeTab?.id
    ) {
      return;
    }

    /*
      Cleanup old binding
    */
    if (
      bindingRef.current
    ) {
      bindingRef.current.destroy();
    }

    /*
      Create new binding
    */
    bindingRef.current =
      bindEditorToFile(
        editorRef.current,
        activeTab.id
      );

    return () => {
      if (
        bindingRef.current
      ) {
        bindingRef.current.destroy();
      }
    };
  }, [activeTab]);

  /*
    Empty State
  */
  if (!activeTab) {
    return (
      <div className="h-full bg-[#0a0a0a] flex items-center justify-center px-8">
        <div className="max-w-2xl text-center">
          {/* Icon */}
          <div className="mx-auto w-24 h-24 rounded-[32px] bg-[#111111] border border-neutral-800 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(255,255,255,0.03)]">
            <FileCode2
              size={42}
              className="text-white"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-semibold tracking-tight text-white mb-5">
            Welcome to
            Parallel Coder
          </h1>

          {/* Subtitle */}
          <p className="text-neutral-500 leading-relaxed text-lg max-w-2xl mx-auto mb-8">
            Build, edit and
            collaborate with
            your team in a
            realtime workspace
            designed for modern
            development.
          </p>

          {/* Feature row */}
          <div className="flex justify-center flex-wrap gap-8 text-sm text-neutral-600 mb-10">
            <span>
              Realtime Sync
            </span>

            <span>
              Multiplayer Editing
            </span>

            <span>
              Team Presence
            </span>
          </div>

          {/* Quick files */}
          <div className="flex justify-center gap-3 flex-wrap">
            {[
              "App.jsx",
              "Navbar.jsx",
              "Hero.jsx",
            ].map(
              (
                file
              ) => (
                <button
                  key={
                    file
                  }
                  className="
                    px-5 py-3
                    rounded-2xl
                    bg-[#111111]
                    border border-neutral-800
                    text-sm
                    text-neutral-300
                    hover:bg-[#161616]
                    hover:border-neutral-700
                    transition-all duration-300
                  "
                >
                  {file}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  /*
    Monaco Editor
  */
  return (
    <div className="h-full w-full bg-[#0a0a0a]">
      <Editor
        height="100%"
        theme="parallel-dark"
        language={
          activeTab.language ||
          "javascript"
        }
        onMount={
          handleMount
        }
        options={{
          fontSize: 15,

          fontFamily:
            "JetBrains Mono, monospace",

          fontLigatures:
            true,

          cursorWidth: 2,

          cursorStyle:
            "line-thin",

          minimap: {
            enabled:
              false,
          },

          automaticLayout:
            true,

          smoothScrolling:
            true,

          cursorBlinking:
            "smooth",

          cursorSmoothCaretAnimation:
            "on",

          renderLineHighlight:
            "all",

          scrollBeyondLastLine:
            false,

          wordWrap:
            "on",

          lineHeight: 28,

          padding: {
            top: 24,
            bottom: 24,
          },

          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />
    </div>
  );
};

export default MonacoEditor;