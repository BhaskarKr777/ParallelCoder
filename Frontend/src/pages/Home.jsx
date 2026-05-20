import Navbar from "../components/home/Navbar";
import Hero from "../components/home/Hero";
import WhyParallelCoder from "../components/home/WhyParallelCoder";
import Features from "../components/home/Features";
import CodeWorkspace from "../components/home/CodeWorkspace";
import Testimonials from "../components/home/Testimonials";
import CTA from "../components/home/CTA";
import Footer from "../components/home/Footer";

const Home = () => {
  return (
    <main className="bg-black min-h-screen overflow-hidden">

      <Navbar />

      <Hero />

      <WhyParallelCoder />

      <Features />

      <CodeWorkspace />

      <Testimonials />

      <CTA />

      <Footer />

    </main>
  );
};

export default Home;