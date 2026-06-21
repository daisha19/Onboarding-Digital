'use client';

import { useState, useEffect } from 'react';

// Interface ajustada para refletir os critérios de aceite da Issue #18
interface DocumentoColaborador {
  id: string;
  nome: string;
  tipo: string;
  status: 'Pendente' | 'Em Análise' | 'Aprovado' | 'Rejeitado';
  dataEnvio: string | null;
}

export default function ColaboradorDocumento() {
  // Estado para armazenar a lista de documentos do colaborador logado
  const [documentos, setDocumentos] = useState<DocumentoColaborador[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // MOCK: Simulando o GET /documentos solicitado na Issue
  useEffect(() => {
    const buscarDocumentosDoColaborador = async () => {
      try {
        setLoading(true);
        console.log('[MOCK API] Executando GET /documentos para o colaborador autenticado...');
        
        // Simulando delay da API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Dados simulados baseados no cenário real de um novo contratado
        const dadosMockados: DocumentoColaborador[] = [
          { id: '1', nome: 'Documento de Identidade', tipo: 'RG_CNH', status: 'Aprovado', dataEnvio: '10 Jun 2026, 09:14' },
          { id: '2', nome: 'Inscrição do CPF', tipo: 'CPF', status: 'Em Análise', dataEnvio: '11 Jun 2026, 14:30' },
          { id: '3', nome: 'Comprovante de Residência', tipo: 'RESIDENCIA', status: 'Pendente', dataEnvio: null },
          { id: '4', nome: 'Título de Eleitor', tipo: 'TITULO_ELEITOR', status: 'Pendente', dataEnvio: null },
        ];

        setDocumentos(dadosMockados);
        // Descomente a linha abaixo para testar o estado vazio exigido na issue:
        // setDocumentos([]); 

      } catch (error) {
        console.error('Erro ao buscar documentos:', error);
      } finally {
        setLoading(false);
      }
    };

    buscarDocumentosDoColaborador();
  }, []);

  // Função auxiliar para estilizar as badges de status idênticas às do RH_dashboard
  const getStatusEstilo = (status: string) => {
    switch (status) {
      case 'Aprovado': return 'bg-green-100 text-green-700 border-green-200';
      case 'Em Análise': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Rejeitado': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200'; // Pendente
    }
  };

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
        
        {/* Cabeçalho */}
        <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Meus Documentos</h1>
          <p className="text-slate-500 text-sm">
            Acompanhe aqui o status da validação dos seus documentos enviados para a equipe de Recursos Humanos.
          </p>
        </div>

        {/* Critério de Aceite: Estado Vazio */}
        {documentos.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
            <span className="text-4xl">📂</span>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Nenhum documento solicitado</h3>
            <p className="text-slate-400 text-sm mt-1">O RH ainda não abriu solicitações de documentos para o seu perfil.</p>
          </div>
        ) : (
          /* Lista de Documentos Real */
          <div className="space-y-4">
            {documentos.map((doc) => (
              <div key={doc.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                
                {/* Informações básicas exigidas na issue */}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-slate-900">{doc.nome}</h3>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">
                      {doc.tipo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {doc.dataEnvio ? `Enviado em: ${doc.dataEnvio}` : 'Aguardando envio do arquivo'}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${getStatusEstilo(doc.status)}`}>
                    {doc.status}
                  </span>
                  
                  {/* Se estiver pendente, exibe ação de Upload. Se já foi enviado, desabilita */}
                  {doc.status === 'Pendente' ? (
                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95">
                      Fazer Upload
                    </button>
                  ) : (
                    <button disabled className="bg-slate-100 text-slate-400 text-xs font-semibold px-4 py-2 rounded-xl cursor-not-allowed">
                      Visualizar
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}