import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Profile | Rintaro Okahara",
  description: "Personal profile page of Rintaro Okahara",
  metadataBase: new URL("https://rintaro-okahara.github.io"),

  alternates: {
    canonical: "/",
    languages: {
      ja: "/",
      en: "/en",
    }
  },

  openGraph: {
    title: "Rintaro Okahara",
    description: "Personal profile page of Rintaro Okahara",
    url: "https://rintaro-okahara.github.io",
    siteName: "Rintaro Okahara",
    locale: "en_US",
    type: "website",
    images: [{
      url: "/og.png",
      width: 1200,
      height: 630,
      alt: "Rintaro Okahara",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rintaro Okahara",
    description: "Personal profile page of Rintaro Okahara",
    images : ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
