import type { Metadata } from "next";
import "./globals.css";
import { AppInitializer } from "@/components/AppInitializer";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next"


export const metadata: Metadata = {
  title: "TicTak - Time Tracking App",
  description: "Aplicación de tracking de tiempo simple y sin fricción",
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {

  return (
    <html lang="es">
      <body>
        <AppInitializer>
          {children}
          <Analytics />
        </AppInitializer>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
