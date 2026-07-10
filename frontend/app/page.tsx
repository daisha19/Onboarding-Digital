import Header from "./Tela Inicial/Header";
import Hero from "./Tela Inicial/Hero";
import Stats from "./Tela Inicial/Stats";
import CTA from "./Tela Inicial/CTA";
import Footer from "./Tela Inicial/Footer";

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
