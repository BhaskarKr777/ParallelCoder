import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Folder,
  Users,
  Settings,
  LogOut,
  Plus,
  KeyRound,
} from "lucide-react";

import CreateWorkspaceModal from "../components/dashboard/CreateWorkspaceModal";
import useAuthStore from "../store/authStore";
import useWorkspaceStore from "../store/workspaceStore";
import { workspaceApi } from "../services/api";

const Dashboard = () => {
  const [openModal, setOpenModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const logoutAll = useAuthStore((state) => state.logoutAll);
  const { workspaces, isLoading, fetchWorkspaces } = useWorkspaceStore();

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleLogoutAll = async () => {
    if (!window.confirm("Log out of all devices? Every other signed-in session will be ended.")) {
      return;
    }
    await logoutAll();
    navigate("/login");
  };

  const handleJoinWorkspace = async (event) => {
    event.preventDefault();
    setJoinError("");
    setIsJoining(true);
    try {
      const { membership } = await workspaceApi.acceptInvite(inviteCode.trim());
      await fetchWorkspaces();
      navigate(`/editor/${membership.workspaceId}`);
    } catch (error) {
      setJoinError(error.message);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#09090B] text-white flex">

      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 border-r border-zinc-800/70 bg-[#111113] flex-col justify-between p-6">

        <div>
          {/* Logo */}
          <h1 className="text-2xl font-semibold tracking-tight mb-10">
            Parallel Coder
          </h1>

          {/* Navigation */}
          <nav className="space-y-3">

            {/* Active Dashboard */}
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-zinc-800/40 border border-zinc-700/50 text-zinc-200 transition">
              <LayoutDashboard size={20} />
              Dashboard
            </button>

            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-zinc-800/60 text-zinc-400 hover:text-white transition">
              <Folder size={20} />
              Workspaces
            </button>

            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-zinc-800/60 text-zinc-400 hover:text-white transition">
              <Users size={20} />
              Collaborators
            </button>

            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-zinc-800/60 text-zinc-400 hover:text-white transition">
              <Settings size={20} />
              Settings
            </button>

          </nav>
        </div>

        {/* Logout */}
        <div className="space-y-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-zinc-500 hover:text-white transition"
          >
            <LogOut size={20} />
            Logout
          </button>

          <button
            onClick={handleLogoutAll}
            className="text-xs text-zinc-600 hover:text-red-400 transition pl-9"
          >
            Log out of all devices
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative flex-1 p-6 sm:p-10 overflow-hidden">

        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-zinc-400/5 blur-[120px] rounded-full" />

        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-zinc-500/5 blur-[120px] rounded-full" />

        <div className="relative z-10">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between gap-6">

            <div>
              <p className="text-zinc-500 uppercase text-sm tracking-[0.2em]">
                Dashboard
              </p>

              <h1 className="text-4xl sm:text-5xl font-semibold mt-2 tracking-tight">
                Welcome back, {user?.username || "there"} 👋
              </h1>

              <p className="text-zinc-400 mt-3 text-lg">
                Continue building with your team.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 flex-wrap">

              {/* Create Workspace */}
              <button
                onClick={() => setOpenModal(true)}
                className="bg-zinc-200 text-black px-6 py-3 rounded-2xl font-medium flex items-center gap-2 hover:bg-white transition shadow-[0_0_30px_rgba(255,255,255,0.08)]"
              >
                <Plus size={18} />
                Create Workspace
              </button>

              <form onSubmit={handleJoinWorkspace} className="flex gap-2">
                <label className="sr-only" htmlFor="invite-code">Invitation code</label>
                <input
                  id="invite-code"
                  required
                  value={inviteCode}
                  onChange={(event) => setInviteCode(event.target.value)}
                  placeholder="Invitation code"
                  className="w-40 sm:w-52 border border-zinc-700 bg-zinc-900/40 px-4 py-3 rounded-2xl text-sm text-white outline-none focus:border-zinc-500"
                />
                <button
                  disabled={isJoining}
                  className="border border-zinc-700 bg-zinc-900/40 backdrop-blur-xl px-4 py-3 rounded-2xl text-zinc-300 hover:border-zinc-500 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <KeyRound size={16} />
                  {isJoining ? "Joining..." : "Join"}
                </button>
              </form>

            </div>
          </div>
          {joinError && <p className="mt-3 text-sm text-red-400">{joinError}</p>}

          {/* Dashboard Grid */}
          <div className="grid lg:grid-cols-3 gap-6 mt-12">

            {/* Recent Workspaces */}
            <div className="lg:col-span-2 rounded-[32px] border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-xl p-8">

              <div className="flex justify-between items-center mb-8">

                <h2 className="text-2xl font-semibold">
                  Recent Workspaces
                </h2>

                <button className="text-zinc-500 hover:text-white transition">
                  View all
                </button>

              </div>

              <div className="space-y-4">

                {isLoading && (
                  <p className="text-zinc-500 text-sm">
                    Loading workspaces...
                  </p>
                )}

                {!isLoading && workspaces.length === 0 && (
                  <p className="text-zinc-500 text-sm">
                    No workspaces yet — create one to get started.
                  </p>
                )}

                {workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    onClick={() => navigate(`/editor/${workspace.id}`)}
                    className="border border-zinc-800 rounded-2xl p-5 hover:bg-zinc-800/50 transition cursor-pointer"
                  >
                    <h3 className="font-medium text-lg">
                      {workspace.name}
                    </h3>

                    <p className="text-zinc-500 text-sm mt-1">
                      {workspace.memberCount} member
                      {workspace.memberCount !== 1 ? "s" : ""} · {workspace.role}
                    </p>
                  </div>
                ))}

              </div>
            </div>

            {/* Team Activity */}
            <div className="rounded-[32px] border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-xl p-8">

              <h2 className="text-2xl font-semibold mb-6">
                Team Activity
              </h2>

              <div className="space-y-6 text-sm">

                <div>
                  <p className="text-zinc-200">
                    Bhaskar edited Hero.jsx
                  </p>

                  <span className="text-zinc-500">
                    10 min ago
                  </span>
                </div>

                <div>
                  <p className="text-zinc-200">
                    Sarah joined workspace
                  </p>

                  <span className="text-zinc-500">
                    1 hour ago
                  </span>
                </div>

                <div>
                  <p className="text-zinc-200">
                    Auth.js deployed
                  </p>

                  <span className="text-zinc-500">
                    Yesterday
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
      />

    </section>
  );
};

export default Dashboard;
