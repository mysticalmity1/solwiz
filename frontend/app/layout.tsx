import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { WalletContextProvider } from "@/context/WalletContext";
import { GameProvider } from "@/context/GameContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SolWizards ⚔️🧙",
  description: "NFT Battle Game on Solana",
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
        <WalletContextProvider>
          <GameProvider>
            {children}
          </GameProvider>
        </WalletContextProvider>
      </body>
    </html>
  );
}
