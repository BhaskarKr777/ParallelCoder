import React, { useState } from "react";
import { Mic, UserPlus } from "lucide-react";

import UsersList from "./UsersList";
import ChatPanel from "./ChatPanel";
import MembersModal from "./MembersModal";

const CollaborationPanel = ({ workspaceId, currentUserId, currentUserRole }) => {
  const [showMembers, setShowMembers] = useState(false);

  return (
    <aside
      className="
        h-full
        flex
        flex-col
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="h-14 border-b border-zinc-800 px-5 flex items-center justify-between bg-black shrink-0">
        <div>
          <h2 className="text-white font-semibold text-lg">
            Team Space
          </h2>

          <p className="text-zinc-500 text-xs">
            Realtime Collaboration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMembers(true)}
            title="Manage members"
            className="h-10 w-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition flex items-center justify-center"
          >
            <UserPlus size={18} className="text-white" />
          </button>

          <button className="h-10 w-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition flex items-center justify-center">
            <Mic
              size={18}
              className="text-white"
            />
          </button>
        </div>
      </div>

      <MembersModal
        isOpen={showMembers}
        onClose={() => setShowMembers(false)}
        workspaceId={workspaceId}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
      />

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {/* Users */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <UsersList />
        </div>

        {/* Chat */}
        <div className="h-[320px] border-t border-neutral-900 bg-[#090909]">
          <ChatPanel />
        </div>
      </div>
    </aside>
  );
};

export default CollaborationPanel;