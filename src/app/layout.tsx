import type { Metadata } from "next";
import { Alef } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { auth } from "@/lib/auth";
import { Providers } from "@/components/Providers";
import { NextIntlClientProvider } from 'next-intl';
import { getLangDir } from 'rtl-detect';
import { getLocale, getMessages } from 'next-intl/server';
import { generateMetadata as generateSiteMetadata } from '@/lib/metadata';
import { AdBlockDetector } from '@/components/ui/AdBlockDetector';

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
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7458209475481910"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${alef.variable} font-alef antialiased min-h-screen flex flex-col`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers session={session}>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <div className="container mx-auto px-4">
                  <AdBlockDetector />
                  {children}
                </div>
              </main>
              <Footer />
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
