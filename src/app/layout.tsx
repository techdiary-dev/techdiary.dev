import type { Metadata } from "next";
import { Toaster } from "@/components/toast";
import "../styles/app.css";

import * as sessionActions from "@/backend/services/session.actions";
import CommonProviders from "@/components/providers/CommonProviders";
import I18nProvider from "@/components/providers/I18nProvider";
import { fontKohinoorBanglaRegular } from "@/lib/fonts";
import { cookies } from "next/headers";
import Script from "next/script";
import React, { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: {
    default: "TechDiary",
    template: "%s | TechDiary",
  },
  applicationName: "TechDiary",
  referrer: "origin-when-cross-origin",
  keywords: ["TechDiary", "টেকডায়েরি"],
  icons: { icon: "/favicon.png" },
  description: "Homepage of TechDiary",
  metadataBase: new URL("https://www.techdiary.dev"),
  openGraph: {
    title: "TechDiary - টেকডায়েরি",
    description: "চিন্তা, সমস্যা, সমাধান",
    url: "https://www.techdiary.dev",
    siteName: "TechDiary",
    locale: "bn_BD",
    type: "website",
    images: ["https://www.techdiary.dev/og.png"],
  },
};

const RootLayout: React.FC<PropsWithChildren> = async ({ children }) => {
  const _cookies = await cookies();
  const session = await sessionActions.getSession();
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={fontKohinoorBanglaRegular.style}>
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
        <I18nProvider currentLanguage={_cookies.get("language")?.value || "en"}>
          <CommonProviders session={session}>
            {children}
            <Toaster />
          </CommonProviders>
        </I18nProvider>
      </body>
    </html>
  );
};

export default RootLayout;
