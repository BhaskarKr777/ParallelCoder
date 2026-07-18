import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import useAuthStore from "../store/authStore";
import { authApi } from "../services/api";

/*
  Inlined instead of <img src="https://.../logo.svg"> so the OAuth
  buttons don't depend on a third-party image host being reachable
  (and so they don't violate a strict img-src CSP in production).
*/
const GoogleIcon = (props) => (
  <svg viewBox="0 0 48 48" width={20} height={20} {...props}>
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
    />
  </svg>
);

// lucide-react dropped brand/logo icons, so this is inlined too.
const GitHubIcon = (props) => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
    <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.79-.25.79-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.38.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .3.21.66.79.55A10.52 10.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
  </svg>
);

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
                    <GoogleIcon className="w-5 h-5" />
                    Continue with Google
                  </a>

                  <a
                    href={authApi.githubUrl}
                    className="h-14 w-full rounded-2xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition flex items-center justify-center gap-3 text-zinc-200 font-medium"
                  >
                    <GitHubIcon className="w-5 h-5" />
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
