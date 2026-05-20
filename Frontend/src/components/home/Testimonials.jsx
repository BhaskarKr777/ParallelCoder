const community = [
  {
    title: "Built for Developers",
    description:
      "Designed for developers who want fast and seamless collaboration.",
  },
  {
    title: "Open Source Vision",
    description:
      "Parallel Coder is evolving with community contributions and ideas.",
  },
  {
    title: "Made for Teams",
    description:
      "From students to startups, collaborate in realtime effortlessly.",
  },
];

const Testimonials = () => {
  return (
    <section className="bg-black text-white py-28 px-6">

      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">

          <p className="text-zinc-500 uppercase tracking-[0.25em] text-sm">
            Community
          </p>

          <h2 className="text-4xl md:text-5xl font-semibold mt-4 tracking-tight">
            Built for developers,
            <br />
            teams and builders.
          </h2>

        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">

          {community.map((item, index) => (
            <div
              key={index}
              className="rounded-[30px] border border-zinc-800 bg-zinc-950/50 p-8 hover:border-zinc-700 transition"
            >

              <h3 className="text-2xl font-semibold mb-4">
                {item.title}
              </h3>

              <p className="text-zinc-400 leading-relaxed">
                {item.description}
              </p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
};

export default Testimonials;