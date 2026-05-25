import {
  Search,
  Play,
  Bell,
  ChevronDown,
} from "lucide-react";

import usePresenceStore from "../../store/presenceStore";

const Topbar = () => {
  const { users } =
    usePresenceStore();

  return (
    <header className="h-[72px] px-7 border-b border-neutral-900 bg-[#050505] flex items-center justify-between">
      {/* LEFT */}
      <div className="flex items-center gap-5">
        {/* Logo / Identity */}
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight text-white">
            <span className="text-white">
              Parallel
            </span>

            <span className="text-neutral-500">
              Coder
            </span>
          </h1>

          <p className="text-[12px] text-neutral-500 mt-[2px]">
            Collaborative Development
          </p>
        </div>

        {/* Workspace Pill */}
        <button
          className="
            h-11
            px-4
            rounded-2xl
            bg-[#0d0d0d]
            border border-neutral-900
            flex items-center gap-2
            hover:border-neutral-800
            transition-all
          "
        >
          <div className="w-2 h-2 rounded-full bg-green-500" />

          <span className="text-sm text-neutral-300">
            Workspace
          </span>

          <ChevronDown
            size={16}
            className="text-neutral-500"
          />
        </button>
      </div>

      {/* CENTER SEARCH */}
      <div className="flex-1 flex justify-center px-8">
        <div className="relative w-full max-w-xl">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
          />

          <input
            placeholder="Search files, commands, teammates..."
            className="
              w-full
              h-10
              rounded-2xl
              bg-[#0d0d0d]
              border border-neutral-900
              pl-12
              pr-4
              text-sm
              text-white
              placeholder:text-neutral-600
              outline-none
              transition-all
              focus:border-neutral-700
            "
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* Live Users */}
        <div className="flex items-center -space-x-2">
          {users.map(
            (user) => (
              <div
                key={
                  user.socketId
                }
                title={`${user.username} • ${user.editing}`}
                className="
                  relative
                  w-11 h-11
                  rounded-full
                  border-[3px]
                  border-[#050505]
                  flex items-center justify-center
                  text-sm font-semibold
                  text-white
                  shadow-lg
                  hover:scale-105
                  transition-transform
                "
                style={{
                  background:
                    user.color,
                }}
              >
                {user.username?.[0]?.toUpperCase()}

                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#050505]" />
              </div>
            )
          )}
        </div>

        {/* Online Count */}
        <div className="hidden xl:flex text-sm text-neutral-500">
          {users.length} online
        </div>

        {/* Run */}
        <button
          className="
            h-12
            px-5
            rounded-2xl
            bg-white
            text-black
            font-medium
            flex items-center gap-2
            hover:scale-[1.02]
            transition-all
          "
        >
          <Play size={16} />
          Run
        </button>

        {/* Notifications */}
        <button
          className="
            w-10 h-10
            rounded-2xl
            bg-[#0d0d0d]
            border border-neutral-900
            flex items-center justify-center
            text-neutral-400
            hover:text-white
            hover:border-neutral-700
            hover:bg-[#111111]
            transition-all
          "
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;