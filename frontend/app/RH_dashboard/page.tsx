  "use client";

  import Link from "next/link";
  import { useRouter } from "next/navigation";
  import { useEffect, useState } from "react";

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

  type DashboardTab = "colaboradores" | "documentos" | "auditoria";
  type CollaboratorStatus = "Pendente" | "Em Análise" | "Aprovado";
  type DocumentStatus = "Pendente" | "Em análise" | "Aprovado";

  type UserProfile = {
    idUsuario: number;
    email: string;
    perfil: string;
  };

  type CollaboratorRow = {
    id: number;
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

  // Collaborators are loaded from the backend (GET /usuarios/rh)
  const initialCollaborators: CollaboratorRow[] = [];

  const initialDocuments: DocumentRow[] = [
    {
      id: 1,
      title: "Documento de identidade",
      collaborator: "João Santos",
      status: "Aprovado",
      submittedAt: "06 jun, 09:18",
      note: "Imagem legível e validada pela equipe de RH.",
    },
    {
      id: 2,
      title: "Comprovante de residência",
      collaborator: "Ana Costa",
      status: "Pendente",
      submittedAt: "06 jun, 11:42",
      note: "Aguardando envio do arquivo atualizado.",
    },
    {
      id: 3,
      title: "Exame admissional",
      collaborator: "Carlos Silva",
      status: "Em análise",
      submittedAt: "05 jun, 16:05",
      note: "Documento encaminhado ao time de saúde ocupacional.",
    },
    {
      id: 4,
      title: "Termo de confidencialidade",
      collaborator: "Mariana Oliveira",
      status: "Pendente",
      submittedAt: "04 jun, 14:30",
      note: "Assinatura eletrônica ainda não concluída.",
    },
  ];

  const initialAudit: AuditRow[] = [
    {
      id: 1,
      time: "09:12",
      title: "João Santos enviou o comprovante bancário",
      description: "Arquivo recebido e marcado para revisão automática.",
    },
    {
      id: 2,
      time: "10:03",
      title: "Ana Costa foi notificada",
      description: "E-mail com pendência de documentos enviado com sucesso.",
    },
    {
      id: 3,
      time: "11:26",
      title: "Carlos Silva aprovado",
      description: "Fluxo finalizado após validação de RH.",
    },
    {
      id: 4,
      time: "12:18",
      title: "Nova sessão autenticada",
      description: "Perfil RH carregado com token válido.",
    },
  ];

  const collaboratorStatusStyles: Record<CollaboratorStatus, string> = {
    Pendente: "bg-indigo-600 text-white",
    "Em Análise": "bg-blue-500 text-white",
    Aprovado: "bg-emerald-500 text-white",
  };

  const documentStatusStyles: Record<DocumentStatus, string> = {
    Pendente: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    "Em análise": "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
    Aprovado: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
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

  function formatProgress(progress: number, steps: number) {
    return `${progress}/${steps}`;
  }

  export default function DashboardPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [tab, setTab] = useState<DashboardTab>("colaboradores");
    const [collaborators, setCollaborators] = useState<CollaboratorRow[]>(initialCollaborators);
    const [documents] = useState<DocumentRow[]>(initialDocuments);
    const [audit] = useState<AuditRow[]>(initialAudit);
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
          setProfile(data);

          // Após carregar o perfil, buscar os usuários RH do backend e popular a tabela
          try {
            const respRH = await fetch(`${API_BASE_URL}/usuarios/rh`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (respRH.ok) {
              const rhs = (await respRH.json()) as Array<{
                matricula: number;
                cargo: string;
                idUsuario: number;
                email: string;
              }>;

              const mapped = rhs.map((r) => ({
                id: r.idUsuario,
                name: getDisplayNameFromEmail(r.email),
                email: r.email,
                role: r.cargo ?? "RH",
                department: "RH",
                progress: 0,
                steps: 8,
                status: "Pendente" as CollaboratorStatus,
                initials: getInitialsFromText(getDisplayNameFromEmail(r.email)),
                phone: "Não informado",
                lastUpdate: "agora",
                documents: [] as string[],
              } as CollaboratorRow));

              setCollaborators(mapped);
              setSelectedCollaboratorId(mapped[0]?.id ?? null);
            } else {
              setCollaborators([]);
              setSelectedCollaboratorId(null);
            }
          } catch {
            setError("Não foi possível carregar os usuários RH.");
          }
        } catch {
          setError("Não foi possível carregar o usuário autenticado.");
        } finally {
          setLoading(false);
        }
      };

      void loadProfile();
    }, []);

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
        item.department.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "Todos" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const selectedCollaborator =
      collaborators.find((item) => item.id === selectedCollaboratorId) ?? filteredCollaborators[0] ?? collaborators[0];

    const totalCollaborators = collaborators.length;
    const pendingCollaborators = collaborators.filter((item) => item.status === "Pendente").length;
    const analysisCollaborators = collaborators.filter((item) => item.status === "Em Análise").length;
    const approvedCollaborators = collaborators.filter((item) => item.status === "Aprovado").length;
    const pendingDocuments = documents.filter((item) => item.status === "Pendente").length;

    const profileName = profile?.email ? getDisplayNameFromEmail(profile.email) : "Maria Silva";
    const profileInitials = getInitialsFromText(profileName || profile?.email || "RH");

    const resetCreateForm = () => {
      setNewCollaborator({
        email: "",
        senha: "",
        cpf: "",
        dataNascimento: "",
      });
    };

    const handleCreateCollaborator = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setCreateError("");
      setCreateSuccess("");
      setIsSubmitting(true);

      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          router.replace("/tela-de-login");
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

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { detail?: string } | null;
          setCreateError(data?.detail ?? "Não foi possível cadastrar o colaborador.");
          return;
        }

        const data = (await response.json()) as {
          idUsuario: number;
          email: string;
        };

        const displayName = getDisplayNameFromEmail(data.email);
        // O backend criou o colaborador no banco, porém a tabela exibida aqui
        // mostra apenas usuários com RH no banco — portanto não inserimos
        // o colaborador recém-criado na lista atual.
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

    if (loading) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-[#f6f7fb] px-4">
          <div className="rounded-2xl border border-white/70 bg-white/90 px-5 py-4 text-zinc-600 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur">
            Carregando dashboard...
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
                <p className="text-3xl font-semibold">{totalCollaborators}</p>
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
                <p className="text-3xl font-semibold">{pendingCollaborators}</p>
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
                <p className="text-3xl font-semibold">{analysisCollaborators}</p>
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
                <p className="text-3xl font-semibold">{approvedCollaborators}</p>
                <p className="pb-1 text-sm text-zinc-500">Processo concluído</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {[
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
                  {tab === "colaboradores" ? "Colaboradores" : tab === "documentos" ? "Documentos" : "Auditoria"}
                </h2>
                <p className="text-sm text-zinc-500">
                  {tab === "colaboradores"
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

                <div className="mt-5 overflow-x-auto rounded-3xl border border-zinc-100">
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
                                  style={{ width: `${(item.progress / item.steps) * 100}%` }}
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
              </div>
            )}

            {tab === "documentos" && (
              <div className="grid gap-4 p-5 lg:grid-cols-2">
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
                        onClick={() => setCreateSuccess(`Documento \"${item.title}\" aberto para análise.`)}
                        className="rounded-full bg-white px-3 py-2 font-medium text-zinc-700 transition hover:bg-zinc-100"
                      >
                        Analisar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {tab === "auditoria" && (
              <div className="space-y-4 p-5">
                {audit.map((item) => (
                  <article key={item.id} className="flex gap-4 rounded-3xl border border-zinc-100 bg-zinc-50/70 p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-blue-600 shadow-sm">
                      {item.time}
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-zinc-600">{item.description}</p>
                    </div>
                  </article>
                ))}
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
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">{documents.length} documentos</span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-zinc-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Pendências</p>
                  <p className="mt-3 text-3xl font-semibold text-zinc-900">{pendingDocuments}</p>
                  <p className="mt-2 text-sm text-zinc-500">Documentos aguardando ação</p>
                </div>
                <div className="rounded-3xl bg-zinc-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Acompanhamento</p>
                  <p className="mt-3 text-3xl font-semibold text-zinc-900">{analysisCollaborators}</p>
                  <p className="mt-2 text-sm text-zinc-500">Colaboradores em análise</p>
                </div>
                <div className="rounded-3xl bg-zinc-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Concluídos</p>
                  <p className="mt-3 text-3xl font-semibold text-zinc-900">{approvedCollaborators}</p>
                  <p className="mt-2 text-sm text-zinc-500">Admissões finalizadas</p>
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
                <button
                  type="button"
                  onClick={() => setTab("documentos")}
                  className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-sm font-medium text-zinc-700 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  Ir para documentos
                  <span className="text-blue-600">→</span>
                </button>
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
                    <span>{Math.round((selectedCollaborator.progress / selectedCollaborator.steps) * 100)}%</span>
                  </div>
                  <div className="mt-3 h-2.5 rounded-full bg-blue-100">
                    <div
                      className="h-2.5 rounded-full bg-blue-600"
                      style={{ width: `${(selectedCollaborator.progress / selectedCollaborator.steps) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-medium text-zinc-900">Documentos vinculados</p>
                  <div className="mt-3 space-y-2">
                    {selectedCollaborator.documents.map((item) => (
                      <div key={item} className="rounded-2xl border border-zinc-100 bg-white px-4 py-3 text-sm text-zinc-700">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    );
  }
