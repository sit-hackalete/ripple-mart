import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet-context";
import { CartProvider } from "@/contexts/CartContext";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ripple Mart - Shop with RLUSD",
  description: "Your premier e-commerce platform powered by Ripple's RLUSD stablecoin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletProvider>
          <CartProvider>
            <Header />
            <main className="min-h-screen bg-gray-50 dark:bg-black">
              {children}
            </main>
          </CartProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
