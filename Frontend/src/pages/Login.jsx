import { Link } from "react-router-dom";

const Login = () => {
  return (
    <section className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-white/[0.03] blur-[140px] rounded-full" />

      <div className="absolute bottom-0 right-[-10%] w-[500px] h-[500px] bg-white/[0.03] blur-[140px] rounded-full" />

      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #27272a 1px, transparent 1px),
            linear-gradient(to bottom, #27272a 1px, transparent 1px)
          `,
          backgroundSize: "70px 70px",
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center px-6 sm:px-10 lg:px-20 py-12">

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT SIDE */}
          <div className="relative text-center lg:text-left">

            {/* Blur Layer 1 */}
            <div className="absolute -top-10 -left-10 w-[320px] h-[320px] bg-zinc-700/10 blur-[120px] rounded-full" />

            {/* Blur Layer 2 */}
            <div className="absolute top-20 left-20 w-[250px] h-[250px] bg-zinc-500/10 blur-[100px] rounded-full" />

            {/* Glass Layer */}
            <div className="relative rounded-[40px] border border-zinc-800 bg-zinc-950/30 backdrop-blur-xl p-8 sm:p-12 overflow-hidden">

              {/* Subtle Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

              <Link
                to="/"
                className="relative z-10 inline-flex text-zinc-400 hover:text-white transition text-sm mb-10"
              >
                ← Back to home
              </Link>

              <h1 className="relative z-10 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.95]">
                Build software,
                <br />
                together.
              </h1>

              <p className="relative z-10 mt-6 text-zinc-500 text-lg sm:text-xl max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Realtime collaboration for modern developers.
                Fast, minimal and built for teams.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex justify-center lg:justify-end">

            <div className="relative w-full max-w-md">

              {/* Background Blur */}
              <div className="absolute inset-0 bg-zinc-500/10 blur-[90px] rounded-full scale-110" />

              {/* Login Card */}
              <div className="relative rounded-[32px] border border-zinc-800 bg-zinc-950/40 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_0_80px_rgba(255,255,255,0.04)] overflow-hidden">

                {/* Subtle Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />

                <div className="relative z-10 text-center">

                  <h2 className="text-3xl font-semibold">
                    Parallel Coder
                  </h2>

                  <p className="text-zinc-500 mt-3">
                    Continue to your workspace
                  </p>
                </div>

                {/* Google Button */}
                <button className="relative z-10 mt-10 w-full h-14 rounded-2xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition flex items-center justify-center gap-3 text-zinc-200 font-medium">

                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />

                  Continue with Google
                </button>

                {/* Divider */}
                <div className="relative z-10 my-8 border-t border-zinc-800" />

                {/* Features */}
                <div className="relative z-10 space-y-4">

                  {[
                    "Secure authentication",
                    "Free to get started",
                    "Realtime collaboration",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-zinc-400"
                    >
                      <div className="w-2 h-2 rounded-full bg-zinc-500" />
                      {item}
                    </div>
                  ))}

                </div>

                {/* Footer */}
                <p className="relative z-10 mt-8 text-sm text-zinc-600 text-center leading-relaxed">
                  By continuing, you agree to our
                  <span className="text-zinc-400"> Terms </span>
                  and
                  <span className="text-zinc-400">
                    {" "}Privacy Policy
                  </span>
                </p>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Login;