"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001";

type DashboardTab = "solicitacoes" | "colaboradores" | "documentos" | "auditoria";
type CollaboratorStatus = "Pendente" | "Em Análise" | "Aprovado";
type DocumentStatus = "Pendente" | "Em análise" | "Aprovado" | "Rejeitado";

type UserProfile = {
  idUsuario: number;
  nome: string;
  email: string;
  perfil: string;
};

type ApiColaborador = {
  cpf: string;
  dataNascimento: string;
  idUsuario: number;
  nome: string;
  email: string;
};

type RegistrationRequest = {
  idSolicitacao: number;
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string;
  status: "pendente" | "aprovado" | "recusado";
  motivoRecusa?: string | null;
  criadoEm: string;
  avaliadoEm?: string | null;
};

type ApiDocumento = {
  idDoc: number;
  caminhoArquivo: string;
  dataEnvio: string;
  nomeArquivo: string;
  cpf: string;
  idUsuario: number;
  nomeDoc: string;
  nomeStatus: string;
};

type ApiAuditLog = {
  idAuditoria: number;
  descricao: string;
  dataHora: string;
  idUsuario: number;
  idDoc: number;
  nomeAcao: string;
};

type CollaboratorRow = {
  id: number;
  cpf: string;
  name: string;
  email: string;
  role: string;
  department: string;
  progress: number;
  steps: number;
  status: CollaboratorStatus;
  initials: string;
  phone: string;
  lastUpdate: string;
  documents: string[];
};

type DocumentRow = {
  id: number;
  title: string;
  collaborator: string;
  status: DocumentStatus;
  submittedAt: string;
  note: string;
};

type AuditRow = {
  id: number;
  time: string;
  title: string;
  description: string;
};

type CollaboratorForm = {
  email: string;
  senha: string;
  cpf: string;
  dataNascimento: string;
};

class UnauthorizedRequestError extends Error {}

const collaboratorStatusStyles: Record<CollaboratorStatus, string> = {
  Pendente: "bg-indigo-600 text-white",
  "Em Análise": "bg-blue-500 text-white",
  Aprovado: "bg-emerald-500 text-white",
};

const documentStatusStyles: Record<DocumentStatus, string> = {
  Pendente: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  "Em análise": "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  Aprovado: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  Rejeitado: "bg-red-100 text-red-700 ring-1 ring-red-200",
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
  const localPart = email.split("@")[0] ?? "novo colaborador";
  const normalized = localPart.replace(/[._-]+/g, " ").trim();

  if (!normalized) {
    return "Novo colaborador";
  }

  return normalized
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeStatusKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .trim();
}

function normalizeDocumentStatus(value: string): DocumentStatus {
  const normalized = normalizeStatusKey(value);

  if (normalized.includes("aprov")) {
    return "Aprovado";
  }

  if (normalized.includes("analise") || normalized.includes("revis")) {
    return "Em análise";
  }

  if (normalized.includes("rejeit") || normalized.includes("recus")) {
    return "Rejeitado";
  }

  return "Pendente";
}

function getCollaboratorStatus(documents: ApiDocumento[]): CollaboratorStatus {
  if (documents.length === 0) {
    return "Pendente";
  }

  const statuses = documents.map((documento) => normalizeDocumentStatus(documento.nomeStatus));

  if (statuses.every((status) => status === "Aprovado")) {
    return "Aprovado";
  }

  if (statuses.some((status) => status === "Em análise")) {
    return "Em Análise";
  }

  return "Pendente";
}

function formatProgress(progress: number, steps: number) {
  return `${progress}/${steps}`;
}

function getProgressPercent(progress: number, steps: number) {
  if (steps <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((progress / steps) * 100));
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Sem data";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getLatestDocumentDate(documents: ApiDocumento[]) {
  const timestamps = documents
    .map((documento) => new Date(documento.dataEnvio).getTime())
    .filter((timestamp) => !Number.isNaN(timestamp));

  if (timestamps.length === 0) {
    return null;
  }

  return new Date(Math.max(...timestamps)).toISOString();
}

function groupDocumentsByUser(documents: ApiDocumento[]) {
  return documents.reduce<Map<number, ApiDocumento[]>>((acc, documento) => {
    const current = acc.get(documento.idUsuario) ?? [];
    current.push(documento);
    acc.set(documento.idUsuario, current);
    return acc;
  }, new Map<number, ApiDocumento[]>());
}

