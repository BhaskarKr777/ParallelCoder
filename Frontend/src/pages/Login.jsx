import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import useAuthStore from "../store/authStore";
import { authApi } from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);

  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

                {/* Mode Toggle */}
                <div className="relative z-10 mt-8 grid grid-cols-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-1">
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className={`h-10 rounded-xl text-sm font-medium transition ${
                      mode === "signin"
                        ? "bg-white text-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Sign In
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className={`h-10 rounded-xl text-sm font-medium transition ${
                      mode === "signup"
                        ? "bg-white text-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Auth Form */}
                <form
                  onSubmit={handleSubmit}
                  className="relative z-10 mt-6 space-y-4"
                >
                  {mode === "signup" && (
                    <input
                      type="text"
                      required
                      placeholder="Username"
                      value={form.username}
                      onChange={updateField("username")}
                      className="w-full h-12 rounded-2xl bg-zinc-900 border border-zinc-800 px-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-zinc-600 transition"
                    />
                  )}

                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={form.email}
                    onChange={updateField("email")}
                    className="w-full h-12 rounded-2xl bg-zinc-900 border border-zinc-800 px-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-zinc-600 transition"
                  />

                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Password"
                    value={form.password}
                    onChange={updateField("password")}
                    className="w-full h-12 rounded-2xl bg-zinc-900 border border-zinc-800 px-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-zinc-600 transition"
                  />

                  {error && (
                    <p className="text-sm text-red-400">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-2xl bg-white text-black font-medium hover:bg-zinc-200 transition disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Please wait..."
                      : mode === "signin"
                      ? "Sign In"
                      : "Create Account"}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative z-10 my-8 border-t border-zinc-800" />

                {/* OAuth Buttons */}
                <div className="relative z-10 space-y-3">
                  <a
                    href={authApi.googleUrl}
                    className="h-14 w-full rounded-2xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition flex items-center justify-center gap-3 text-zinc-200 font-medium"
                  >
                    <img
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      alt="Google"
                      className="w-5 h-5"
                    />
                    Continue with Google
                  </a>

                  <a
                    href={authApi.githubUrl}
                    className="h-14 w-full rounded-2xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition flex items-center justify-center gap-3 text-zinc-200 font-medium"
                  >
                    <img
                      src="https://www.svgrepo.com/show/512317/github-142.svg"
                      alt="GitHub"
                      className="w-5 h-5 invert"
                    />
                    Continue with GitHub
                  </a>
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
