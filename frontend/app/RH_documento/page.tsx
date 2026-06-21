"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type DocumentoApi = {
  idDoc: number;
  caminhoArquivo: string;
  dataEnvio: string;
  nomeArquivo: string;
  cpf: string;
  idUsuario: number;
  nomeDoc: string;
  nomeStatus: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusLabel(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("aprov")) return "Aprovado";
  if (normalized.includes("rejeit")) return "Rejeitado";
  if (normalized.includes("anal")) return "Em Análise";
  return "Pendente";
}

function getStatusStyle(status: string) {
  switch (getStatusLabel(status)) {
    case "Aprovado":
      return "bg-green-50 text-green-700 border-green-100";
    case "Em Análise":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "Rejeitado":
      return "bg-red-50 text-red-700 border-red-100";
    default:
      return "bg-amber-50 text-amber-700 border-amber-100";
  }
}

export default function RHDocumentoAnalise() {
  const router = useRouter();
  const [documentos, setDocumentos] = useState<DocumentoApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/tela-de-login");
      return;
    }

    async function loadDocuments() {
      try {
        const profileResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (profileResponse.status === 401) {
          localStorage.removeItem("accessToken");
          router.replace("/tela-de-login");
          return;
        }

        if (!profileResponse.ok) {
          setError("Não foi possível validar o perfil de acesso.");
          return;
        }

        const profile = (await profileResponse.json()) as { perfil: string };
        if (profile.perfil.toLowerCase() !== "rh") {
          router.replace("/colaborador_dashboard");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/documentos/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem("accessToken");
          router.replace("/tela-de-login");
          return;
        }

        if (!response.ok) {
          setError("Não foi possível carregar os documentos.");
          return;
        }

        const data = (await response.json()) as DocumentoApi[];
        setDocumentos(data);
      } catch {
        setError("Erro de conexão com a API.");
      } finally {
        setLoading(false);
      }
    }

    void loadDocuments();
  }, [router]);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return documentos;

    return documentos.filter((doc) =>
      [doc.nomeArquivo, doc.nomeDoc, doc.nomeStatus, doc.cpf, String(doc.idUsuario)]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [documentos, search]);

  const pendingCount = documentos.filter((doc) => getStatusLabel(doc.nomeStatus) === "Pendente").length;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium animate-pulse">Carregando documentos...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-800 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/RH_dashboard" className="text-sm font-medium text-slate-500 hover:text-blue-600">
            Voltar ao dashboard
          </Link>
        </div>

        <section className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">Painel de RH</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">Documentação de Colaboradores</h1>
              <p className="mt-2 text-sm text-slate-500">
                Consulte os documentos enviados pelos colaboradores e acompanhe pendências.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-slate-400">Total</p>
                <p className="text-xl font-bold text-slate-900">{documentos.length}</p>
              </div>
              <div className="rounded-xl bg-amber-50 px-4 py-3">
                <p className="text-amber-600">Pendentes</p>
                <p className="text-xl font-bold text-amber-800">{pendingCount}</p>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por CPF, usuário, tipo, arquivo ou status"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
            />
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-lg font-semibold text-slate-900">Nenhum documento encontrado</h3>
              <p className="mt-2 text-sm text-slate-400">
                Assim que colaboradores enviarem arquivos, eles aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredDocuments.map((doc) => (
                <article key={doc.idDoc} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold text-slate-900">{doc.nomeArquivo}</h3>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusStyle(doc.nomeStatus)}`}>
                        {getStatusLabel(doc.nomeStatus)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Tipo: <span className="font-medium">{doc.nomeDoc}</span> · CPF: {doc.cpf} · Usuário #{doc.idUsuario}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Enviado em {formatDate(doc.dataEnvio)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <button
                      type="button"
                      disabled
                      title="Download será habilitado após a integração do storage"
                      className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500 opacity-60"
                    >
                      Visualizar
                    </button>
                    <button
                      type="button"
                      disabled
                      className="rounded-xl bg-green-50 px-4 py-2 text-xs font-semibold text-green-600 opacity-60"
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      disabled
                      className="rounded-xl bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 opacity-60"
                    >
                      Rejeitar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
