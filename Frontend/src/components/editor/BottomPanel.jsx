import React from "react";

const BottomPanel = () => {
  return (
    <div className="h-10 bg-black border-t border-zinc-800 flex items-center justify-between px-4 text-xs text-zinc-400">
      <div className="flex items-center gap-4">
        <span>main</span>
        <span>JavaScript</span>
        <span>UTF-8</span>
      </div>

      <div className="flex items-center gap-4">
        <span>Realtime Connected</span>
        <span>Workspace: Active</span>
      </div>
    </div>
  );
};

export default BottomPanel;