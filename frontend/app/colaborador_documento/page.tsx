"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      return "bg-green-100 text-green-700 border-green-200";
    case "Em Análise":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Rejeitado":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-amber-100 text-amber-700 border-amber-200";
  }
}

export default function ColaboradorDocumento() {
  const router = useRouter();
  const [documentos, setDocumentos] = useState<DocumentoApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        if (profile.perfil.toLowerCase() !== "colaborador") {
          router.replace("/RH_dashboard");
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
          setError("Não foi possível carregar seus documentos.");
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

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium animate-pulse">Carregando seus documentos...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-800 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/colaborador_dashboard" className="text-sm font-medium text-slate-500 hover:text-blue-600">
            Voltar ao dashboard
          </Link>
          <Link
            href="/colaborador_dashboard/enviar-documentos"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Enviar documento
          </Link>
        </div>

        <section className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Meus Documentos</h1>
          <p className="mt-2 text-sm text-slate-500">
            Acompanhe os arquivos enviados e o status de análise pela equipe de RH.
          </p>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {documentos.length === 0 ? (
          <section className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Nenhum documento enviado</h3>
            <p className="mt-2 text-sm text-slate-400">
              Envie seus primeiros documentos para iniciar a análise do RH.
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            {documentos.map((doc) => (
              <article
                key={doc.idDoc}
                className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-semibold text-slate-900">{doc.nomeArquivo}</h3>
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-500">
                      {doc.nomeDoc}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Enviado em {formatDate(doc.dataEnvio)}</p>
                </div>

                <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(doc.nomeStatus)}`}>
                  {getStatusLabel(doc.nomeStatus)}
                </span>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
