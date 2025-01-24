import type { Metadata } from "next";
import { Alef } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { auth } from "@/lib/auth";
import { Providers } from "@/components/Providers";
import { NextIntlClientProvider } from 'next-intl';
import { getLangDir } from 'rtl-detect';
import { getLocale, getMessages } from 'next-intl/server';
import { generateMetadata as generateSiteMetadata } from '@/lib/metadata';

const alef = Alef({
  subsets: ["latin"],
  weight: ['400', '700'],
  variable: "--font-alef",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return generateSiteMetadata(locale);
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
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
