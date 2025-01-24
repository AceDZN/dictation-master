import type { Metadata } from "next";
import { Alef } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { auth } from "@/lib/auth";
import { Providers } from "@/components/Providers";
import { NextIntlClientProvider } from 'next-intl';
import { getLangDir } from 'rtl-detect';
import { getLocale, getMessages } from 'next-intl/server';

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
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  console.log('locale', locale)
  const session = await auth();
  const messages = await getMessages();
  const direction = getLangDir(locale);

  return (
    <html lang={locale} className="h-full" dir={direction}>
      <body className={`${alef.variable} font-alef antialiased h-full`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers session={session}>
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
