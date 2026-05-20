import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="bg-black text-white px-6 py-24">

      <div className="max-w-6xl mx-auto rounded-[40px] border border-zinc-800 bg-zinc-950/60 p-10 md:p-20 text-center">

        <p className="text-zinc-500 uppercase tracking-[0.25em] text-sm">
          Start Building
        </p>

        <h2 className="text-4xl md:text-6xl font-semibold mt-6 tracking-tight">
          Start coding
          <br />
          together today.
        </h2>

        <p className="text-zinc-400 text-lg mt-6 max-w-2xl mx-auto">
          Build projects, collaborate with teammates
          and experience realtime coding.
        </p>

        <div className="flex justify-center mt-10">

          <Link
            to="/login"
            className="bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-zinc-200 transition"
          >
            Get Started Free
          </Link>

        </div>

      </div>

    </section>
  );
};

export default CTA;