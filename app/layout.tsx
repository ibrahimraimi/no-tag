import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";

import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "NoTag Downloader",
  description:
    "Download videos from TikTok, Instagram, YouTube, and LinkedIn without watermarks",
  generator: "Next.js",
  keywords: [
    "video downloader",
    "TikTok",
    "Instagram",
    "YouTube",
    "LinkedIn",
    "no watermark",
    "social media",
  ],
  authors: [{ name: "Ibrahim Raimi" }],
  openGraph: {
    title: "NoTag Downloader",
    description:
      "Download videos from popular social media platforms without watermarks",
    images: ["/placeholder.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <head>
        <style>{`
html {
  font-family: ${dmSans.style.fontFamily};
  --font-sans: ${dmSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