function mapCollaborators(
  colaboradores: ApiColaborador[],
  documentos: ApiDocumento[],
): CollaboratorRow[] {
  const documentsByUser = groupDocumentsByUser(documentos);

  return colaboradores.map((colaborador) => {
    const collaboratorDocuments = documentsByUser.get(colaborador.idUsuario) ?? [];
    const displayName = colaborador.nome || getDisplayNameFromEmail(colaborador.email);
    const approvedDocuments = collaboratorDocuments.filter(
      (documento) => normalizeDocumentStatus(documento.nomeStatus) === "Aprovado",
    );
    const latestDate = getLatestDocumentDate(collaboratorDocuments);

    return {
      id: colaborador.idUsuario,
      cpf: colaborador.cpf,
      name: displayName,
      email: colaborador.email,
      role: "Colaborador",
      department: "Não informado",
      progress: approvedDocuments.length,
      steps: collaboratorDocuments.length,
      status: getCollaboratorStatus(collaboratorDocuments),
      initials: getInitialsFromText(displayName),
      phone: "Não informado",
      lastUpdate: latestDate ? formatDateTime(latestDate) : "Sem atualizações",
      documents: collaboratorDocuments.map(
        (documento) => `${documento.nomeDoc} - ${normalizeDocumentStatus(documento.nomeStatus)}`,
      ),
    };
  });
}

function mapDocuments(
  documentos: ApiDocumento[],
  colaboradores: ApiColaborador[],
): DocumentRow[] {
  const collaboratorsByUserId = new Map(
    colaboradores.map((colaborador) => [
      colaborador.idUsuario,
      getDisplayNameFromEmail(colaborador.email),
    ]),
  );

  return documentos.map((documento) => ({
    id: documento.idDoc,
    title: documento.nomeDoc,
    collaborator:
      collaboratorsByUserId.get(documento.idUsuario) ?? `Colaborador ${documento.idUsuario}`,
    status: normalizeDocumentStatus(documento.nomeStatus),
    submittedAt: formatDateTime(documento.dataEnvio),
    note: `Arquivo: ${documento.nomeArquivo}`,
  }));
}

function mapAuditLogs(logs: ApiAuditLog[]): AuditRow[] {
  return logs.map((log) => ({
    id: log.idAuditoria,
    time: formatTime(log.dataHora),
    title: `${log.nomeAcao} - Documento ${log.idDoc}`,
    description: log.descricao,
  }));
}

async function fetchJson<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    throw new UnauthorizedRequestError("Token inválido ou ausente.");
  }

  if (!response.ok) {
    throw new Error(`Falha ao carregar ${url}`);
  }

  return (await response.json()) as T;
}

async function getApiErrorMessage(response: Response, fallback: string) {
  const data = (await response.json().catch(() => null)) as {
    detail?: string | { message?: string };
  } | null;
  const detail = data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (detail?.message) {
    return detail.message;
  }

  return fallback;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/70 px-5 py-10 text-center">
      <p className="font-medium text-zinc-800">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </div>
  );
}

