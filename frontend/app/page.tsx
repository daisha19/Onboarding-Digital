import Header from "./components/Header";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <Header />

      <main className="flex flex-col items-center">
        <Hero />
        <Stats />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
