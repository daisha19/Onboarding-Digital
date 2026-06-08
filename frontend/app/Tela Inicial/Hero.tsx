import Link from "next/link";

export default function Hero() {
  return (
    <section className="w-full max-w-5xl mx-auto px-8 py-16">
      <div className="flex flex-col items-center text-center gap-6">
        <span className="inline-block bg-blue-50 text-blue-700 rounded-full px-4 py-2 text-sm">Plataforma segura e confiável</span>
        <h1 className="text-5xl font-extrabold leading-tight text-zinc-900">
          Simplifique o processo de <span className="text-blue-600">admissão</span>
        </h1>
        <p className="max-w-2xl text-zinc-600">
          Gerencie documentos admissionais de forma digital, segura e eficiente. Economize tempo e reduza a burocracia.
        </p>

        <div className="flex items-center gap-4 mt-6">
          <Link href="/cadastro" className="bg-blue-600 text-white px-6 py-3 rounded-md shadow">Começar Agora</Link>
          <Link href="/tela-de-login" className="border border-zinc-200 px-5 py-3 rounded-md">Já tenho conta</Link>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-sm border border-zinc-100">
          <div className="w-10 h-10 bg-blue-50 rounded-md flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3 6-6" stroke="#2B6CB0" strokeWidth="1.5"/></svg>
          </div>
          <h4 className="font-semibold">Upload Simplificado</h4>
          <p className="text-sm text-zinc-500 mt-2">Envie seus documentos de forma rápida e segura. Interface intuitiva e fácil de usar.</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border border-zinc-100">
          <div className="w-10 h-10 bg-blue-50 rounded-md flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 6v6l4 2" stroke="#2B6CB0" strokeWidth="1.5"/></svg>
          </div>
          <h4 className="font-semibold">Acompanhamento em Tempo Real</h4>
          <p className="text-sm text-zinc-500 mt-2">Monitore o status dos seus documentos e receba notificações sobre aprovações.</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border border-zinc-100">
          <div className="w-10 h-10 bg-blue-50 rounded-md flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2l3 2 3 3v5a7 7 0 11-12 0V7l3-3 3-2z" stroke="#2B6CB0" strokeWidth="1.2"/></svg>
          </div>
          <h4 className="font-semibold">Segurança Garantida</h4>
          <p className="text-sm text-zinc-500 mt-2">Seus dados protegidos com criptografia e conformidade com a LGPD.</p>
        </div>
      </div>
    </section>
  );
}