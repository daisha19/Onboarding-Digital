"use client";

import Link from "next/link";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!nome || !email || !cpf || !dataNascimento) {
      setError("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          email,
          cpf,
          dataNascimento,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { detail?: string } | null;
        setError(data?.detail ?? "Nao foi possivel concluir o cadastro.");
        return;
      }

      setSuccess("Solicitacao enviada. O RH ira analisar seu cadastro e voce recebera as instrucoes por email se for aprovado.");
      setNome("");
      setEmail("");
      setCpf("");
      setDataNascimento("");
    } catch {
      setError("Erro ao conectar com a API. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-900">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/" className="text-sm text-zinc-500">
          Voltar
        </Link>

        <div className="mt-6">
          <p className="text-sm font-medium text-blue-600">Cadastro de colaborador</p>
          <h1 className="mt-2 text-3xl font-semibold">Solicitar acesso</h1>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700" htmlFor="cadastro-nome">
              Nome completo
            </label>
            <input
              id="cadastro-nome"
              type="text"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700" htmlFor="cadastro-email">
              Email
            </label>
            <input
              id="cadastro-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700" htmlFor="cadastro-cpf">
              CPF
            </label>
            <input
              id="cadastro-cpf"
              type="text"
              value={cpf}
              onChange={(event) => setCpf(event.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="00000000000"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700" htmlFor="cadastro-data-nascimento">
              Data de nascimento
            </label>
            <input
              id="cadastro-data-nascimento"
              type="date"
              value={dataNascimento}
              onChange={(event) => setDataNascimento(event.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading ? "Enviando..." : "Enviar solicitacao"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Ja tem conta? <Link href="/tela-de-login" className="font-medium text-blue-600">Entrar</Link>
        </p>
      </div>
    </main>
  );
}
