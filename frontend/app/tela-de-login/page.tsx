"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!email.trim()) e.email = "Preencha o email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email invalido.";
    if (!password) e.password = "Preencha a senha.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), senha: password }),
      });

      if (!loginRes.ok) {
        if (loginRes.status === 401) {
          setAuthError("E-mail ou senha invalidos.");
        } else {
          setAuthError("Erro no servidor. Tente novamente mais tarde.");
        }
        return;
      }

      const loginData = await loginRes.json();
      const token = loginData.accessToken;

      localStorage.setItem("accessToken", token);

      const meRes = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!meRes.ok) {
        localStorage.removeItem("accessToken");
        setAuthError("Erro ao carregar perfil do usuario.");
        return;
      }

      const userData = await meRes.json();
      const perfilUsuario = userData.perfil?.toLowerCase();

      if (perfilUsuario === "rh") {
        router.replace("/RH_dashboard");
      } else if (perfilUsuario === "colaborador") {
        router.replace("/colaborador_dashboard");
      } else {
        localStorage.removeItem("accessToken");
        setAuthError("Perfil de usuario invalido.");
      }
    } catch {
      setAuthError("Erro de conexao com o servidor. Verifique se o backend esta rodando.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md sm:max-w-lg mx-auto bg-white rounded-2xl shadow-lg border border-zinc-100 p-6 sm:p-8">
        <div className="mb-4">
          <Link href="/" className="text-zinc-600 text-sm flex items-center gap-2">
            <span className="inline-block rotate-180">&#10148;</span>
            Voltar
          </Link>
        </div>

        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="6" y="6" width="12" height="12" rx="2" fill="#fff"/></svg>
          </div>
          <h1 className="text-2xl font-semibold">OnBoarding Digital</h1>
          <p className="text-sm text-zinc-500">Sistema de admissao de colaboradores</p>
        </div>

        {authError && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className={`w-full px-4 py-3 rounded-lg border text-zinc-900 ${errors.email ? "border-red-200 bg-red-50" : "border-zinc-100 bg-zinc-50"}`}
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className={`w-full pr-20 px-4 py-3 rounded-lg border text-zinc-900 ${errors.password ? "border-red-200 bg-red-50" : "border-zinc-100 bg-zinc-50"}`}
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-zinc-600 px-2 py-1"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          <button
            className={`w-full mt-2 text-white py-3 rounded-lg ${loading ? "bg-blue-500" : "bg-blue-600 hover:bg-blue-700"}`}
            type="submit"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-zinc-500 gap-3">
          <span className="text-zinc-400">Recuperacao de senha indisponivel</span>
          <Link href="/cadastro" className="text-zinc-600">Criar conta</Link>
        </div>
      </div>
    </div>
  );
}
