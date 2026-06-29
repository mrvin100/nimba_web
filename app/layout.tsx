import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nimba",
  description:
    "Plateforme bancaire de gestion du cycle de vie des dossiers de crédit",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
