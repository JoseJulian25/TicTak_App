import type { Metadata } from "next";
import "./globals.css";
import { AppInitializer } from "@/components/AppInitializer";


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
        </AppInitializer>
      </body>
    </html>
  );
}
