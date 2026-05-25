import {
  X,
  FileCode2,
} from "lucide-react";

const EditorTabs = ({
  tabs,
  activeTab,
  setActiveTab,
  closeTab,
}) => {
  return (
    <div className="px-4 pt-4 pb-2 bg-[#090909] border-b border-neutral-900">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {tabs.length ===
        0 ? (
          <div className="h-12 flex items-center px-4 text-sm text-neutral-500">
            Open a file to begin
          </div>
        ) : (
          tabs.map(
            (tab) => {
              const isActive =
                activeTab?.id ===
                tab.id;

              return (
                <button
                  key={
                    tab.id
                  }
                  onClick={() =>
                    setActiveTab(
                      tab
                    )
                  }
                  className={`
                    group
                    relative
                    h-[52px]
                    px-5
                    rounded-[22px]
                    flex items-center gap-3
                    transition-all duration-300 ease-out
                    min-w-fit
                    border
                    ${
                      isActive
                        ? `
                          bg-[#101010]
                          border-neutral-800
                          text-white
                          shadow-[0_0_0_1px_rgba(255,255,255,0.02)]
                        `
                        : `
                          bg-transparent
                          border-transparent
                          text-neutral-500
                          hover:text-white
                          hover:-translate-y-[1px]
                          hover:border-neutral-900
                        `
                    }
                  `}
                >
                  {/* Icon */}
                  <div
                    className={`
                      transition-all duration-300 ease-out
                      ${
                        isActive
                          ? "text-white"
                          : "text-neutral-500 group-hover:text-white"
                      }
                    `}
                  >
                    <FileCode2
                      size={16}
                    />
                  </div>

                  {/* Name */}
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium whitespace-nowrap">
                      {
                        tab.name
                      }
                    </span>

                    <span className="text-[11px] text-neutral-500">
                      Live synced
                    </span>
                  </div>

                  {/* Active glow */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-[22px] border border-white/[0.03] pointer-events-none" />
                  )}

                  {/* Close */}
                  <button
                    onClick={(
                      e
                    ) => {
                      e.stopPropagation();

                      closeTab(
                        tab.id
                      );
                    }}
                    className="
                      opacity-0
                      group-hover:opacity-100
                      transition-all duration-300 ease-out
                      rounded-full
                      p-1.5
                      hover:bg-neutral-800
                    "
                  >
                    <X
                      size={14}
                    />
                  </button>
                </button>
              );
            }
          )
        )}
      </div>
    </div>
  );
};

export default EditorTabs;