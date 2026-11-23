import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, User, Mail, ShieldAlert, AlertTriangle, LogOut, Trash2 } from "lucide-react";
import useAuthStore from "../../store/authStore";

const SettingsModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logoutAll = useAuthStore((state) => state.logoutAll);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setShowDeleteConfirm(false);
    setConfirmInput("");
    setDeleteError("");
    onClose();
  };

  const handleLogoutAll = async () => {
    if (!window.confirm("Log out of all devices? All other signed-in sessions will be terminated.")) {
      return;
    }
    await logoutAll();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setIsDeleting(true);
    try {
      await deleteAccount();
      navigate("/login");
    } catch (err) {
      setDeleteError(err.message || "Failed to delete account");
      setIsDeleting(false);
    }
  };

  const canConfirm = confirmInput.trim().toLowerCase() === (user?.username || "").toLowerCase();

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#0d0d10] p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-700/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80">
          <div>
            <h2 className="text-xl font-semibold text-white">Account Settings</h2>
            <p className="text-sm text-zinc-400 mt-1">Manage your account profile and security</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile Details */}
        <div className="py-6 space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center text-lg font-bold text-white shadow-inner">
              {user?.username?.[0]?.toUpperCase() || <User size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{user?.username}</h3>
              <p className="text-sm text-zinc-400 flex items-center gap-1.5 truncate">
                <Mail size={13} />
                {user?.email}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
              {user?.provider || "LOCAL"}
            </span>
          </div>

          {/* Session Management */}
          <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Active Sessions</p>
              <p className="text-xs text-zinc-400">Revoke sessions across every device</p>
            </div>
            <button
              onClick={handleLogoutAll}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition flex items-center gap-1.5"
            >
              <LogOut size={13} />
              Log Out All
            </button>
          </div>

          {/* Danger Zone */}
          <div className="mt-6 pt-6 border-t border-zinc-800/80">
            <div className="p-5 rounded-2xl border border-red-950/80 bg-red-950/20">
              <div className="flex items-start gap-3">
                <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-200">Danger Zone</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Permanently delete your account, all owned workspaces, files, and chat messages. This action is irreversible.
                  </p>

                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-red-300 hover:text-white bg-red-950/60 hover:bg-red-900/60 border border-red-800/60 transition flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Delete Account
                    </button>
                  ) : (
                    <div className="mt-4 p-4 rounded-xl bg-black/60 border border-red-900/80 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
                        <AlertTriangle size={14} />
                        Please type <span className="font-mono text-white underline">{user?.username}</span> to confirm:
                      </div>

                      <input
                        type="text"
                        value={confirmInput}
                        onChange={(e) => setConfirmInput(e.target.value)}
                        placeholder={`Type "${user?.username}"`}
                        className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-red-500"
                        autoFocus
                      />

                      {deleteError && (
                        <p className="text-xs text-red-400">{deleteError}</p>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          disabled={!canConfirm || isDeleting}
                          onClick={handleDeleteAccount}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          {isDeleting ? "Deleting..." : "Permanently Delete Account"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setConfirmInput("");
                            setDeleteError("");
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
