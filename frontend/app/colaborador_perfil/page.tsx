'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000';

interface Perfil {
  idUsuario: number;
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string;
}

function maskCpf(cpf: string) {
  if (cpf.length !== 11) return cpf;
  return `${cpf.slice(0, 3)}.***.***-${cpf.slice(9)}`;
}

function formatDate(iso: string) {
  try {
    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
  } catch {
    return iso;
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function ColaboradorPerfil() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.replace('/tela-de-login'); return; }

    const fetchPerfil = async () => {
      try {
        const res = await fetch(`${API}/usuarios/me/perfil`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('accessToken');
          router.replace('/tela-de-login');
          return;
        }

        if (!res.ok) throw new Error();
        setPerfil(await res.json() as Perfil);
      } catch {
        setErro('Não foi possível carregar seu perfil.');
      } finally {
        setLoading(false);
      }
    };

    void fetchPerfil();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium animate-pulse">Carregando perfil...</p>
      </div>
    );
  }

  const nome = perfil?.nome ?? '';
  const iniciais = getInitials(nome);

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-800">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Meu Perfil</h1>
            <p className="text-slate-500 text-sm mt-1">Suas informações cadastradas no sistema.</p>
          </div>
          <Link
            href="/colaborador_dashboard"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
          >
            ← Voltar
          </Link>
        </div>

        {erro && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        {perfil && (
          <div className="space-y-4">
            {/* Avatar + nome */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white shadow">
                {iniciais}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{nome}</p>
                <p className="text-sm text-slate-500">{perfil.email}</p>
                <span className="mt-1 inline-block rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-600">
                  Colaborador
                </span>
              </div>
            </div>

            {/* Dados cadastrais */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                Dados Cadastrais
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-400 mb-1">E-mail</p>
                  <p className="text-sm font-medium text-slate-900">{perfil.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">CPF</p>
                  <p className="text-sm font-medium text-slate-900 font-mono">{maskCpf(perfil.cpf)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Data de Nascimento</p>
                  <p className="text-sm font-medium text-slate-900">{formatDate(perfil.dataNascimento)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">ID do Usuário</p>
                  <p className="text-sm font-medium text-slate-900 font-mono">#{perfil.idUsuario}</p>
                </div>
              </div>
            </div>

            {/* Ações rápidas */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                Ações
              </h2>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/colaborador_dashboard/enviar-documentos"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
                >
                  Enviar Documentos
                </Link>
                <Link
                  href="/colaborador_documento"
                  className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors"
                >
                  Meus Documentos
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
