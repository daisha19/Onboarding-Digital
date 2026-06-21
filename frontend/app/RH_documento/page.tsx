'use client';

import { useState, useEffect } from 'react';

// Interfaces estruturadas para o fluxo mestre-detalhe
interface Colaborador {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  documentosPendentes: number;
}

interface DocumentoAnalise {
  id: string;
  nome: string;
  tipo: string;
  status: 'Pendente' | 'Em Análise' | 'Aprovado' | 'Rejeitado';
  dataEnvio: string | null;
  arquivoUrl: string | null;
}

export default function RHDocumentoAnalise() {
  // Estados para gerenciar qual visualização exibir
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<Colaborador | null>(null);
  const [documentos, setDocumentos] = useState<DocumentoAnalise[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(false);

  // MOCK: GET /rh/colaboradores para listar todos na raiz da página
  useEffect(() => {
    const buscarColaboradores = async () => {
      try {
        setLoading(true);
        // Simulando delay da API
        await new Promise((resolve) => setTimeout(resolve, 600));

        const listaMockada: Colaborador[] = [
          { id: '101', nome: 'João Santos', email: 'joao.santos@email.com', cargo: 'Desenvolvedor Júnior', departamento: 'Tecnologia', documentosPendentes: 1 },
          { id: '102', nome: 'Ana Costa', email: 'ana.costa@email.com', cargo: 'Designer UI/UX', departamento: 'Design', documentosPendentes: 2 },
          { id: '103', nome: 'Carlos Silva', email: 'carlos.silva@email.com', cargo: 'Analista de Marketing', departamento: 'Comunicação', documentosPendentes: 0 },
        ];
        setColaboradores(listaMockada);
      } catch (error) {
        console.error('Erro ao buscar colaboradores:', error);
      } finally {
        setLoading(false);
      }
    };
    buscarColaboradores();
  }, []);

  // MOCK: GET /rh/colaboradores/{id}/documentos disparado ao clicar em um item da lista
  const handleSelecionarColaborador = async (colab: Colaborador) => {
    setColaboradorSelecionado(colab);
    setLoadingDocs(true);
    console.log(`[MOCK API] Buscando documentos reais enviados por ID: ${colab.id} (${colab.nome})`);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Simulando documentos dinâmicos baseados em quem foi clicado
      let docsMockados: DocumentoAnalise[] = [];
      
      if (colab.id === '101') {
        docsMockados = [
          { id: '1', nome: 'Documento de Identidade (Frente e Verso)', tipo: 'RG_CNH', status: 'Em Análise', dataEnvio: '12 Jun 2026, 09:14', arquivoUrl: '#' },
          { id: '2', nome: 'Inscrição do CPF', tipo: 'CPF', status: 'Aprovado', dataEnvio: '12 Jun 2026, 09:15', arquivoUrl: '#' },
          { id: '3', nome: 'Comprovante de Residência', tipo: 'RESIDENCIA', status: 'Pendente', dataEnvio: null, arquivoUrl: null },
        ];
      } else if (colab.id === '102') {
        docsMockados = [
          { id: '4', nome: 'Documento de Identidade (Frente e Verso)', tipo: 'RG_CNH', status: 'Em Análise', dataEnvio: '11 Jun 2026, 11:42', arquivoUrl: '#' },
          { id: '5', nome: 'Comprovante de Residência', tipo: 'RESIDENCIA', status: 'Em Análise', dataEnvio: '11 Jun 2026, 11:45', arquivoUrl: '#' },
        ];
      } else {
        docsMockados = [
          { id: '6', nome: 'Documento de Identidade (Frente e Verso)', tipo: 'RG_CNH', status: 'Aprovado', dataEnvio: '05 Jun 2026, 16:05', arquivoUrl: '#' },
          { id: '7', nome: 'Inscrição do CPF', tipo: 'CPF', status: 'Aprovado', dataEnvio: '05 Jun 2026, 16:10', arquivoUrl: '#' },
          { id: '8', nome: 'Comprovante de Residência', tipo: 'RESIDENCIA', status: 'Aprovado', dataEnvio: '06 Jun 2026, 10:00', arquivoUrl: '#' },
        ];
      }

      setDocumentos(docsMockados);
    } catch (error) {
      console.error('Erro ao buscar documentos do colaborador:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  // Função para simular a alteração de status (Aprovar/Rejeitar)
  const handleAvaliarDocumento = async (id: string, novoStatus: 'Aprovado' | 'Rejeitado') => {
    console.log(`[MOCK API] Atualizando documento ${id} para status: ${novoStatus}`);
    setDocumentos((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, status: novoStatus } : doc))
    );
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
        
        {/* TELA 1: LISTA PRINCIPAL DE COLABORADORES */}
        {!colaboradorSelecionado ? (
          <div>
            <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Documentação de Colaboradores</h1>
              <p className="text-slate-500 text-sm">
                Selecione um profissional abaixo para auditar os arquivos enviados e dar andamento ao processo de onboarding digital.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 bg-slate-50/70 border-b border-slate-100 grid grid-cols-12 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <div className="col-span-5 pl-4">Colaborador</div>
                <div className="col-span-4">Cargo / Departamento</div>
                <div className="col-span-3 text-right pr-4">Ação</div>
              </div>

              <div className="divide-y divide-slate-100">
                {colaboradores.map((colab) => (
                  <div key={colab.id} className="p-5 grid grid-cols-12 items-center hover:bg-slate-50/50 transition-colors">
                    <div className="col-span-5 pl-4">
                      <p className="font-semibold text-slate-900">{colab.nome}</p>
                      <p className="text-xs text-slate-400">{colab.email}</p>
                    </div>
                    <div className="col-span-4">
                      <p className="text-sm text-slate-700 font-medium">{colab.cargo}</p>
                      <p className="text-xs text-slate-400">{colab.departamento}</p>
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
          </div>
        ) : (
          
          /* TELA 2: VISUALIZAÇÃO DOS DOCUMENTOS DO COLABORADOR SELECIONADO */
          <div>
            {/* Botão de Voltar para a lista */}
            <button
              onClick={() => setColaboradorSelecionado(null)}
              className="mb-4 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors group"
            >
              <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Voltar para a lista
            </button>

            {/* Banner do Colaborador */}
            <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Análise de Admissão
                </span>
                <h1 className="text-2xl font-bold text-slate-900 mt-2 mb-1">{colaboradorSelecionado.nome}</h1>
                <p className="text-slate-500 text-sm">
                  {colaboradorSelecionado.cargo} • <span className="text-slate-400">{colaboradorSelecionado.departamento}</span>
                </p>
              </div>
              <div className="text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                <p className="text-xs text-slate-400">E-mail do candidato</p>
                <p className="text-sm font-medium text-slate-700">{colaboradorSelecionado.email}</p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-4">Documentos Enviados</h2>

            {loadingDocs ? (
              <p className="text-sm text-slate-400 animate-pulse py-4">Buscando documentos do servidor...</p>
            ) : (
              <div className="space-y-4">
                {documentos.map((doc) => (
                  <div key={doc.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{doc.nome}</h3>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                          doc.status === 'Aprovado' ? 'bg-green-50 text-green-700 border-green-100' :
                          doc.status === 'Em Análise' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          doc.status === 'Rejeitado' ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Tipo interno: <code className="bg-slate-100 px-1 rounded font-mono text-slate-600">{doc.tipo}</code> 
                        {doc.dataEnvio && ` • Recebido em: ${doc.dataEnvio}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                      {doc.arquivoUrl ? (
                        <a 
                          href={doc.arquivoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
                        >
                          Visualizar Anexo ↗
                        </a>
                      ) : (
                        <button disabled className="bg-slate-50 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl cursor-not-allowed">
                          Sem Arquivo
                        </button>
                      )}

                      {doc.status === 'Em Análise' && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleAvaliarDocumento(doc.id, 'Rejeitado')}
                            className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2.5 rounded-xl transition-colors"
                          >
                            Recusar
                          </button>
                          <button 
                            onClick={() => handleAvaliarDocumento(doc.id, 'Aprovado')}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                          >
                            Aprovar
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}