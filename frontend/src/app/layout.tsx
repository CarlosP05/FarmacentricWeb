import type { Metadata } from "next";

import { Geist, Geist_Mono, DM_Serif_Display } from "next/font/google";

import "./globals.css";

import Navbar from "@/components/Navbar";



const geistSans = Geist({

  variable: "--font-geist-sans",

  subsets: ["latin"],

});



const geistMono = Geist_Mono({

  variable: "--font-geist-mono",

  subsets: ["latin"],

});



const dmSerifDisplay = DM_Serif_Display({

  variable: "--font-display",

  subsets: ["latin"],

  weight: "400",

});



export const metadata: Metadata = {

  title: "Farmacentric Web",

  description: "Sistema de Gestión Farmacéutica",

};



export default function RootLayout({

  children,

}: Readonly<{

  children: React.ReactNode;

}>) {

  return (

    <html

      lang="es"

      className={`${geistSans.variable} ${geistMono.variable} ${dmSerifDisplay.variable} h-full antialiased`}

    >

      <body className="min-h-full flex flex-col" style={{ backgroundColor: "var(--background)" }}>

        <Navbar />

        <main className="flex-grow">

          {children}

        </main>

      </body>

    </html>

  );

}