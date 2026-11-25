import type { Metadata, Viewport } from "next";
import { Caveat, Instrument_Sans, JetBrains_Mono, Newsreader } from "next/font/google";
import { Suspense } from "react";
import { HeaderAuth, HeaderAuthFallback } from "@/components/header-auth";
import { MotionProvider } from "@/components/motion-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Claudemotion",
    template: "%s · Claudemotion",
  },
  description:
    "Motion pieces made with code. Each post has the clip, a still from it, the prompt, the model that wrote the code, recommended models and the prompt engineer behind it.",
  openGraph: { siteName: "Claudemotion", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#f3efe6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${instrument.variable} ${jetbrains.variable} ${caveat.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <MotionProvider>
          <SmoothScroll />
          <SiteHeader>
            <Suspense fallback={<HeaderAuthFallback />}>
              <HeaderAuth />
            </Suspense>
          </SiteHeader>
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </MotionProvider>
      </body>
    </html>
  );
}
