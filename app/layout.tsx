import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from './ClientLayout';
import { metadata } from './metadata';

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
