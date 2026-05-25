import React from "react";
import { Users, MessageSquare, Mic } from "lucide-react";

import UsersList from "./UsersList";
import ChatPanel from "./ChatPanel";

const CollaborationPanel = () => {
  return (
    <aside className="w-[340px] bg-black border-l border-zinc-800 flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-zinc-800 px-5 flex items-center justify-between bg-black">
        <div>
          <h2 className="text-white font-semibold text-lg">
            Team Space
          </h2>

          <p className="text-zinc-500 text-xs">
            Realtime Collaboration
          </p>
        </div>

        <button className="h-10 w-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition flex items-center justify-center">
          <Mic size={18} className="text-white" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex flex-col p-5">
        {/* Online Users */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users size={17} className="text-zinc-400" />

            <h3 className="text-zinc-300 text-sm font-medium">
              Active Members
            </h3>
          </div>

          <UsersList />
        </div>

        {/* Chat */}
        <div className="flex-1 mt-8 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare
              size={17}
              className="text-zinc-400"
            />

            <h3 className="text-zinc-300 text-sm font-medium">
              Team Chat
            </h3>
          </div>

          <div className="flex-1 overflow-hidden">
            <ChatPanel />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CollaborationPanel;