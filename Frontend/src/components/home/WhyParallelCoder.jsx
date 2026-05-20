import {
  CheckCircle2,
} from "lucide-react";

const points = [
  "Realtime collaboration",
  "Free to get started",
  "Built for developers",
];

const WhyParallelCoder = () => {
  return (
    <section className="bg-black text-white py-28 px-6">

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

        {/* Left */}
        <div>

          <p className="text-zinc-500 uppercase tracking-[0.25em] text-sm">
            Why Parallel Coder
          </p>

          <h2 className="text-4xl md:text-5xl font-semibold mt-5 tracking-tight leading-tight">
            Collaboration made
            <br />
            simple for developers.
          </h2>

          <p className="text-zinc-400 mt-6 text-lg leading-relaxed max-w-xl">
            Parallel Coder helps teams work together
            in realtime with a clean, fast and modern
            coding experience.
          </p>

          <div className="mt-10 space-y-5">

            {points.map((item) => (
              <div
                key={item}
                className="flex items-center gap-4"
              >
                <CheckCircle2
                  size={24}
                  className="text-zinc-300"
                />

                <span className="text-zinc-300 text-lg">
                  {item}
                </span>
              </div>
            ))}

          </div>

        </div>

        {/* Right Card */}
        <div className="rounded-[36px] border border-zinc-800 bg-zinc-950/50 p-8 backdrop-blur-xl">

          <div className="rounded-[28px] border border-zinc-800 bg-[#0D1117] overflow-hidden">

            {/* Top Bar */}
            <div className="h-14 border-b border-zinc-800 flex items-center px-5 justify-between">

              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>

              <span className="text-zinc-500 text-sm">
                Team Workspace
              </span>
            </div>

            {/* Fake Collaboration */}
            <div className="p-6 space-y-5 text-sm font-mono">

              <div className="flex items-center justify-between">
                <span className="text-green-400">
                  Bhaskar editing Hero.jsx
                </span>

                <span className="text-zinc-500">
                  live
                </span>
              </div>

              <div className="bg-zinc-900 rounded-xl p-4 text-zinc-400">
                npm run dev
              </div>

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                  B
                </div>

                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                  S
                </div>

                <span className="text-zinc-500">
                  +2 collaborators online
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default WhyParallelCoder;