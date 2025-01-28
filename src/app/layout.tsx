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
import Script from 'next/script';

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
        <Script
          id="google-adsense-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.googletag = window.googletag || {cmd: []};
              googletag.cmd.push(function() {
                googletag.pubads().setPrivacySettings({
                  'restrictDataProcessing': true
                });
              });
            `
          }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7458209475481910"
          crossOrigin="anonymous"
          strategy="afterInteractive"
          data-ad-client="ca-pub-7458209475481910"
        />{/*
        <Script
          async
          src="https://pagead2.googlesync.com/pagead/js/adsbygoogle.js?client=ca-pub-7458209475481910"
          crossOrigin="anonymous"
          strategy="afterInteractive"
          data-ad-client="ca-pub-7458209475481910"
        />*/}
      </head>
      <body className={`${alef.variable} font-alef antialiased h-full flex flex-col`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers session={session}>
            <Header />
            <main className="flex-1 flex flex-col min-h-0">
              {children}
            </main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
