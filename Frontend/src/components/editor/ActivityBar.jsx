import React from "react";
import {
  Files,
  Search,
  GitBranch,
  MessageSquare,
  Bot,
  Settings,
  Users,
} from "lucide-react";

const ActivityBar = ({
  showExplorer,
  setShowExplorer,
  showCollab,
  setShowCollab,
}) => {
  return (
    <aside className="w-16 bg-black border-r border-zinc-800 flex flex-col justify-between items-center py-4">
      {/* Top Icons */}
      <div className="flex flex-col gap-5">
        {/* Explorer */}
        <button
          onClick={() => setShowExplorer(!showExplorer)}
          className={`relative p-3 rounded-xl transition ${
            showExplorer
              ? "bg-zinc-900 text-white"
              : "text-zinc-500 hover:text-white hover:bg-zinc-900"
          }`}
        >
          {showExplorer && (
            <div className="absolute left-[-14px] top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-full bg-white" />
          )}

          <Files size={22} />
        </button>

        {/* Search */}
        <button className="p-3 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900 transition">
          <Search size={22} />
        </button>

        {/* Git */}
        <button className="p-3 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900 transition">
          <GitBranch size={22} />
        </button>

        {/* Collaboration */}
        <button
          onClick={() => setShowCollab(!showCollab)}
          className={`relative p-3 rounded-xl transition ${
            showCollab
              ? "bg-zinc-900 text-white"
              : "text-zinc-500 hover:text-white hover:bg-zinc-900"
          }`}
        >
          {showCollab && (
            <div className="absolute left-[-14px] top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-full bg-white" />
          )}

          <Users size={22} />
        </button>

        {/* Chat */}
        <button className="p-3 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900 transition">
          <MessageSquare size={22} />
        </button>

        {/* AI */}
        <button className="p-3 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900 transition">
          <Bot size={22} />
        </button>
      </div>

      {/* Bottom */}
      <button className="p-3 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900 transition">
        <Settings size={22} />
      </button>
    </aside>
  );
};

export default ActivityBar;