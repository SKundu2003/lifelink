import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "LifeLink | Crisis-Ready Emergency Identity",
  description: "Secure, mobile-first emergency identity platform for instant discovery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <main className="min-h-screen bg-lifelink-slate text-foreground">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
