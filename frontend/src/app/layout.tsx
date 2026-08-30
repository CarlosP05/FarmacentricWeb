import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Importamos la barra

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Farmacentric Web",
  description: "Sistema Full-Stack de Farmacia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-100">
        {/* Aquí colocamos la barra de navegación global */}
        <Navbar />

        {/* El contenido de cada página (POS, Inventario, etc.) se renderiza aquí abajo */}
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}