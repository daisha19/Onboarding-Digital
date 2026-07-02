"use client";

import Link from "next/link";

export default function CadastroPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-900">
      <div className="mx-auto w-full max-w-lg rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/" className="text-sm text-zinc-500 hover:text-blue-600">
          Voltar
        </Link>

        <div className="mt-6">
          <p className="text-sm font-medium text-blue-600">Cadastro de acesso</p>
          <h1 className="mt-2 text-3xl font-semibold">Seu acesso é criado pelo RH</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Para manter o isolamento dos documentos e o controle do processo admissional, novos colaboradores
            são cadastrados por um usuário de RH dentro do painel administrativo.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          Se você é colaborador, peça ao RH da empresa para criar seu usuário. Depois disso, use o e-mail e a senha recebidos na tela de login.
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/tela-de-login"
            className="inline-flex justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Ir para login
          </Link>
          <Link
            href="/"
            className="inline-flex justify-center rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Página inicial
          </Link>
        </div>
      </div>
    </main>
  );
}
