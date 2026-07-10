import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera .next/standalone com um servidor Node minimo, usado pela imagem de producao.
  output: "standalone",
};

export default nextConfig;
