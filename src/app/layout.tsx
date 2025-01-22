import type { Metadata } from "next";
import { Alef } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { auth } from "@/lib/auth";
import { Providers } from "@/components/Providers";

const alef = Alef({
  subsets: ["latin"],
  weight: ['400', '700'],
  variable: "--font-alef",
});

export const metadata: Metadata = {
  title: "Dictation Master",
  description: "Create and manage language learning games through dictation exercises",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();

  return (
    <html lang="en" className="h-full">
      <body className={`${alef.variable} font-alef antialiased h-full`}>
        <Providers session={session}>
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
