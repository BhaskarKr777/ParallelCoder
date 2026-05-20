const Footer = () => {
  return (
    <footer className="bg-[#050505] border-t border-zinc-900 text-white mt-24">

      <div className="max-w-7xl mx-auto px-6 py-20">

        {/* Top */}
        <div className="grid lg:grid-cols-4 gap-14 pb-16 border-b border-zinc-900">

          {/* Brand */}
          <div className="lg:col-span-2">

            <h2 className="text-4xl font-semibold tracking-tight">
              Parallel Coder
            </h2>

            <p className="text-zinc-400 mt-6 text-lg leading-relaxed max-w-lg">
              A modern collaborative coding platform
              built for developers, teams and builders
              who want realtime collaboration.
            </p>

            <button className="mt-8 bg-white text-black px-7 py-4 rounded-full font-medium hover:bg-zinc-200 transition">
              Start Coding Free
            </button>

          </div>

          {/* Product */}
          <div>

            <h3 className="text-lg font-medium mb-5">
              Product
            </h3>

            <div className="flex flex-col gap-4 text-zinc-400">

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

            </div>

          </div>

          {/* Company */}
          <div>

            <h3 className="text-lg font-medium mb-5">
              Company
            </h3>

            <div className="flex flex-col gap-4 text-zinc-400">

              <a
                href="#"
                className="hover:text-white transition"
              >
                About
              </a>

              <a
                href="#"
                className="hover:text-white transition"
              >
                Contact
              </a>

              <a
                href="#"
                className="hover:text-white transition"
              >
                Privacy Policy
              </a>

            </div>

          </div>

        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-zinc-500">

          <p>
            © 2026 Parallel Coder. All rights reserved.
          </p>

          <p>
            Built with passion by Bhaskar Kumar
          </p>

        </div>

      </div>
    </footer>
  );
};

export default Footer;