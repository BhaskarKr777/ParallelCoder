import { Link } from "react-router-dom";
import backgroundImage from "../../assets/images/background1.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Hero Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 pt-24 pb-16 text-center">

        <div className="max-w-5xl">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full border border-zinc-800 bg-zinc-950/80 backdrop-blur-md text-zinc-300 text-xs sm:text-sm mb-6 sm:mb-8 shadow-[0_0_20px_rgba(255,255,255,0.02)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Free collaborative coding platform
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.02] sm:leading-[0.95]">
            Build software,
            <br />
            together.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 sm:mt-8 text-zinc-400 text-base sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
            A collaborative workspace for developers
            to code, share and build projects in realtime.
          </p>

          {/* CTA */}
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all text-center"
            >
              Start Coding Free
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;