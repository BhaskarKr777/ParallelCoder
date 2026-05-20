import { X } from "lucide-react";

const languages = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "Go",
];

const CreateWorkspaceModal = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">

      <div className="relative w-full max-w-xl rounded-[36px] border border-zinc-800 bg-[#111113] p-8 shadow-[0_0_80px_rgba(255,255,255,0.05)]">

        {/* Close */}
        <button
          onClick={onClose}
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

        {/* Workspace Name */}
        <div className="mt-8">
          <label className="text-sm text-zinc-400 mb-3 block">
            Workspace Name
          </label>

          <input
            type="text"
            placeholder="My Awesome Project"
            className="w-full h-14 rounded-2xl bg-zinc-900 border border-zinc-800 px-5 outline-none focus:border-zinc-600 text-white"
          />
        </div>

        {/* Language */}
        <div className="mt-6">
          <label className="text-sm text-zinc-400 mb-3 block">
            Language
          </label>

          <select className="w-full h-14 rounded-2xl bg-zinc-900 border border-zinc-800 px-5 outline-none focus:border-zinc-600 text-white">

            {languages.map((lang) => (
              <option
                key={lang}
                value={lang}
              >
                {lang}
              </option>
            ))}

          </select>
        </div>

        {/* Visibility */}
        <div className="mt-6">
          <label className="text-sm text-zinc-400 mb-3 block">
            Visibility
          </label>

          <div className="grid grid-cols-2 gap-4">

            <button className="h-14 rounded-2xl border border-zinc-700 bg-zinc-900 hover:border-zinc-500 transition">
              Private
            </button>

            <button className="h-14 rounded-2xl border border-zinc-700 bg-zinc-900 hover:border-zinc-500 transition">
              Public
            </button>

          </div>
        </div>

        {/* Create */}
        <button className="mt-8 w-full h-14 rounded-2xl bg-white text-black font-medium hover:bg-zinc-200 transition">
          Create Workspace
        </button>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;