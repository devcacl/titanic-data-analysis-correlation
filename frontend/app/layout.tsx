import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Titanic Dashboard",
  description: "Panel de análisis para el dataset Titanic",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
