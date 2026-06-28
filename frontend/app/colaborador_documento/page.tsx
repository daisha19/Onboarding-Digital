'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000';

interface Documento {
  idDoc: number;
  nomeArquivo: string;
  nomeDoc: string;
  nomeStatus: string;
  dataEnvio: string;
}

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  PENDENTE: 'Pendente',
  em_analise: 'Em Análise',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
};

const STATUS_STYLE: Record<string, string> = {
  Aprovado: 'bg-green-100 text-green-700 border-green-200',
  'Em Análise': 'bg-blue-100 text-blue-700 border-blue-200',
  Rejeitado: 'bg-red-100 text-red-700 border-red-200',
  Pendente: 'bg-amber-100 text-amber-700 border-amber-200',
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

export default function ColaboradorDocumento() {
  const router = useRouter();
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [downloadLoading, setDownloadLoading] = useState<number | null>(null);
  const tokenRef = useRef<string | null>(null);

  const handleVisualizar = async (idDoc: number, nomeArquivo: string) => {
    setDownloadLoading(idDoc);
    try {
      const res = await fetch(`${API}/documentos/${idDoc}/download`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('accessToken');
        router.replace('/tela-de-login');
        return;
      }
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

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.replace('/tela-de-login'); return; }
    tokenRef.current = token;

    const fetchDocs = async () => {
      try {
        const res = await fetch(`${API}/documentos/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('accessToken');
          router.replace('/tela-de-login');
          return;
        }

        if (!res.ok) throw new Error('Falha ao carregar documentos');

        setDocumentos(await res.json() as Documento[]);
      } catch {
        setErro('Não foi possível carregar seus documentos. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    void fetchDocs();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium animate-pulse">Carregando seus documentos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-800">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Meus Documentos</h1>
              <p className="text-slate-500 text-sm">
                Acompanhe o status da validação dos seus documentos enviados ao RH.
              </p>
            </div>
            <Link
              href="/colaborador_dashboard"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
            >
              ← Voltar
            </Link>
          </div>
        </div>

        {erro && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        {documentos.length === 0 && !erro ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
            <div className="text-4xl mb-4">📂</div>
            <h3 className="text-lg font-semibold text-slate-900">Nenhum documento enviado</h3>
            <p className="text-slate-400 text-sm mt-1">
              Você ainda não enviou nenhum documento.
            </p>
            <Link
              href="/colaborador_dashboard/enviar-documentos"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Enviar agora
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {documentos.map((doc) => {
              const label = getStatusLabel(doc.nomeStatus);

              return (
                <div
                  key={doc.idDoc}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-slate-900">{doc.nomeArquivo}</h3>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">
                        {doc.nomeDoc}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Enviado em: {formatDate(doc.dataEnvio)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${STATUS_STYLE[label] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {label}
                    </span>

                    <button
                      onClick={() => handleVisualizar(doc.idDoc, doc.nomeArquivo)}
                      disabled={downloadLoading === doc.idDoc}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadLoading === doc.idDoc ? 'Baixando...' : 'Visualizar ↗'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
