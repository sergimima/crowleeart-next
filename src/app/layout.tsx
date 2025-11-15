import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import ClientProviders from "@/components/ClientProviders";
import MainWrapper from "@/components/MainWrapper";
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "Crowlee Art - The Art Of Maintenance",
  description: "Expert maintenance for homes and small businesses in London and Hertfordshire",
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-gradient-to-br from-[#0a0f1e] via-[#0f1729] to-[#1a1f3a] h-screen overflow-hidden relative">
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#3b82f615,transparent_50%),radial-gradient(ellipse_at_bottom,_#8b5cf615,transparent_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,_#ffffff08_1px,_transparent_1px),linear-gradient(to_bottom,_#ffffff08_1px,_transparent_1px)] bg-[length:40px_40px]" />
        </div>
        <Navbar />
        <ClientProviders>
          <MainWrapper>
            {children}
            <Footer />
          </MainWrapper>
        </ClientProviders>
        <WhatsAppWidget />
        <Toaster position="bottom-right" theme="dark" richColors />
      </body>
    </html>
  );
}
