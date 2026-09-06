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

          {/* Top Announcement Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl text-zinc-300 text-xs sm:text-sm mb-6 sm:mb-8 shadow-[0_0_25px_rgba(16,185,129,0.1)] hover:border-emerald-500/40 transition-all duration-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-white">v1.0 is Live</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">Real-time Collaborative Code Editor</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] sm:leading-[0.98]">
            Build software,
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
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

          {/* Interactive Live Collaboration Preview Card */}
          <div className="mt-12 w-full max-w-3xl rounded-2xl border border-zinc-800/80 bg-zinc-950/90 backdrop-blur-2xl p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-left">
            {/* Header bar */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                  main.js — Parallel Workspace
                </span>
              </div>
              
              {/* Active Users Avatars Badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  3 Active Coders
                </span>
              </div>
            </div>

            {/* Code Snippet lines with user cursor badges */}
            <div className="font-mono text-xs sm:text-sm space-y-2 text-zinc-300 overflow-x-auto">
              <div className="flex items-center gap-3">
                <span className="text-zinc-600 select-none w-4 text-right">1</span>
                <span><span className="text-purple-400">import</span> &#123; YjsProvider &#125; <span className="text-purple-400">from</span> <span className="text-emerald-300">'@parallel/collaboration'</span>;</span>
              </div>
              <div className="flex items-center gap-3 relative">
                <span className="text-zinc-600 select-none w-4 text-right">2</span>
                <span><span className="text-blue-400">const</span> room = <span className="text-purple-400">new</span> <span className="text-yellow-300">YjsProvider</span>(<span className="text-emerald-300">'global-session'</span>);</span>
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500 text-black text-[10px] font-bold shadow">
                  Bhaskar (Host)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-zinc-600 select-none w-4 text-right">3</span>
                <span>room.<span className="text-blue-300">onSync</span>(() =&gt; console.<span className="text-yellow-300">log</span>(<span className="text-emerald-300">'Realtime sync connected!'</span>));</span>
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500 text-white text-[10px] font-bold shadow">
                  Alex (Editing)
                </span>
              </div>
            </div>
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