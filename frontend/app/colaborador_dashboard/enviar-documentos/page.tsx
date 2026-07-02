"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type TipoDocumento = {
  nomeDoc: string;
  descricao: string;
  obrigatorio: boolean;
};

type UserProfile = {
  idUsuario: number;
  email: string;
  perfil: string;
};

function getInitialsFromText(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function getDisplayNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "colaborador";
  const normalized = localPart.replace(/[._-]+/g, " ").trim();
  if (!normalized) return "Colaborador";
  return normalized
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function EnviarDocumentos() {
  const router = useRouter();

  // Perfil do usuário
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Tipos de documento
  const [tipos, setTipos] = useState<TipoDocumento[]>([]);
  const [tiposLoading, setTiposLoading] = useState(true);

  // Formulário
  const [selectedTipo, setSelectedTipo] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de feedback
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ---- Carregar perfil e tipos de documento ----
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/tela-de-login");
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          localStorage.removeItem("accessToken");
          router.replace("/tela-de-login");
          return;
        }
        const data = (await response.json()) as UserProfile;
        setProfile(data);
      } catch {
        setErrorMessage("Não foi possível carregar o perfil.");
      } finally {
        setProfileLoading(false);
      }
    };

    const loadTipos = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/documentos/tipos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = (await response.json()) as TipoDocumento[];
          setTipos(data);
          if (data.length > 0) setSelectedTipo(data[0].nomeDoc);
        } else {
          setErrorMessage("Erro ao carregar tipos de documento.");
        }
      } catch {
        setErrorMessage("Erro de conexão ao carregar tipos de documento.");
      } finally {
        setTiposLoading(false);
      }
    };

    void loadProfile();
    void loadTipos();
  }, [router]);

  // ---- Limpar mensagens ao mudar seleção ----
  const clearMessages = useCallback(() => {
    setSuccessMessage("");
    setErrorMessage("");
  }, []);

  // ---- Manipular seleção de arquivo ----
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      clearMessages();
      const selected = e.target.files?.[0] ?? null;
      setFile(selected);
    },
    [clearMessages],
  );

  // ---- Envio do formulário ----
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearMessages();

      // Validações
      if (!selectedTipo) {
        setErrorMessage("Selecione um tipo de documento.");
        return;
      }
      if (!file) {
        setErrorMessage("Selecione um arquivo para enviar.");
        return;
      }

      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.replace("/tela-de-login");
        return;
      }

      setSubmitting(true);

      try {
        const formData = new FormData();
        formData.append("nomeDoc", selectedTipo);
        formData.append("arquivo", file);

        const response = await fetch(`${API_BASE_URL}/documentos/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const result = (await response.json()) as {
          mensagem?: string;
          detail?: { message?: string; code?: string } | string;
        };

        if (response.ok) {
          setSuccessMessage(
            result.mensagem ?? "Documento enviado com sucesso!",
          );
          // Resetar formulário
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
          // Erro da API
          const detail = result.detail;
          if (typeof detail === "object" && detail?.message) {
            setErrorMessage(detail.message);
          } else if (typeof detail === "string") {
            setErrorMessage(detail);
          } else {
            setErrorMessage("Erro ao enviar documento. Tente novamente.");
          }
        }
      } catch {
        setErrorMessage(
          "Erro de conexão com o servidor. Verifique sua internet e tente novamente.",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [selectedTipo, file, router, clearMessages],
  );

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.replace("/tela-de-login");
  };

  const profileName = profile?.email
    ? getDisplayNameFromEmail(profile.email)
    : "Colaborador";
  const profileInitials = getInitialsFromText(profileName);

  if (profileLoading || tiposLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f6f7fb] px-4">
        <div className="rounded-2xl border border-white/70 bg-white/90 px-5 py-4 text-zinc-600 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur">
          Carregando...
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3f5fb] text-zinc-900">
      {/* Gradientes de fundo */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.10),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.08),_transparent_28%)]" />

      {/* Header */}
      <header className="relative border-b border-white/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_12px_25px_rgba(37,99,235,0.25)]">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                <path d="M4 4h16v16H4V4Zm2 2v12h12V6H6Zm2 2h8v2H8V8Zm0 4h8v2H8v-2Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-zinc-900">OnBoarding Digital</p>
              <p className="text-xs text-zinc-500">Portal do Colaborador</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/colaborador_dashboard"
              className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-full bg-blue-50 px-4 text-xs font-semibold text-blue-600 hover:bg-blue-100"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v11a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Início
            </Link>

            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-zinc-900">{profileName}</p>
              <p className="text-xs text-zinc-500">{profile?.email ?? ""}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600">
              {profileInitials}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
            >
              <span>Sair</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H4" />
                <path d="M20 4v16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <section className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Caminho de navegação */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/colaborador_dashboard" className="hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
            <path d="M9 18l6-6-6-6" />
          </svg>
          <span className="text-zinc-800 font-medium">Enviar Documentos</span>
        </nav>

        {/* Card principal */}
        <div className="rounded-[1.6rem] border border-white/80 bg-white/90 p-6 sm:p-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-md">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-zinc-900">Enviar Documentos</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Selecione o tipo de documento e faça o upload do arquivo.
            </p>
          </div>

          {/* Mensagem de Sucesso */}
          {successMessage && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-emerald-600 stroke-2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Mensagem de Erro */}
          {errorMessage && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-red-600 stroke-2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção do Tipo de Documento */}
            <div>
              <label htmlFor="tipo-documento" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Tipo de Documento
              </label>
              <select
                id="tipo-documento"
                value={selectedTipo}
                onChange={(e) => {
                  clearMessages();
                  setSelectedTipo(e.target.value);
                }}
                disabled={tipos.length === 0}
                className="block w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
              >
                {tipos.length === 0 ? (
                  <option value="">Nenhum tipo disponível</option>
                ) : (
                  tipos.map((t) => (
                    <option key={t.nomeDoc} value={t.nomeDoc}>
                      {t.descricao} {t.obrigatorio ? "(Obrigatório)" : ""}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Upload de Arquivo */}
            <div>
              <label htmlFor="arquivo" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Arquivo
              </label>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  id="arquivo"
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-600 hover:file:bg-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              {file && (
                <p className="mt-1.5 text-xs text-zinc-500">
                  Arquivo selecionado: <span className="font-medium text-zinc-700">{file.name}</span> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_25px_rgba(37,99,235,0.25)] transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  {/* Spinner de carregamento */}
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  <span>Enviar Documento</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Link Voltar */}
        <div className="mt-6 text-center">
          <Link
            href="/colaborador_dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-blue-600 transition-colors"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Voltar ao Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
