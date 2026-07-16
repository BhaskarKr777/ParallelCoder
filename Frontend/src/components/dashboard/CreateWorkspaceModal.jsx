import { useState } from "react";
import { X } from "lucide-react";

import useWorkspaceStore from "../../store/workspaceStore";

const CreateWorkspaceModal = ({
  isOpen,
  onClose,
}) => {
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setName("");
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await createWorkspace(name);
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">

      <div className="relative w-full max-w-xl rounded-[36px] border border-zinc-800 bg-[#111113] p-8 shadow-[0_0_80px_rgba(255,255,255,0.05)]">

        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition"
        >
          <X size={18} />
        </button>

        <h2 className="text-3xl font-semibold">
          Create Workspace
        </h2>

        <p className="text-zinc-500 mt-2">
          Start a new collaborative coding room.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Workspace Name */}
          <div className="mt-8">
            <label className="text-sm text-zinc-400 mb-3 block">
              Workspace Name
            </label>

            <input
              type="text"
              required
              autoFocus
              placeholder="My Awesome Project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-14 rounded-2xl bg-zinc-900 border border-zinc-800 px-5 outline-none focus:border-zinc-600 text-white"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 mt-4">{error}</p>
          )}

          {/* Create */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full h-14 rounded-2xl bg-white text-black font-medium hover:bg-zinc-200 transition disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Workspace"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
