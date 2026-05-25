import {
  ChevronDown,
  Folder,
  FileCode2,
  FileJson,
  FileText,
} from "lucide-react";

import usePresenceStore from "../../store/presenceStore";

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
  files = [],
  onFileOpen,
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

  return (
    <div className="w-[285px] h-full bg-[#090909] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-neutral-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Workspace
            </p>

            <h2 className="text-lg font-semibold text-white mt-1">
              Parallel
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
              flex items-center gap-2
              px-3 py-2
              rounded-2xl
              text-neutral-400
              text-sm
            "
          >
            <ChevronDown
              size={16}
            />

            <Folder
              size={17}
            />

            <span>
              frontend
            </span>
          </div>

          {/* File Tree */}
          <div className="mt-2 space-y-1">
            {files.map(
              (file) => {
                const editors =
                  getEditorsForFile(
                    file.name
                  );

                return (
                  <button
                    key={
                      file.id
                    }
                    onClick={() =>
                      onFileOpen?.(
                        file
                      )
                    }
                    className="
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

                      {/* Editors */}
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
                    </div>
                  </button>
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