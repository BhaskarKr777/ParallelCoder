import { Link } from "react-router-dom";
import backgroundImage from "../../assets/images/background.jpg";

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
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 text-center">

        <div className="max-w-5xl">

          {/* Badge */}
          <div className="inline-flex items-center px-5 py-2 rounded-full border border-zinc-800 bg-zinc-950/60 backdrop-blur-md text-zinc-400 text-sm mb-8">
            Free collaborative coding platform
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-semibold tracking-tight leading-[0.95]">
            Build software,
            <br />
            together.
          </h1>

          {/* Subtitle */}
          <p className="mt-8 text-zinc-400 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed">
            A collaborative workspace for developers
            to code, share and build projects in realtime.
          </p>

          {/* CTA */}
          <div className="mt-12 flex justify-center">
            <Link
              to="/login"
              className="bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-zinc-200 transition"
            >
              Start Coding
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;