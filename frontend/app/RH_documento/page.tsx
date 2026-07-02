"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001";

type ColaboradorApi = {
  cpf: string;
  dataNascimento: string;
  idUsuario: number;
  nome: string;
  email: string;
};

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

type Feedback = { idDoc: number; tipo: "sucesso" | "erro"; mensagem: string };

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function RHDocumentoAnalise() {
  const router = useRouter();

  const [colaboradores, setColaboradores] = useState<ColaboradorApi[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoApi[]>([]);
  const [cpfSelecionado, setCpfSelecionado] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [downloadLoading, setDownloadLoading] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  function handleUnauthorized() {
    localStorage.removeItem("accessToken");
    router.replace("/tela-de-login");
  }

  function authHeaders(token: string): HeadersInit {
    return { Authorization: `Bearer ${token}` };
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/tela-de-login");
      return;
    }

    async function loadData() {
      try {
        const profileResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: authHeaders(token as string),
        });

        if (profileResponse.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!profileResponse.ok) {
          setErro("Não foi possível validar o perfil de acesso.");
          return;
        }

        const profile = (await profileResponse.json()) as { perfil: string };
        if (profile.perfil.toLowerCase() !== "rh") {
          router.replace("/colaborador_dashboard");
          return;
        }

        const [colabRes, docsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/usuarios/colaboradores`, { headers: authHeaders(token as string) }),
          fetch(`${API_BASE_URL}/documentos/`, { headers: authHeaders(token as string) }),
        ]);

        if (colabRes.status === 401 || docsRes.status === 401) {
          handleUnauthorized();
          return;
        }

        if (colabRes.status === 403 || docsRes.status === 403) {
          router.replace("/colaborador_dashboard");
          return;
        }

        if (!colabRes.ok || !docsRes.ok) {
          setErro("Não foi possível carregar os dados de análise.");
          return;
        }

        setColaboradores((await colabRes.json()) as ColaboradorApi[]);
        setDocumentos((await docsRes.json()) as DocumentoApi[]);
      } catch {
        setErro("Erro de conexão com a API.");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const colaboradoresComContagem = useMemo(() => {
    return colaboradores.map((colab) => {
      const docs = documentos.filter((doc) => doc.cpf === colab.cpf);
      return {
        ...colab,
        totalDocumentos: docs.length,
        pendentes: docs.filter((d) => getStatusLabel(d.nomeStatus) === "Pendente").length,
        emAnalise: docs.filter((d) => getStatusLabel(d.nomeStatus) === "Em Análise").length,
        aprovados: docs.filter((d) => getStatusLabel(d.nomeStatus) === "Aprovado").length,
        rejeitados: docs.filter((d) => getStatusLabel(d.nomeStatus) === "Rejeitado").length,
      };
    });
  }, [colaboradores, documentos]);

  const colaboradorSelecionado = colaboradoresComContagem.find((c) => c.cpf === cpfSelecionado) ?? null;
  const documentosDoColaborador = useMemo(
    () => documentos.filter((doc) => doc.cpf === cpfSelecionado),
    [documentos, cpfSelecionado],
  );

  async function handleAvaliar(idDoc: number, novoStatus: "aprovado" | "rejeitado") {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      handleUnauthorized();
      return;
    }

    setActionLoading(idDoc);
    setFeedback(null);

    try {
      const response = await fetch(`${API_BASE_URL}/documentos/${idDoc}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ nomeStatus: novoStatus }),
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const err = (await response.json().catch(() => null)) as { detail?: string } | null;
        setFeedback({ idDoc, tipo: "erro", mensagem: err?.detail ?? "Erro ao atualizar status." });
        return;
      }

      const atualizado = (await response.json()) as DocumentoApi;
      setDocumentos((prev) => prev.map((doc) => (doc.idDoc === idDoc ? atualizado : doc)));
      setFeedback({
        idDoc,
        tipo: "sucesso",
        mensagem: novoStatus === "aprovado" ? "Documento aprovado com sucesso." : "Documento rejeitado.",
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleVisualizar(idDoc: number, nomeArquivo: string) {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      handleUnauthorized();
      return;
    }

    setDownloadLoading(idDoc);
    try {
      const response = await fetch(`${API_BASE_URL}/documentos/${idDoc}/download`, {
        headers: authHeaders(token),
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        alert("Arquivo não disponível no servidor.");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nomeArquivo;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadLoading(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium animate-pulse">Carregando documentos...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-800 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/RH_dashboard" className="text-sm font-medium text-slate-500 hover:text-blue-600">
            Voltar ao dashboard
          </Link>
        </div>

        {erro && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        {!colaboradorSelecionado ? (
          <div>
            <section className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-blue-600">Painel de RH</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">Documentação de Colaboradores</h1>
              <p className="mt-2 text-sm text-slate-500">
                Selecione um colaborador para auditar os arquivos enviados e dar andamento ao processo de onboarding.
              </p>
            </section>

            {colaboradoresComContagem.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Nenhum colaborador cadastrado</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Assim que colaboradores forem cadastrados, eles aparecerão aqui.
                </p>
              </div>
            ) : (
              <section className="rounded-2xl border border-slate-100 bg-white shadow-sm divide-y divide-slate-100">
                {colaboradoresComContagem.map((colab) => (
                  <div
                    key={colab.cpf}
                    className="grid grid-cols-1 items-center gap-4 p-5 sm:grid-cols-[1fr_auto_auto]"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900">{colab.nome}</h3>
                      <p className="text-xs text-slate-400">CPF: {colab.cpf} · {colab.email}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {colab.pendentes > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                          {colab.pendentes} pendente{colab.pendentes > 1 ? "s" : ""}
                        </span>
                      )}
                      {colab.emAnalise > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          {colab.emAnalise} em análise
                        </span>
                      )}
                      {colab.aprovados > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                          {colab.aprovados} aprovado{colab.aprovados > 1 ? "s" : ""}
                        </span>
                      )}
                      {colab.rejeitados > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
                          {colab.rejeitados} rejeitado{colab.rejeitados > 1 ? "s" : ""}
                        </span>
                      )}
                      {colab.totalDocumentos === 0 && (
                        <span className="text-xs text-slate-400">Sem documentos</span>
                      )}
                    </div>

                    <div className="sm:text-right">
                      <button
                        type="button"
                        onClick={() => { setCpfSelecionado(colab.cpf); setFeedback(null); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                      >
                        Ver Documentos
                      </button>
                    </div>
                  </div>
                ))}
              </section>
            )}
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => { setCpfSelecionado(null); setFeedback(null); }}
              className="mb-4 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors group"
            >
              <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Voltar para a lista
            </button>

            <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Análise de Admissão
                </span>
                <h1 className="text-2xl font-bold text-slate-900 mt-2 mb-1">{colaboradorSelecionado.nome}</h1>
                <p className="text-slate-500 text-sm">CPF: {colaboradorSelecionado.cpf}</p>
              </div>
              <div className="text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                <p className="text-xs text-slate-400">E-mail</p>
                <p className="text-sm font-medium text-slate-700">{colaboradorSelecionado.email}</p>
              </div>
            </div>

            {documentosDoColaborador.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center text-slate-400 text-sm">
                Este colaborador ainda não enviou nenhum documento.
              </div>
            ) : (
              <div className="space-y-4">
                {documentosDoColaborador.map((doc) => {
                  const label = getStatusLabel(doc.nomeStatus);
                  const finalizado = label === "Aprovado" || label === "Rejeitado";
                  const isAcao = actionLoading === doc.idDoc;
                  const isDownload = downloadLoading === doc.idDoc;
                  const docFeedback = feedback?.idDoc === doc.idDoc ? feedback : null;

                  return (
                    <div key={doc.idDoc} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900">{doc.nomeArquivo}</h3>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getStatusStyle(doc.nomeStatus)}`}>
                              {label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Tipo: <code className="bg-slate-100 px-1 rounded font-mono text-slate-600">{doc.nomeDoc}</code>
                            {" • "}Recebido em: {formatDate(doc.dataEnvio)}
                          </p>
                          {docFeedback && (
                            <p className={`text-xs mt-2 font-medium ${docFeedback.tipo === "sucesso" ? "text-green-600" : "text-red-600"}`}>
                              {docFeedback.mensagem}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleVisualizar(doc.idDoc, doc.nomeArquivo)}
                            disabled={isDownload}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDownload ? "Baixando..." : "Visualizar ↗"}
                          </button>

                          {!finalizado && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleAvaliar(doc.idDoc, "rejeitado")}
                                disabled={isAcao}
                                className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isAcao ? "..." : "Recusar"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAvaliar(doc.idDoc, "aprovado")}
                                disabled={isAcao}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isAcao ? "..." : "Aprovar"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
