import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/Navbar';


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Recalls - Rethinking learning and memory permanence",
  description: "Recalls is a platform for creating and studying flashcards efficiently. It's a tool for learners to create and study flashcards efficiently.",
  icons: "/logo-ico.png"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen">
            <Navbar />
            <main>
              {children}
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
} 