function SectionError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tab, setTab] = useState<DashboardTab>("colaboradores");
  const [apiCollaborators, setApiCollaborators] = useState<ApiColaborador[]>([]);
  const [apiDocuments, setApiDocuments] = useState<ApiDocumento[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");
  const [reviewingRequestId, setReviewingRequestId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CollaboratorStatus | "Todos">("Todos");
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState<CollaboratorForm>({
    email: "",
    senha: "",
    cpf: "",
    dataNascimento: "",
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [collaboratorsLoading, setCollaboratorsLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [collaboratorsError, setCollaboratorsError] = useState("");
  const [documentsError, setDocumentsError] = useState("");
  const [auditError, setAuditError] = useState("");

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("accessToken");
    router.replace("/tela-de-login");
  }, [router]);

  const loadDashboardData = useCallback(
    async (token: string) => {
      setCollaboratorsLoading(true);
      setDocumentsLoading(true);
      setAuditLoading(true);
      setRequestsLoading(true);

      await Promise.all([
        (async () => {
          try {
            const data = await fetchJson<ApiColaborador[]>(
              `${API_BASE_URL}/usuarios/colaboradores`,
              token,
            );
            setApiCollaborators(data);
            setCollaboratorsError("");
          } catch (error) {
            if (error instanceof UnauthorizedRequestError) {
              handleUnauthorized();
              return;
            }
            setApiCollaborators([]);
            setCollaboratorsError("Não foi possível carregar os colaboradores.");
          } finally {
            setCollaboratorsLoading(false);
          }
        })(),
        (async () => {
          try {
            const data = await fetchJson<ApiDocumento[]>(`${API_BASE_URL}/documentos/`, token);
            setApiDocuments(data);
            setDocumentsError("");
          } catch (error) {
            if (error instanceof UnauthorizedRequestError) {
              handleUnauthorized();
              return;
            }
            setApiDocuments([]);
            setDocumentsError("Não foi possível carregar os documentos.");
          } finally {
            setDocumentsLoading(false);
          }
        })(),
        (async () => {
          try {
            const data = await fetchJson<ApiAuditLog[]>(`${API_BASE_URL}/auditoria/`, token);
            setAudit(mapAuditLogs(data));
            setAuditError("");
          } catch (error) {
            if (error instanceof UnauthorizedRequestError) {
              handleUnauthorized();
              return;
            }
            setAudit([]);
            setAuditError("Não foi possível carregar os logs de auditoria.");
          } finally {
            setAuditLoading(false);
          }
        })(),
        (async () => {
          try {
            const data = await fetchJson<RegistrationRequest[]>(
              `${API_BASE_URL}/usuarios/solicitacoes-cadastro`,
              token,
            );
            setRegistrationRequests(data);
            setRequestsError("");
          } catch (error) {
            if (error instanceof UnauthorizedRequestError) {
              handleUnauthorized();
              return;
            }
            setRegistrationRequests([]);
            setRequestsError("Não foi possível carregar as solicitações de cadastro.");
          } finally {
            setRequestsLoading(false);
          }
        })(),
      ]);
    },
    [handleUnauthorized],
  );

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      handleUnauthorized();
      return;
    }

    const loadProfile = async () => {
      setProfileLoading(true);
      setProfileError("");

      try {
        const data = await fetchJson<UserProfile>(`${API_BASE_URL}/auth/me`, token);
        setProfile(data);
        void loadDashboardData(token);
      } catch (error) {
        if (error instanceof UnauthorizedRequestError) {
          handleUnauthorized();
          return;
        }
        setProfileError("Não foi possível carregar o usuário autenticado.");
      } finally {
        setProfileLoading(false);
      }
    };

    void loadProfile();
  }, [handleUnauthorized, loadDashboardData]);

  const collaborators = useMemo(
    () => mapCollaborators(apiCollaborators, apiDocuments),
    [apiCollaborators, apiDocuments],
  );

  const documents = useMemo(
    () => mapDocuments(apiDocuments, apiCollaborators),
    [apiDocuments, apiCollaborators],
  );

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.replace("/tela-de-login");
  };

  const filteredCollaborators = collaborators.filter((item) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.role.toLowerCase().includes(query) ||
      item.department.toLowerCase().includes(query) ||
      item.cpf.includes(query);
    const matchesStatus = statusFilter === "Todos" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedCollaborator =
    collaborators.find((item) => item.id === selectedCollaboratorId) ??
    filteredCollaborators[0] ??
    collaborators[0];

  const totalCollaborators = collaborators.length;
  const pendingCollaborators = collaborators.filter((item) => item.status === "Pendente").length;
  const analysisCollaborators = collaborators.filter((item) => item.status === "Em Análise").length;
  const approvedCollaborators = collaborators.filter((item) => item.status === "Aprovado").length;
  const pendingDocuments = documents.filter((item) => item.status === "Pendente").length;
  const analysisDocuments = documents.filter((item) => item.status === "Em análise").length;
  const approvedDocuments = documents.filter((item) => item.status === "Aprovado").length;
  const statusCardsLoading = collaboratorsLoading || documentsLoading;

  const profileName = profile?.nome || (profile?.email ? getDisplayNameFromEmail(profile.email) : "RH");
  const profileInitials = getInitialsFromText(profileName || profile?.email || "RH");

  const resetCreateForm = () => {
    setNewCollaborator({
      email: "",
      senha: "",
      cpf: "",
      dataNascimento: "",
    });
  };

  const handleReviewRegistration = async (
    requestId: number,
    action: "aprovar" | "recusar",
  ) => {
    setCreateError("");
    setCreateSuccess("");
    setReviewingRequestId(requestId);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/usuarios/solicitacoes-cadastro/${requestId}/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: action === "recusar" ? JSON.stringify({ motivoRecusa: "Recusado pelo RH." }) : undefined,
        },
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        setCreateError(await getApiErrorMessage(response, "Não foi possível avaliar a solicitação."));
        return;
      }

      const updated = (await response.json()) as RegistrationRequest;
      setRegistrationRequests((current) =>
        current.map((request) => request.idSolicitacao === requestId ? updated : request),
      );
      setCreateSuccess(
        action === "aprovar"
          ? "Solicitação aprovada. As credenciais foram enviadas por e-mail."
          : "Solicitação recusada.",
      );
      if (action === "aprovar") {
        void loadDashboardData(token);
      }
    } catch {
      setCreateError("Erro ao conectar com a API. Tente novamente.");
    } finally {
      setReviewingRequestId(null);
    }
  };

  const handleCreateCollaborator = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/usuarios/colaboradores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCollaborator),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        setCreateError(
          await getApiErrorMessage(response, "Não foi possível cadastrar o colaborador."),
        );
        return;
      }

      const data = (await response.json()) as ApiColaborador;

      setApiCollaborators((current) => {
        if (current.some((item) => item.idUsuario === data.idUsuario)) {
          return current.map((item) => (item.idUsuario === data.idUsuario ? data : item));
        }
        return [...current, data];
      });
      setSelectedCollaboratorId(data.idUsuario);
      setIsCreateOpen(false);
      resetCreateForm();
      setCreateSuccess("Colaborador cadastrado com sucesso.");
      setTab("colaboradores");
    } catch {
      setCreateError("Erro ao conectar com a API. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDetails = (id: number) => {
    setSelectedCollaboratorId(id);
    setIsDetailsOpen(true);
  };

  if (profileLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f6f7fb] px-4">
        <div className="rounded-2xl border border-white/70 bg-white/90 px-5 py-4 text-zinc-600 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur">
          Carregando dashboard...
        </div>
      </main>
    );
  }

  if (profileError) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f6f7fb] px-4">
        <div className="max-w-md rounded-3xl border border-red-100 bg-white p-6 text-center shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
          <p className="text-red-700">{profileError}</p>
          <Link href="/tela-de-login" className="mt-4 inline-flex rounded-full bg-blue-600 px-4 py-2 text-white">
            Ir para login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3f5fb] text-zinc-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.10),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.08),_transparent_28%)]" />
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
              <p className="text-xs text-zinc-500">Painel de RH</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-zinc-900">{profileName}</p>
              <p className="text-xs text-zinc-500">{profile?.email ?? "rh@empresa.com"}</p>
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

      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.6rem] border border-white/80 bg-white/90 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <span>Total de Colaboradores</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                <path d="M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 20v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="mt-4 flex items-end gap-3">
              <p className="text-3xl font-semibold">{collaboratorsLoading ? "..." : totalCollaborators}</p>
              <p className="pb-1 text-sm text-zinc-500">Ativos no sistema</p>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-white/80 bg-white/90 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <span>Pendentes</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </div>
            <div className="mt-4 flex items-end gap-3">
              <p className="text-3xl font-semibold">{statusCardsLoading ? "..." : pendingCollaborators}</p>
              <p className="pb-1 text-sm text-zinc-500">Aguardando documentos</p>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-white/80 bg-white/90 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <span>Em Análise</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4l2 2" />
              </svg>
            </div>
            <div className="mt-4 flex items-end gap-3">
              <p className="text-3xl font-semibold">{statusCardsLoading ? "..." : analysisCollaborators}</p>
              <p className="pb-1 text-sm text-zinc-500">Documentos em revisão</p>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-white/80 bg-white/90 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <span>Aprovados</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                <circle cx="12" cy="12" r="9" />
                <path d="m9.5 12.5 2 2 3.5-4" />
              </svg>
            </div>
            <div className="mt-4 flex items-end gap-3">
              <p className="text-3xl font-semibold">{statusCardsLoading ? "..." : approvedCollaborators}</p>
              <p className="pb-1 text-sm text-zinc-500">Processo concluído</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {[
            { key: "solicitacoes", label: "Solicitações" },
            { key: "colaboradores", label: "Colaboradores" },
            { key: "documentos", label: "Documentos" },
            { key: "auditoria", label: "Auditoria" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key as DashboardTab)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === item.key
                  ? "bg-white text-zinc-900 shadow-[0_10px_25px_rgba(15,23,42,0.08)]"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {createSuccess && (
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {createSuccess}
          </div>
        )}

        <section className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-5 border-b border-zinc-100 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                {tab === "solicitacoes"
                  ? "Solicitações de cadastro"
                  : tab === "colaboradores"
                    ? "Colaboradores"
                    : tab === "documentos"
                      ? "Documentos"
                      : "Auditoria"}
              </h2>
              <p className="text-sm text-zinc-500">
                {tab === "solicitacoes"
                  ? "Aprove ou recuse os pedidos enviados pelo cadastro público"
                  : tab === "colaboradores"
                    ? "Gerencie o processo de admissão"
                    : tab === "documentos"
                      ? "Acompanhe envios, pendências e aprovações"
                      : "Veja as últimas ações do sistema"}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {tab === "colaboradores" && (
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(37,99,235,0.25)] transition hover:bg-blue-700"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                  Novo Colaborador
                </button>
              )}
            </div>
          </div>

          {tab === "solicitacoes" && (
            <div className="p-5">
              {requestsLoading ? (
                <EmptyState title="Carregando solicitações..." description="Buscando os pedidos de cadastro na API." />
              ) : requestsError ? (
                <SectionError message={requestsError} />
              ) : registrationRequests.length === 0 ? (
                <EmptyState title="Nenhuma solicitação" description="Ainda não há pedidos de cadastro para avaliar." />
              ) : (
                <div className="overflow-x-auto rounded-3xl border border-zinc-100">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Candidato</th>
                        <th className="px-4 py-3 font-medium">CPF</th>
                        <th className="px-4 py-3 font-medium">Data</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 text-right font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 bg-white">
                      {registrationRequests.map((request) => (
                        <tr key={request.idSolicitacao} className="hover:bg-zinc-50/80">
                          <td className="px-4 py-4">
                            <p className="font-medium text-zinc-900">{request.nome}</p>
                            <p className="text-zinc-500">{request.email}</p>
                          </td>
                          <td className="px-4 py-4 text-zinc-700">{request.cpf}</td>
                          <td className="px-4 py-4 text-zinc-700">{formatDateTime(request.criadoEm)}</td>
                          <td className="px-4 py-4">
                            <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium capitalize text-zinc-700">
                              {request.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            {request.status === "pendente" ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  disabled={reviewingRequestId === request.idSolicitacao}
                                  onClick={() => void handleReviewRegistration(request.idSolicitacao, "recusar")}
                                  className="rounded-full border border-red-200 px-3 py-2 font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                                >
                                  Recusar
                                </button>
                                <button
                                  type="button"
                                  disabled={reviewingRequestId === request.idSolicitacao}
                                  onClick={() => void handleReviewRegistration(request.idSolicitacao, "aprovar")}
                                  className="rounded-full bg-blue-600 px-3 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                                >
                                  {reviewingRequestId === request.idSolicitacao ? "Processando..." : "Aprovar"}
                                </button>
                              </div>
                            ) : (
                              <span className="text-zinc-400">Avaliada</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "colaboradores" && (
            <div className="p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <label className="flex flex-1 items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Buscar por nome ou email..."
                    className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                  />
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                    <path d="M3 5h18l-7 8v5l-4 2v-7L3 5Z" />
                  </svg>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as CollaboratorStatus | "Todos")}
                    className="bg-transparent text-sm text-zinc-700 outline-none"
                  >
                    <option value="Todos">Todos os Status</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Em Análise">Em Análise</option>
                    <option value="Aprovado">Aprovado</option>
                  </select>
                </label>
              </div>

              <div className="mt-5">
                {collaboratorsLoading ? (
                  <EmptyState title="Carregando colaboradores..." description="Buscando dados atualizados na API." />
                ) : collaboratorsError ? (
                  <SectionError message={collaboratorsError} />
                ) : collaborators.length === 0 ? (
                  <EmptyState title="Nenhum colaborador cadastrado" description="Cadastre colaboradores para acompanhar o onboarding." />
                ) : filteredCollaborators.length === 0 ? (
                  <EmptyState title="Nenhum resultado encontrado" description="Ajuste a busca ou o filtro de status." />
                ) : (
                  <div className="overflow-x-auto rounded-3xl border border-zinc-100">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                        <tr>
                          <th className="px-4 py-3 font-medium">Colaborador</th>
                          <th className="px-4 py-3 font-medium">Cargo</th>
                          <th className="px-4 py-3 font-medium">Departamento</th>
                          <th className="px-4 py-3 font-medium">Progresso</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 text-right font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 bg-white">
                        {filteredCollaborators.map((item) => (
                          <tr key={item.id} className="hover:bg-zinc-50/80">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                                  {item.initials}
                                </div>
                                <div>
                                  <p className="font-medium text-zinc-900">{item.name}</p>
                                  <p className="text-sm text-zinc-500">{item.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-zinc-700">{item.role}</td>
                            <td className="px-4 py-4 text-zinc-700">{item.department}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-2.5 w-24 rounded-full bg-blue-100">
                                  <div
                                    className="h-2.5 rounded-full bg-blue-600"
                                    style={{ width: `${getProgressPercent(item.progress, item.steps)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-zinc-500">{formatProgress(item.progress, item.steps)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${collaboratorStatusStyles[item.status]}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => openDetails(item.id)}
                                className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                              >
                                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                                  <circle cx="12" cy="12" r="3" />
                                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                                </svg>
                                Ver Detalhes
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "documentos" && (
            <div className="p-5">
              {documentsLoading ? (
                <EmptyState title="Carregando documentos..." description="Buscando envios registrados no backend." />
              ) : documentsError ? (
                <SectionError message={documentsError} />
              ) : documents.length === 0 ? (
                <EmptyState title="Nenhum documento encontrado" description="Ainda não há documentos enviados por colaboradores." />
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {documents.map((item) => (
                    <article key={item.id} className="rounded-3xl border border-zinc-100 bg-zinc-50/70 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{item.title}</p>
                          <h3 className="mt-2 text-lg font-semibold text-zinc-900">{item.collaborator}</h3>
                          <p className="mt-1 text-sm text-zinc-600">{item.note}</p>
                        </div>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${documentStatusStyles[item.status]}`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="mt-5 flex items-center justify-between text-sm text-zinc-500">
                        <span>Enviado em {item.submittedAt}</span>
                        <button
                          type="button"
                          onClick={() => setCreateSuccess(`Documento "${item.title}" aberto para análise.`)}
                          className="rounded-full bg-white px-3 py-2 font-medium text-zinc-700 transition hover:bg-zinc-100"
                        >
                          Analisar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "auditoria" && (
            <div className="space-y-4 p-5">
              {auditLoading ? (
                <EmptyState title="Carregando auditoria..." description="Buscando os logs registrados no backend." />
              ) : auditError ? (
                <SectionError message={auditError} />
              ) : audit.length === 0 ? (
                <EmptyState title="Nenhum log de auditoria" description="Ainda não há eventos registrados para exibir." />
              ) : (
                audit.map((item) => (
                  <article key={item.id} className="flex gap-4 rounded-3xl border border-zinc-100 bg-zinc-50/70 p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-blue-600 shadow-sm">
                      {item.time}
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-zinc-600">{item.description}</p>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[1.75rem] border border-white/80 bg-white/90 p-5 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">Resumo do fluxo</h2>
                <p className="text-sm text-zinc-500">Visão rápida do andamento da admissão</p>
              </div>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                {documentsLoading ? "..." : documents.length} documentos
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Pendências</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-900">{documentsLoading ? "..." : pendingDocuments}</p>
                <p className="mt-2 text-sm text-zinc-500">Documentos aguardando ação</p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Acompanhamento</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-900">{documentsLoading ? "..." : analysisDocuments}</p>
                <p className="mt-2 text-sm text-zinc-500">Documentos em análise</p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Concluídos</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-900">{documentsLoading ? "..." : approvedDocuments}</p>
                <p className="mt-2 text-sm text-zinc-500">Documentos aprovados</p>
              </div>
            </div>
          </section>

          <aside className="rounded-[1.75rem] border border-white/80 bg-white/90 p-5 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
            <h2 className="text-lg font-semibold text-zinc-900">Atalhos</h2>
            <p className="mt-1 text-sm text-zinc-500">Ações mais usadas no dia a dia</p>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-sm font-medium text-zinc-700 transition hover:border-blue-200 hover:bg-blue-50"
              >
                Abrir cadastro de colaborador
                <span className="text-blue-600">+</span>
              </button>
              <Link
                href="/RH_documento"
                className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-sm font-medium text-zinc-700 transition hover:border-blue-200 hover:bg-blue-50"
              >
                Abrir documentos enviados
                <span className="text-blue-600">→</span>
              </Link>
              <button
                type="button"
                onClick={() => setTab("auditoria")}
                className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-sm font-medium text-zinc-700 transition hover:border-blue-200 hover:bg-blue-50"
              >
                Ver auditoria
                <span className="text-blue-600">→</span>
              </button>
            </div>
          </aside>
        </div>
      </section>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-blue-600">Novo Colaborador</p>
                <h3 className="mt-1 text-2xl font-semibold text-zinc-900">Cadastrar pessoa no sistema</h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Este formulário conversa com a API real de colaboradores, então o botão do dashboard já cria o registro.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-200"
              >
                Fechar
              </button>
            </div>

            {createError && (
              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {createError}
              </div>
            )}

            <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleCreateCollaborator}>
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-zinc-700">Email</span>
                <input
                  type="email"
                  required
                  value={newCollaborator.email}
                  onChange={(event) => setNewCollaborator((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="nome@empresa.com"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-zinc-700">Senha</span>
                <input
                  type="password"
                  required
                  value={newCollaborator.senha}
                  onChange={(event) => setNewCollaborator((current) => ({ ...current, senha: event.target.value }))}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="mínimo 6 caracteres"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-zinc-700">CPF</span>
                <input
                  type="text"
                  required
                  value={newCollaborator.cpf}
                  onChange={(event) => setNewCollaborator((current) => ({ ...current, cpf: event.target.value }))}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="00000000000"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-zinc-700">Data de nascimento</span>
                <input
                  type="date"
                  required
                  value={newCollaborator.dataNascimento}
                  onChange={(event) => setNewCollaborator((current) => ({ ...current, dataNascimento: event.target.value }))}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </label>

              <div className="sm:col-span-2 mt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-full border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {isSubmitting ? "Salvando..." : "Salvar colaborador"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailsOpen && selectedCollaborator && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 backdrop-blur-sm">
          <button type="button" aria-label="Fechar detalhes" className="absolute inset-0 cursor-default" onClick={() => setIsDetailsOpen(false)} />
          <aside className="relative z-10 h-full w-full max-w-xl overflow-y-auto border-l border-white/80 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-blue-600">Detalhes do colaborador</p>
                <h3 className="mt-1 text-2xl font-semibold text-zinc-900">{selectedCollaborator.name}</h3>
                <p className="mt-1 text-sm text-zinc-500">{selectedCollaborator.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="rounded-full bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-200"
              >
                Fechar
              </button>
            </div>

            <div className="mt-6 rounded-[1.5rem] bg-zinc-50 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
                  {selectedCollaborator.initials}
                </div>
                <div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${collaboratorStatusStyles[selectedCollaborator.status]}`}>
                    {selectedCollaborator.status}
                  </span>
                  <p className="mt-2 text-sm text-zinc-500">Última atualização: {selectedCollaborator.lastUpdate}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Cargo</p>
                  <p className="mt-2 font-semibold text-zinc-900">{selectedCollaborator.role}</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Departamento</p>
                  <p className="mt-2 font-semibold text-zinc-900">{selectedCollaborator.department}</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Telefone</p>
                  <p className="mt-2 font-semibold text-zinc-900">{selectedCollaborator.phone}</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Progresso</p>
                  <p className="mt-2 font-semibold text-zinc-900">{formatProgress(selectedCollaborator.progress, selectedCollaborator.steps)}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-white p-4">
                <div className="flex items-center justify-between text-sm text-zinc-500">
                  <span>Fluxo de admissão</span>
                  <span>{getProgressPercent(selectedCollaborator.progress, selectedCollaborator.steps)}%</span>
                </div>
                <div className="mt-3 h-2.5 rounded-full bg-blue-100">
                  <div
                    className="h-2.5 rounded-full bg-blue-600"
                    style={{ width: `${getProgressPercent(selectedCollaborator.progress, selectedCollaborator.steps)}%` }}
                  />
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-zinc-900">Documentos vinculados</p>
                <div className="mt-3 space-y-2">
                  {selectedCollaborator.documents.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500">
                      Nenhum documento vinculado.
                    </div>
                  ) : (
                    selectedCollaborator.documents.map((item) => (
                      <div key={item} className="rounded-2xl border border-zinc-100 bg-white px-4 py-3 text-sm text-zinc-700">
                        {item}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
