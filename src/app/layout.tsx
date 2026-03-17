import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Gemeente Dashboard — Vlaanderen in Cijfers",
  description:
    "Interactief dashboard met publieke data van alle Vlaamse gemeenten. Rankings, trends en vergelijkingen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Sidebar />
        <main className="ml-56 min-h-screen p-6">{children}</main>
      </body>
    </html>
  );
}
