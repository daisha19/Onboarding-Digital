import Link from "next/link";

export default function CTA() {
  return (
    <section className="w-full max-w-5xl mx-auto px-8 py-12">
      <div className="bg-blue-600 text-white rounded-xl p-10 text-center">
        <h3 className="text-2xl font-bold">Pronto para começar?</h3>
        <p className="text-zinc-100 mt-2">Acesse sua conta ou fale com o RH para receber suas credenciais de onboarding.</p>
        <div className="mt-6">
          <Link className="bg-white text-blue-600 px-5 py-2 rounded-md font-semibold" href="/tela-de-login">Entrar na plataforma</Link>
        </div>
      </div>
    </section>
  );
}
