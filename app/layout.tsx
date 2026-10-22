import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aion Finance",
  description: "Finanças, agenda, metas e mercado organizados em uma conta segura.",
  manifest: "/manifest.webmanifest",
  applicationName: "Aion Finance",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Aion Finance" },
  icons: {
    icon: "/aion-app-icon.png",
    shortcut: "/aion-app-icon.png",
    apple: "/aion-app-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
