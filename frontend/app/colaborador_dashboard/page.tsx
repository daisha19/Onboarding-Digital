    "use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001";

type UserProfile = {
  idUsuario: number;
  nome: string;
  email: string;
  perfil: string;
};

type DocumentSummary = {
  aprovados: number;
  emAnalise: number;
  pendentes: number;
  total: number;
};

type DocumentoApi = {
  nomeStatus: string;
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

export default function ColaboradorDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [summary, setSummary] = useState<DocumentSummary>({
    aprovados: 0,
    emAnalise: 0,
    pendentes: 0,
    total: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/tela-de-login");
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("accessToken");
          router.replace("/tela-de-login");
          return;
        }

        const data = (await response.json()) as UserProfile;
        if (data.perfil.toLowerCase() !== "colaborador") {
          router.replace("/RH_dashboard");
          return;
        }
        setProfile(data);

        const documentsResponse = await fetch(`${API_BASE_URL}/documentos/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (documentsResponse.ok) {
          const documents = (await documentsResponse.json()) as DocumentoApi[];
          const statuses = documents.map((document) => document.nomeStatus.toLowerCase());
          setSummary({
            aprovados: statuses.filter((value) => value.includes("aprov")).length,
            emAnalise: statuses.filter((value) => value.includes("anal")).length,
            pendentes: statuses.filter(
              (value) => !value.includes("aprov") && !value.includes("anal") && !value.includes("rejeit"),
            ).length,
            total: documents.length,
          });
        } else {
          setError("Não foi possível carregar o resumo dos documentos.");
        }
      } catch {
        setError("Não foi possível carregar o perfil do colaborador.");
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.replace("/tela-de-login");
  };

  const profileName = profile?.nome || (profile?.email ? getDisplayNameFromEmail(profile.email) : "Colaborador");
  const profileInitials = getInitialsFromText(profileName);
  
  // Cálculo da porcentagem da barra de progresso
  const progressPercentage = Math.min(
    100,
    summary.total === 0 ? 0 : Math.round((summary.aprovados / summary.total) * 100)
  );

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f6f7fb] px-4">
        <div className="rounded-2xl border border-white/70 bg-white/90 px-5 py-4 text-zinc-600 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur">
          Carregando painel do colaborador...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f6f7fb] px-4">
        <div className="max-w-md rounded-3xl border border-red-100 bg-white p-6 text-center shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
          <p className="text-red-700">{error}</p>
          <Link href="/tela-de-login" className="mt-4 inline-flex rounded-full bg-blue-600 px-4 py-2 text-white">
            Ir para login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3f5fb] text-zinc-900">
      {/* Mesmos gradientes de fundo do painel de RH */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.10),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.08),_transparent_28%)]" />
      
      {/* Header unificado */}
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
            {/* Botão de Início destacado conforme o protótipo */}
            <button className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-full bg-blue-50 px-4 text-xs font-semibold text-blue-600">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v11a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Início
            </button>

            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-zinc-900">{profileName}</p>
              <p className="text-xs text-zinc-500">{profile?.email ?? "colaborador@empresa.com"}</p>
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

      {/* Conteúdo Principal */}
      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        
        {/* Banner de Boas-vindas e Progresso (image_b44046.jpg) */}
        <div className="mb-6 rounded-[1.6rem] bg-blue-600 p-6 sm:p-8 text-white shadow-[0_12px_35px_rgba(37,99,235,0.2)]">
          <h1 className="text-2xl font-semibold sm:text-3xl">Bem-vindo, {profileName.split(" ")[0]}! </h1>
          <p className="mt-1 text-sm text-blue-100">
            Complete o envio dos seus documentos para finalizar o processo de admissão
          </p>
          
          <div className="mt-8">
            <div className="flex justify-between text-xs font-medium text-blue-100 mb-2">
              <span>Progresso de Admissão</span>
              <span>{summary.aprovados} de {summary.total} documentos</span>
            </div>
            {/* Barra de progresso */}
            <div className="w-full h-2.5 bg-blue-700/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          <p className="mt-4 text-xs text-blue-200">
            Faltam {summary.pendentes} documentos para completar seu cadastro.
          </p>
        </div>

        {/* Alerta de Prazo */}
        <div className="mb-6 flex items-start gap-3 rounded-[1rem] border border-zinc-200 bg-white/80 p-4 text-sm text-zinc-600 shadow-sm backdrop-blur-md">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 text-zinc-400 shrink-0 fill-none stroke-current stroke-2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <p>
            Por favor, envie os documentos pendentes o quanto antes. A equipe de RH irá analisar e aprovar em até 48 horas.
          </p>
        </div>

        {/* Grid de Conteúdo Bifurcado (Ações à esquerda, Resumo à direita) */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Seção de Ações Rápidas (Ocupa 2 colunas no desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-900">Ações Rápidas</h3>
              <p className="text-xs text-zinc-500">Acesse as principais funcionalidades</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Card 1: Enviar Documentos */}
              <Link href="/colaborador_dashboard/enviar-documentos" className="group rounded-[1.25rem] border border-white/80 bg-white/90 p-5 shadow-[0_8px_25px_rgba(15,23,42,0.04)] transition hover:scale-[1.01] hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                </div>
                <h4 className="mt-4 font-semibold text-zinc-900 text-sm">Enviar Documentos</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Faça upload dos documentos necessários</p>
              </Link>

              {/* Card 2: Meus Documentos */}
              <Link href="/colaborador_documento" className="group rounded-[1.25rem] border border-white/80 bg-white/90 p-5 shadow-[0_8px_25px_rgba(15,23,42,0.04)] transition hover:scale-[1.01] hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                  </svg>
                </div>
                <h4 className="mt-4 font-semibold text-zinc-900 text-sm">Meus Documentos</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Visualize o status dos seus documentos</p>
              </Link>

              {/* Card 3: Meu Perfil */}
              <Link href="/colaborador_perfil" className="group rounded-[1.25rem] border border-white/80 bg-white/90 p-5 shadow-[0_8px_25px_rgba(15,23,42,0.04)] transition hover:scale-[1.01] hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h4 className="mt-4 font-semibold text-zinc-900 text-sm">Meu Perfil</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Gerencie suas informações pessoais</p>
              </Link>

              {/* Card 4: Suporte */}
              <div className="rounded-[1.25rem] border border-white/80 bg-white/70 p-5 opacity-70 shadow-[0_8px_25px_rgba(15,23,42,0.04)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <path d="m22 6-10 7L2 6" />
                  </svg>
                </div>
                <h4 className="mt-4 font-semibold text-zinc-900 text-sm">Suporte</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Entre em contato com o RH</p>
              </div>
            </div>
          </div>

          {/* Lateral de Resumo por Status (Ocupa 1 coluna no desktop) */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-900">Resumo</h3>
              <p className="text-xs text-zinc-500">Acompanhamento de status</p>
            </div>

            <div className="rounded-[1.25rem] border border-white/80 bg-white/90 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] space-y-3">
              {/* Status: Aprovados */}
              <div className="flex items-center justify-between rounded-xl bg-emerald-50/60 p-3.5 text-sm">
                <div className="flex items-center gap-2.5 text-emerald-800 font-medium">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="M22 4L12 14.01l-3-3" />
                  </svg>
                  <span>Aprovados</span>
                </div>
                <span className="font-bold text-emerald-900">{summary.aprovados}</span>
              </div>

              {/* Status: Em Análise */}
              <div className="flex items-center justify-between rounded-xl bg-blue-50/60 p-3.5 text-sm">
                <div className="flex items-center gap-2.5 text-blue-800 font-medium">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span>Em Análise</span>
                </div>
                <span className="font-bold text-blue-900">{summary.emAnalise}</span>
              </div>

              {/* Status: Pendentes */}
              <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-3.5 text-sm border border-zinc-100">
                <div className="flex items-center gap-2.5 text-zinc-600 font-medium">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                  <span>Pendentes</span>
                </div>
                <span className="font-bold text-zinc-800">{summary.pendentes}</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
