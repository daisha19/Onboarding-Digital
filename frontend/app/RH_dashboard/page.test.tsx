import "@testing-library/jest-dom/vitest";

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DashboardPage from "./page";

const { replaceMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("RH dashboard states", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows the initial loading state while the profile request is pending", () => {
    localStorage.setItem("accessToken", "valid-token");
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));

    render(<DashboardPage />);

    expect(screen.getByText("Carregando dashboard...")).toBeInTheDocument();
  });

  it("shows section errors when dashboard data requests fail", async () => {
    localStorage.setItem("accessToken", "valid-token");
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith("/auth/me")) {
        return jsonResponse({
          idUsuario: 1,
          email: "rh@example.com",
          perfil: "rh",
        });
      }

      return jsonResponse({ detail: "Erro no servidor" }, 500);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<DashboardPage />);

    expect(await screen.findByText("Não foi possível carregar os colaboradores.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Documentos" }));
    expect(await screen.findByText("Não foi possível carregar os documentos.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Auditoria" }));
    expect(await screen.findByText("Não foi possível carregar os logs de auditoria.")).toBeInTheDocument();
  });
});
