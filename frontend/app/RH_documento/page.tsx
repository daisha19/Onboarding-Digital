'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000';

interface ColaboradorRH {
  cpf: string;
  email: string;
  idUsuario: number;
  pendentes: number;
  emAnalise: number;
  aprovados: number;
  rejeitados: number;
}

interface Documento {
  idDoc: number;
  nomeArquivo: string;
  nomeDoc: string;
  nomeStatus: string;
  dataEnvio: string;
  caminhoArquivo: string;
  cpf: string;
  idUsuario: number;
}

type Feedback = { idDoc: number; tipo: 'sucesso' | 'erro'; mensagem: string };

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  PENDENTE: 'Pendente',
  em_analise: 'Em Análise',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
};

const STATUS_STYLE: Record<string, string> = {
  Aprovado: 'bg-green-50 text-green-700 border-green-100',
  'Em Análise': 'bg-blue-50 text-blue-700 border-blue-100',
  Rejeitado: 'bg-red-50 text-red-700 border-red-100',
  Pendente: 'bg-amber-50 text-amber-700 border-amber-100',
};

function getStatusLabel(s: string) {
  return STATUS_LABEL[s] ?? s;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function getDisplayName(email: string) {
  const local = email.split('@')[0] ?? 'colaborador';
  return local
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function RHDocumentoAnalise() {
  const router = useRouter();

  const [colaboradores, setColaboradores] = useState<ColaboradorRH[]>([]);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<ColaboradorRH | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [downloadLoading, setDownloadLoading] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [erroGeral, setErroGeral] = useState('');

  function token() {
    return localStorage.getItem('accessToken');
  }

  function handleUnauthorized() {
    localStorage.removeItem('accessToken');
    router.replace('/tela-de-login');
  }

  function authHeaders(): HeadersInit {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` };
  }

  // Carregar lista de colaboradores
  useEffect(() => {
    if (!token()) { router.replace('/tela-de-login'); return; }

    const fetchColabs = async () => {
      try {
        const res = await fetch(`${API}/usuarios/colaboradores`, { headers: authHeaders() });
        if (res.status === 401 || res.status === 403) { handleUnauthorized(); return; }
        if (!res.ok) throw new Error('Erro ao carregar colaboradores');
        setColaboradores(await res.json() as ColaboradorRH[]);
      } catch {
        setErroGeral('Não foi possível carregar os colaboradores.');
      } finally {
        setLoading(false);
      }
    };

    void fetchColabs();
  }, []);

  const handleSelecionarColaborador = async (colab: ColaboradorRH) => {
    setColaboradorSelecionado(colab);
    setDocumentos([]);
    setFeedback(null);
    setLoadingDocs(true);

    try {
      const res = await fetch(`${API}/documentos/colaborador/${colab.cpf}`, { headers: authHeaders() });
      if (res.status === 401 || res.status === 403) { handleUnauthorized(); return; }
      if (!res.ok) throw new Error('Erro ao carregar documentos');
      setDocumentos(await res.json() as Documento[]);
    } catch {
      setErroGeral('Não foi possível carregar os documentos.');
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleAvaliar = async (idDoc: number, novoStatus: 'aprovado' | 'rejeitado') => {
    setActionLoading(idDoc);
    setFeedback(null);

    try {
      const res = await fetch(`${API}/documentos/${idDoc}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ nomeStatus: novoStatus }),
      });

      if (res.status === 401 || res.status === 403) { handleUnauthorized(); return; }

      if (!res.ok) {
        const err = await res.json().catch(() => null) as { detail?: string } | null;
        setFeedback({ idDoc, tipo: 'erro', mensagem: err?.detail ?? 'Erro ao atualizar status.' });
        return;
      }

      const atualizado = await res.json() as Documento;

      // Atualiza o documento na lista sem recarregar
      setDocumentos((prev) => prev.map((d) => (d.idDoc === idDoc ? atualizado : d)));

      // Atualiza os contadores do colaborador na lista principal
      setColaboradores((prev) =>
        prev.map((c) => {
          if (c.cpf !== colaboradorSelecionado?.cpf) return c;
          const eraAprovado = novoStatus === 'aprovado';
          return {
            ...c,
            pendentes: Math.max(0, c.pendentes - 1),
            aprovados: eraAprovado ? c.aprovados + 1 : c.aprovados,
            rejeitados: eraAprovado ? c.rejeitados : c.rejeitados + 1,
          };
        })
      );

      setFeedback({
        idDoc,
        tipo: 'sucesso',
        mensagem: novoStatus === 'aprovado' ? 'Documento aprovado com sucesso.' : 'Documento rejeitado.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleVisualizar = async (idDoc: number, nomeArquivo: string) => {
    setDownloadLoading(idDoc);
    try {
      const res = await fetch(`${API}/documentos/${idDoc}/download`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.status === 401 || res.status === 403) { handleUnauthorized(); return; }
      if (!res.ok) { alert('Arquivo não disponível no servidor.'); return; }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nomeArquivo;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium animate-pulse">Carregando painel de documentos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-800">
      <div className="max-w-5xl mx-auto">

        {erroGeral && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erroGeral}
          </div>
        )}

        {/* TELA 1: LISTA DE COLABORADORES */}
        {!colaboradorSelecionado ? (
          <div>
            <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Documentação de Colaboradores</h1>
              <p className="text-slate-500 text-sm">
                Selecione um colaborador para auditar os arquivos enviados e dar andamento ao processo de onboarding.
              </p>
            </div>

            {colaboradores.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center text-slate-400 text-sm">
                Nenhum colaborador cadastrado ainda.
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 bg-slate-50/70 border-b border-slate-100 grid grid-cols-12 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <div className="col-span-5 pl-4">Colaborador</div>
                  <div className="col-span-4">Documentos</div>
                  <div className="col-span-3 text-right pr-4">Ação</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {colaboradores.map((colab) => (
                    <div key={colab.cpf} className="p-5 grid grid-cols-12 items-center hover:bg-slate-50/50 transition-colors">
                      <div className="col-span-5 pl-4">
                        <p className="font-semibold text-slate-900">{getDisplayName(colab.email)}</p>
                        <p className="text-xs text-slate-400">{colab.email}</p>
                      </div>
                      <div className="col-span-4 flex flex-wrap gap-1.5">
                        {colab.pendentes > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                            {colab.pendentes} pendente{colab.pendentes > 1 ? 's' : ''}
                          </span>
                        )}
                        {colab.emAnalise > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            {colab.emAnalise} em análise
                          </span>
                        )}
                        {colab.aprovados > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                            {colab.aprovados} aprovado{colab.aprovados > 1 ? 's' : ''}
                          </span>
                        )}
                        {colab.rejeitados > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
                            {colab.rejeitados} rejeitado{colab.rejeitados > 1 ? 's' : ''}
                          </span>
                        )}
                        {colab.pendentes === 0 && colab.emAnalise === 0 && colab.aprovados === 0 && colab.rejeitados === 0 && (
                          <span className="text-xs text-slate-400">Sem documentos</span>
                        )}
                      </div>
                      <div className="col-span-3 text-right pr-4">
                        <button
                          onClick={() => handleSelecionarColaborador(colab)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                        >
                          Ver Documentos
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        ) : (

          /* TELA 2: DOCUMENTOS DO COLABORADOR */
          <div>
            <button
              onClick={() => { setColaboradorSelecionado(null); setFeedback(null); setErroGeral(''); }}
              className="mb-4 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors group"
            >
              <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Voltar para a lista
            </button>

            <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Análise de Admissão
                </span>
                <h1 className="text-2xl font-bold text-slate-900 mt-2 mb-1">
                  {getDisplayName(colaboradorSelecionado.email)}
                </h1>
                <p className="text-slate-500 text-sm">CPF: {colaboradorSelecionado.cpf}</p>
              </div>
              <div className="text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                <p className="text-xs text-slate-400">E-mail</p>
                <p className="text-sm font-medium text-slate-700">{colaboradorSelecionado.email}</p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-4">Documentos Enviados</h2>

            {loadingDocs ? (
              <p className="text-sm text-slate-400 animate-pulse py-4">Buscando documentos do servidor...</p>
            ) : documentos.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center text-slate-400 text-sm">
                Este colaborador ainda não enviou nenhum documento.
              </div>
            ) : (
              <div className="space-y-4">
                {documentos.map((doc) => {
                  const label = getStatusLabel(doc.nomeStatus);
                  const finalizado = doc.nomeStatus === 'aprovado' || doc.nomeStatus === 'rejeitado';
                  const isAcao = actionLoading === doc.idDoc;
                  const isDownload = downloadLoading === doc.idDoc;
                  const docFeedback = feedback?.idDoc === doc.idDoc ? feedback : null;

                  return (
                    <div key={doc.idDoc} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900">{doc.nomeArquivo}</h3>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${STATUS_STYLE[label] ?? 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                              {label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Tipo: <code className="bg-slate-100 px-1 rounded font-mono text-slate-600">{doc.nomeDoc}</code>
                            {' • '}Recebido em: {formatDate(doc.dataEnvio)}
                          </p>
                          {docFeedback && (
                            <p className={`text-xs mt-2 font-medium ${docFeedback.tipo === 'sucesso' ? 'text-green-600' : 'text-red-600'}`}>
                              {docFeedback.mensagem}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                          <button
                            onClick={() => handleVisualizar(doc.idDoc, doc.nomeArquivo)}
                            disabled={isDownload}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDownload ? 'Baixando...' : 'Visualizar ↗'}
                          </button>

                          {!finalizado && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAvaliar(doc.idDoc, 'rejeitado')}
                                disabled={isAcao}
                                className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isAcao ? '...' : 'Recusar'}
                              </button>
                              <button
                                onClick={() => handleAvaliar(doc.idDoc, 'aprovado')}
                                disabled={isAcao}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isAcao ? '...' : 'Aprovar'}
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
    </div>
  );
}
