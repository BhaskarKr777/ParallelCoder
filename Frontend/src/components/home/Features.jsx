import {
  Users,
  Code2,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: <Users size={30} />,
    title: "Realtime Collaboration",
    description:
      "Code together with teammates in realtime without refreshing.",
  },
  {
    icon: <Code2 size={30} />,
    title: "Multi Language Support",
    description:
      "Work with JavaScript, Python, Java, C++, and more.",
  },
  {
    icon: <Shield size={30} />,
    title: "Secure Authentication",
    description:
      "Simple and secure Google authentication.",
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="bg-black text-white py-24 px-6"
    >
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">

          <p className="text-zinc-500 uppercase tracking-[0.25em] text-sm">
            Features
          </p>

          <h2 className="text-4xl md:text-5xl font-semibold mt-4 tracking-tight">
            Built for developers.
          </h2>

          <p className="text-zinc-400 mt-5 text-lg">
            Everything you need to collaborate and
            build software faster.
          </p>

        </div>

        {/* Features Row */}
        <div className="grid md:grid-cols-3 gap-6">

          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-[30px] border border-zinc-800 bg-zinc-950/50 p-8 hover:border-zinc-700 hover:bg-zinc-900/60 transition duration-300"
            >

              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-6">
                {feature.icon}
              </div>

              <h3 className="text-2xl font-medium mb-3">
                {feature.title}
              </h3>

              <p className="text-zinc-400 leading-relaxed">
                {feature.description}
              </p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
};

export default Features;