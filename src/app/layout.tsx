import type { Metadata } from "next";
import { Geist, Geist_Mono, Galindo, Chango } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const galindo = Galindo({
  variable: "--font-galindo",
  subsets: ["latin"],
  weight: "400",
});

const chango = Chango({
  variable: "--font-jua",  // Keep the same variable name!
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Open Kahoot!",
  description: "Real-time multiplayer quiz game - Create, Host, Play!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${galindo.variable} ${chango.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
