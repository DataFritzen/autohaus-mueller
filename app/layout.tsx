import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Autohaus Müller | BMW M2 Leasing",
  description:
    "Modernes BMW M2 Leasingangebot von Autohaus Müller mit persönlicher Konfigurationsprüfung.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <div className="shell">
          <header className="topbar">
            <Link className="brand" href="/">
              Autohaus<span>Müller</span>
            </Link>
            <nav className="nav" aria-label="Hauptnavigation">
              <Link href="/#angebot">Angebot</Link>
              <Link href="/#highlights">M2</Link>
              <Link href="/#anfrage">Anfrage</Link>
            </nav>
          </header>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
