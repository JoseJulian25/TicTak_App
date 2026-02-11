import type { Metadata } from "next";
import "./globals.css";
import { AppInitializer } from "@/components/AppInitializer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next"


export const metadata: Metadata = {
  title: "TicTak - Personal Time Tracking App",
  description: "Aplicación de tracking de tiempo simple y sin fricción",
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {

  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AppInitializer>
            {children}
            <Analytics />
          </AppInitializer>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
