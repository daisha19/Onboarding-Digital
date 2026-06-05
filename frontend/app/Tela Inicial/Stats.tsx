export default function Stats() {
  return (
    <section className="w-full max-w-5xl mx-auto px-8 py-12">
      <div className="bg-white border border-zinc-100 rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="text-center sm:text-left">
          <div className="text-2xl font-bold">1000+</div>
          <div className="text-sm text-zinc-500">Colaboradores cadastrados</div>
        </div>

        <div className="text-center sm:text-left">
          <div className="text-2xl font-bold">5000+</div>
          <div className="text-sm text-zinc-500">Documentos processados</div>
        </div>

        <div className="text-center sm:text-left">
          <div className="text-2xl font-bold">95%</div>
          <div className="text-sm text-zinc-500">Taxa de aprovação</div>
        </div>
      </div>
    </section>
  );
}
