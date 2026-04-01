import type { Metadata } from "next";
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";
import "../styles/app.css";

import CommonProviders from "@/components/providers/CommonProviders";
import RootProviders from "@/components/providers/root-providers";
import LanguageHydrator from "@/components/providers/LanguageHydrator";
import SessionHydrator from "@/components/providers/SessionHydrator";
import { CookieConsentPopup } from "@/components/CookieConsentPopup";
import { fontKohinoorBanglaRegular } from "@/lib/fonts";
import { Toaster } from "@/components/toast";
import { THEME_INIT_SCRIPT } from "@/lib/theme-init-script";
import Script from "next/script";
import React, { PropsWithChildren, Suspense } from "react";

export const metadata: Metadata = {
  title: {
    default: "TechDiary - টেকডায়েরি",
    template: "%s | TechDiary",
  },
  applicationName: "TechDiary",
  referrer: "origin-when-cross-origin",
  keywords: ["TechDiary", "টেকডায়েরি"],
  icons: { icon: "/favicon.png" },
  description: "বাংলায় প্রযুক্তি, কোড ও সমস্যার সমাধান — TechDiary",
  metadataBase: new URL("https://www.techdiary.dev"),
  openGraph: {
    title: "TechDiary - টেকডায়েরি",
    description: "চিন্তা, সমস্যা, সমাধান",
    url: "https://www.techdiary.dev",
    siteName: "TechDiary",
    locale: "bn_BD",
    type: "website",
    images: ["https://www.techdiary.dev/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@techdiary_dev",
  },
};

const RootLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body style={fontKohinoorBanglaRegular.style}>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-F3VRW4H09N"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-F3VRW4H09N');
          `}
        </Script>
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('SW registered: ', registration);
                }).catch(function(registrationError) {
                  console.log('SW registration failed: ', registrationError);
                });
              });
            }
          `}
        </Script>
        <script
          id="hothar"
          dangerouslySetInnerHTML={{
            __html: `
              (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:1886608,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `,
          }}
        />
        <AuthKitProvider>
          <Suspense
            fallback={
              <CommonProviders>
                <Suspense><SessionHydrator /></Suspense>
                <Suspense><LanguageHydrator /></Suspense>
                {children}
                <Toaster />
                <CookieConsentPopup />
              </CommonProviders>
            }
          >
            <RootProviders>
              <Suspense><SessionHydrator /></Suspense>
              <Suspense><LanguageHydrator /></Suspense>
              {children}
              <Toaster />
              <CookieConsentPopup />
            </RootProviders>
          </Suspense>
        </AuthKitProvider>
      </body>
    </html>
  );
};

export default RootLayout;
