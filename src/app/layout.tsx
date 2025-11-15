import type { Metadata } from "next";
import { Galindo, Coiny } from "next/font/google";
import "./globals.css";

const galindo = Galindo({
  variable: "--font-title",
  subsets: ["latin"],
  weight: "400",
});

const chango = Coiny({
  variable: "--font-subtitle",  // Keep the same variable name!
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
        className={`${galindo.variable} ${chango.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
