import { Link } from "react-router-dom";
import { ArrowRight, Code2, Zap, Users, MessageSquare, Terminal } from "lucide-react";
import backgroundImage from "../../assets/images/background1.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 opacity-60"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      />

      {/* Dark Overlay with Gradient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 pt-36 sm:pt-40 pb-16 text-center">

        <div className="max-w-5xl mx-auto flex flex-col items-center">

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight leading-[1.05] sm:leading-[0.98]">
            Build software,
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-medium">
              together.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 sm:mt-8 text-zinc-400 text-base sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
            A high-performance collaborative workspace for developers to code, execute, share, and build projects seamlessly in real time.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 w-full sm:w-auto">
            <Link
              to="/login"
              className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <span>Start Coding Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="#workspace"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-medium border border-zinc-800 bg-zinc-950/70 hover:bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all text-center flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <Code2 className="w-5 h-5 text-emerald-400" />
              <span>Explore Workspace</span>
            </a>
          </div>

          {/* Quick Feature Badges Row */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl text-left">
            <div className="p-3.5 sm:p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/40 backdrop-blur-sm flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white">Sub-100ms Sync</h4>
                <p className="text-[11px] text-zinc-500">Yjs CRDT Powered</p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/40 backdrop-blur-sm flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Code2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white">Multi-Lang Runner</h4>
                <p className="text-[11px] text-zinc-500">Node, Python, C++ & more</p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/40 backdrop-blur-sm flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white">Team Chat & Audio</h4>
                <p className="text-[11px] text-zinc-500">Built-in WebRTC</p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/40 backdrop-blur-sm flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white">Live Presence</h4>
                <p className="text-[11px] text-zinc-500">Cursor & selection tracking</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;