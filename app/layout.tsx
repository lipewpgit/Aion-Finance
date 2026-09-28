import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aion Finance — seu dinheiro no tempo certo",
  description: "Finanças, agenda, metas e mercado organizados em uma conta segura.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
