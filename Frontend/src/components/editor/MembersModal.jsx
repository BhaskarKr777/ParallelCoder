import { useEffect, useState } from "react";
import { X, UserPlus, Trash2, LogOut } from "lucide-react";

import { workspaceApi } from "../../services/api";

const ROLE_OPTIONS = ["ADMIN", "EDITOR", "VIEWER"];
const MANAGER_ROLES = ["OWNER", "ADMIN"];

const MembersModal = ({ isOpen, onClose, workspaceId, currentUserId, currentUserRole }) => {
  const isManager = MANAGER_ROLES.includes(currentUserRole);

  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("EDITOR");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const [busyMemberId, setBusyMemberId] = useState(null);
  const [actionError, setActionError] = useState("");

  const loadMembers = async () => {
    setIsLoading(true);
    setListError("");

    try {
      const { members } = await workspaceApi.members(workspaceId);
      setMembers(members);
    } catch (err) {
      setListError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !workspaceId) return;
    loadMembers();
  }, [isOpen, workspaceId]);

  if (!isOpen) return null;

  const handleClose = () => {
    setInviteEmail("");
    setInviteError("");
    setActionError("");
    onClose();
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError("");
    setIsInviting(true);

    try {
      await workspaceApi.inviteMember(workspaceId, { email: inviteEmail.trim(), role: inviteRole });
      setInviteEmail("");
      await loadMembers();
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (memberId, role) => {
    setActionError("");
    setBusyMemberId(memberId);

    try {
      await workspaceApi.updateMemberRole(workspaceId, memberId, role);
      await loadMembers();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyMemberId(null);
    }
  };

  const handleRemove = async (member) => {
    const isSelf = member.userId === currentUserId;

    if (!window.confirm(isSelf ? "Leave this workspace?" : `Remove ${member.username}?`)) return;

    setActionError("");
    setBusyMemberId(member.id);

    try {
      await workspaceApi.removeMember(workspaceId, member.id);
      if (isSelf) {
        handleClose();
        return;
      }
      await loadMembers();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyMemberId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
      <div className="relative w-full max-w-xl rounded-[36px] border border-zinc-800 bg-[#111113] p-8 shadow-[0_0_80px_rgba(255,255,255,0.05)]">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition"
        >
          <X size={18} />
        </button>

        <h2 className="text-3xl font-semibold">Members</h2>
        <p className="text-zinc-500 mt-2">Manage who has access to this workspace.</p>

        {isManager && (
          <form onSubmit={handleInvite} className="mt-8 flex items-end gap-3">
            <div className="flex-1">
              <label className="text-sm text-zinc-400 mb-2 block">Invite by email</label>
              <input
                type="email"
                required
                placeholder="teammate@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full h-12 rounded-2xl bg-zinc-900 border border-zinc-800 px-4 outline-none focus:border-zinc-600 text-white text-sm"
              />
            </div>

            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="h-12 rounded-2xl bg-zinc-900 border border-zinc-800 px-3 outline-none text-white text-sm"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={isInviting}
              className="h-12 px-5 rounded-2xl bg-white text-black font-medium hover:bg-zinc-200 transition disabled:opacity-50 flex items-center gap-2"
            >
              <UserPlus size={16} />
              {isInviting ? "Inviting..." : "Invite"}
            </button>
          </form>
        )}

        {inviteError && <p className="text-sm text-red-400 mt-3">{inviteError}</p>}
        {actionError && <p className="text-sm text-red-400 mt-3">{actionError}</p>}

        <div className="mt-6 max-h-[320px] overflow-y-auto space-y-2 custom-scroll">
          {isLoading && <p className="text-sm text-zinc-500 px-1">Loading members...</p>}
          {listError && <p className="text-sm text-red-400 px-1">{listError}</p>}

          {!isLoading &&
            members.map((member) => {
              const isSelf = member.userId === currentUserId;
              const canManageThis = isManager && member.role !== "OWNER" && !isSelf;
              const canLeave = isSelf && member.role !== "OWNER";
              const isBusy = busyMemberId === member.id;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {member.username}
                      {isSelf && <span className="text-zinc-500 font-normal"> (you)</span>}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">{member.email}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {canManageThis ? (
                      <select
                        value={member.role}
                        disabled={isBusy}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        className="h-9 rounded-xl bg-zinc-900 border border-zinc-800 px-2 text-xs text-white outline-none"
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.04]">
                        {member.role}
                      </span>
                    )}

                    {canManageThis && (
                      <button
                        onClick={() => handleRemove(member)}
                        disabled={isBusy}
                        title="Remove member"
                        className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    {canLeave && (
                      <button
                        onClick={() => handleRemove(member)}
                        disabled={isBusy}
                        title="Leave workspace"
                        className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                      >
                        <LogOut size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default MembersModal;
