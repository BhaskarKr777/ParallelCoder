import usePresenceStore from "../../store/presenceStore";

const UsersList = () => {
  const { users } =
    usePresenceStore();

  return (
    <div className="h-full flex flex-col overflow-hidden min-h-0">
      {/* Header */}
      <div className="px-6 pt-7 pb-5 border-b border-neutral-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="uppercase tracking-[0.18em] text-[11px] text-neutral-500">
              Collaboration
            </p>

            <h2 className="text-xl font-semibold text-white mt-1">
              Live Room
            </h2>
          </div>

          <div className="h-10 px-4 rounded-2xl bg-[#101010] border border-neutral-900 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

            <span className="text-sm text-neutral-400">
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Live Count */}
      <div className="px-6 py-4 border-b border-neutral-900">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {users.map((user) => (
              <div
                key={user.socketId}
                className="
                  w-11 h-11
                  rounded-full
                  border-[3px]
                  border-[#090909]
                  flex items-center justify-center
                  text-sm font-semibold
                  text-white
                  shadow-lg
                "
                style={{
                  background:
                    user.color,
                }}
              >
                {user.username?.[0]?.toUpperCase()}
              </div>
            ))}
          </div>

          <div>
            <p className="text-sm text-white font-medium">
              {users.length} collaborator
              {users.length !== 1
                ? "s"
                : ""}
            </p>

            <p className="text-xs text-neutral-500 mt-1">
              Realtime synced
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scroll">
        {/* Collaborators */}
        <div className="px-4 py-5 space-y-3">
          {users.map((user) => (
            <div
              key={user.socketId}
              className="
                rounded-[22px]
                border border-neutral-900
                bg-[#101010]
                px-4 py-3
                hover:bg-[#131313]
                transition-all
              "
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="
                    relative
                    w-12 h-12
                    rounded-full
                    flex items-center justify-center
                    text-white
                    font-semibold
                    text-lg
                    shadow-xl
                  "
                  style={{
                    background:
                      user.color,
                  }}
                >
                  {user.username?.[0]?.toUpperCase()}

                  <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-[3px] border-[#101010]" />
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium">
                      {user.username}
                    </h3>

                    <span className="text-xs px-2 py-1 rounded-full bg-white/[0.04] text-neutral-400 border border-white/[0.04]">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-neutral-500 text-sm">
                      {user.editing
                        ? "Editing"
                        : "Idle"}
                    </span>

                    {user.editing && (
                      <div className="inline-flex items-center rounded-full bg-white/[0.04] border border-white/[0.04] px-3 py-1 text-xs text-neutral-300">
                        {user.editing}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsersList;