import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet-context";
import Navigation from "@/components/Navigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Ripple Mart (Merchant) - Dashboard",
  description: "Manage your ecommerce business with Ripple tokens",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased bg-slate-50 dark:bg-slate-950`}
      >
        <WalletProvider>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  );
}
