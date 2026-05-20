import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-4 pt-4">

      <div className="max-w-7xl mx-auto">

        <div className="h-18 px-8 rounded-[28px] border border-zinc-800 bg-black/50 backdrop-blur-2xl flex items-center justify-between shadow-[0_0_40px_rgba(255,255,255,0.03)]">

          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-semibold tracking-tight text-white"
          >
            Parallel Coder
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10 text-zinc-400">

            <a
              href="#features"
              className="hover:text-white transition"
            >
              Features
            </a>

            <a
              href="#workspace"
              className="hover:text-white transition"
            >
              Workspace
            </a>

            <a
              href="#community"
              className="hover:text-white transition"
            >
              Community
            </a>

          </nav>

          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center gap-4">

            <Link
              to="/login"
              className="text-zinc-300 hover:text-white transition"
            >
              Login
            </Link>

            <Link
              to="/login"
              className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-zinc-200 transition"
            >
              Get Started
            </Link>

          </div>

          {/* Mobile */}
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="lg:hidden text-white"
          >
            {openMenu ? (
              <X size={28} />
            ) : (
              <Menu size={28} />
            )}
          </button>

        </div>

        {/* Mobile Menu */}
        {openMenu && (
          <div className="lg:hidden mt-4 rounded-[28px] border border-zinc-800 bg-black/95 backdrop-blur-xl p-6">

            <div className="flex flex-col gap-5 text-zinc-300">

              <a href="#features">
                Features
              </a>

              <a href="#workspace">
                Workspace
              </a>

              <a href="#community">
                Community
              </a>

              <Link to="/login">
                Login
              </Link>

              <Link
                to="/login"
                className="bg-white text-black text-center py-3 rounded-full font-medium"
              >
                Get Started
              </Link>

            </div>
          </div>
        )}

      </div>
    </header>
  );
};

export default Navbar;