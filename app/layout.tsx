import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { initializeStorage } from './lib/storage';
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

// Initialize storage on app startup
initializeStorage().catch(console.error);

export const metadata: Metadata = {
  title: 'CMU Resume Book',
  description: 'Carnegie Mellon University Resume Book',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <main className="min-h-screen bg-background">
          {children}
        </main>
      </body>
    </html>
  );
}
