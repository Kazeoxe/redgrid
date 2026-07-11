import type { Metadata, Viewport } from "next";
import "@redgrid/ui/styles.css";
import "./globals.css";
import { Providers } from "../Providers";

export const metadata: Metadata = {
  title: "RedGrid",
  description: "Un mur de contenu vivant, jamais un navigateur à onglets.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "RedGrid", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#08080a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
