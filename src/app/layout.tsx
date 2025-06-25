import type { Metadata } from "next";
import { Geist, Geist_Mono, Galindo, Jua, Chango } from "next/font/google";
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

const jua = Jua({
  variable: "--font-jua",
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
      <head>
        {/* Google Fonts: Winky Sans and Chango */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Chango:wght@400&family=Winky+Sans:opsz,wght@8..200,200..900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${galindo.variable} ${chango.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
