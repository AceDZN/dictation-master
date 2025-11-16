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
//import { AdBlockDetector } from '@/components/ui/AdBlockDetector';
import { BackgroundGradient } from "@/components/ui/background-gradient";

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
        {/*
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7458209475481910"
          crossOrigin="anonymous"
        />*/}
      </head>
      <body className={`${alef.variable} font-alef antialiased min-h-screen flex flex-col`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers session={session}>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <div className="container mx-auto px-0">
                  {/*<AdBlockDetector />*/}
                  <div className="relative isolate py-0 md:py-6 lg:py-12 px-0 md:px-4">


                    {/* Decorative blurred circles */}
                    <div className="absolute top-40 z-0  user-select-none pointer-events-none left-0 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
                    <div className="absolute bottom-20 z-0  user-select-none pointer-events-none right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />

                    {/* Dot pattern decoration */}

                    <div className="absolute inset-0 -z-10 mx-0 max-w-none overflow-hidden">
                      <div className="absolute left-1/2 top-0 ml-[-38rem] h-[25rem] w-[81.25rem] dark:[mask-image:linear-gradient(white,transparent)]">
                        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(to_bottom_left,white,transparent,transparent)] dark:bg-grid-slate-100/[0.03]" style={{
                          maskSize: '100%',
                          backgroundPosition: 'calc(100% - 0px) calc(100% - 0px)',
                          backgroundSize: '40px 40px',
                          backgroundImage:
                            'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\' width=\'32\' height=\'32\' fill=\'none\' stroke=\'rgb(15 23 42 / 0.1)\'%3E%3Cpath d=\'M0 .5H31.5V32\'/%3E%3C/svg%3E")',
                        }} />
                      </div>
                    </div>
                    {/* Top background gradient */}
                    <BackgroundGradient position="top" />

                    {children}
                    {/* Bottom background gradient */}
                    <BackgroundGradient position="bottom" />
                  </div>
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
