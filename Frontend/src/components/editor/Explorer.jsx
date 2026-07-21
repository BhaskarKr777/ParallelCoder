import {
  ChevronDown,
  Folder,
  FileCode2,
  FileJson,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";

import usePresenceStore from "../../store/presenceStore";
import { filesApi } from "../../services/api";

const LANGUAGE_BY_EXTENSION = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  c: "c",
  h: "c",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  hpp: "cpp",
  java: "java",
  json: "json",
  css: "css",
  html: "html",
  md: "markdown",
};

const inferLanguage = (fileName = "") => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return LANGUAGE_BY_EXTENSION[ext] || "plaintext";
};

const getFileIcon = (
  fileName = ""
) => {
  if (
    fileName.endsWith(
      ".jsx"
    )
  ) {
    return (
      <FileCode2
        size={16}
      />
    );
  }

  if (
    fileName.endsWith(
      ".json"
    )
  ) {
    return (
      <FileJson
        size={16}
      />
    );
  }

  return (
    <FileText
      size={16}
    />
  );
};

const Explorer = ({
  workspaceId,
  projectName,
  files = [],
  isLoading = false,
  canEdit = true,
  onFileOpen,
  onFileCreated,
  onFileDeleted,
  onFileRenamed,
}) => {
  const { users } =
    usePresenceStore();

  const getEditorsForFile =
    (fileName) => {
      return users.filter(
        (user) =>
          user.editing ===
          fileName
      );
    };

  const handleCreateFile = async () => {
    if (!canEdit) return;

    const name = window.prompt("File name (e.g. index.js)");
    if (!name?.trim()) return;

    const trimmed = name.trim();

    const file = await filesApi.create(workspaceId, {
      name: trimmed,
      path: trimmed,
      language: inferLanguage(trimmed),
    });

    onFileCreated?.(file.file);
  };

  const handleDeleteFile = async (e, file) => {
    e.stopPropagation();

    if (!canEdit) return;
    if (!window.confirm(`Delete ${file.name}?`)) return;

    await filesApi.remove(file.id);
    onFileDeleted?.(file.id);
  };

  const handleRenameFile = async (file) => {
    if (!canEdit) return;

    const name = window.prompt("Rename file", file.name);
    if (!name?.trim() || name === file.name) return;

    const trimmed = name.trim();

    await filesApi.update(file.id, { name: trimmed });
    onFileRenamed?.(file.id, trimmed);
  };

  return (
    <div className="w-[285px] h-full bg-[#090909] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-neutral-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Project
            </p>

            <h2 className="text-lg font-semibold text-white mt-1">
              {projectName || "Loading..."}
            </h2>
          </div>

          <div
            className="
              h-10 px-4
              rounded-[18px]
              bg-[#101010]
              border border-neutral-900
              flex items-center gap-2
            "
          >
            <div className="w-2 h-2 rounded-full bg-green-500" />

            <span className="text-sm text-neutral-400">
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Files */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Folder */}
        <div className="mb-4">
          <div
            className="
              flex items-center justify-between
              px-3 py-2
              rounded-2xl
              text-neutral-400
              text-sm
            "
          >
            <div className="flex items-center gap-2">
              <ChevronDown
                size={16}
              />

              <Folder
                size={17}
              />

              <span>
                {projectName || "files"}
              </span>
            </div>

            {canEdit && (
              <button
                onClick={handleCreateFile}
                title="New file"
                className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-[#101010] transition"
              >
                <Plus size={16} />
              </button>
            )}
          </div>

          {/* File Tree */}
          <div className="mt-2 space-y-1">
            {isLoading && (
              <p className="px-3 py-2 text-sm text-neutral-500">
                Loading files...
              </p>
            )}

            {!isLoading && files.length === 0 && (
              <p className="px-3 py-2 text-sm text-neutral-500">
                No files yet — create one to get started.
              </p>
            )}

            {files.map(
              (file) => {
                const editors =
                  getEditorsForFile(
                    file.name
                  );

                return (
                  <div
                    key={
                      file.id
                    }
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      onFileOpen?.(
                        file
                      )
                    }
                    onDoubleClick={() =>
                      handleRenameFile(file)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onFileOpen?.(file);
                    }}
                    className="
                      group
                      w-full
                      rounded-2xl
                      px-4 py-2.5
                      bg-transparent
                      hover:bg-[#101010]
                      hover:scale-[1.01]
                      border border-transparent
                      hover:border-neutral-900
                      transition-all duration-300 ease-out
                      text-left
                      cursor-pointer
                    "
                  >
                    <div className="flex items-center justify-between">
                      {/* Left */}
                      <div className="flex items-center gap-3">
                        <div className="text-neutral-500">
                          {getFileIcon(
                            file.name
                          )}
                        </div>

                        <div>
                          <p className="text-[14px] text-neutral-100 font-medium">
                            {
                              file.name
                            }
                          </p>

                          <p className="text-xs text-neutral-500 mt-1">
                            {
                              file.language
                            }
                          </p>
                        </div>
                      </div>

                      {/* Editors + Delete */}
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {editors.map(
                            (
                              editor
                            ) => (
                              <div
                                key={
                                  editor.socketId
                                }
                                className="
                                  w-8 h-8
                                  rounded-full
                                  border-[2px]
                                  border-[#090909]
                                  flex items-center justify-center
                                  text-white
                                  text-xs font-semibold
                                "
                                style={{
                                  background:
                                    editor.color,
                                }}
                                title={
                                  editor.username
                                }
                              >
                                {editor.username?.[0]?.toUpperCase()}
                              </div>
                            )
                          )}
                        </div>

                        {canEdit && (
                          <button
                            onClick={(e) => handleDeleteFile(e, file)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition"
                            title="Delete file"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-neutral-900">
        <div
          className="
            rounded-[24px]
            bg-[#101010]
            border border-neutral-900
            p-4
          "
        >
          <p className="text-sm text-white font-medium">
            Realtime Active
          </p>

          <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
            Collaboration is synced
            across all connected
            workspaces.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Explorer;
