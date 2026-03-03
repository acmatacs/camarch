import type { Metadata } from "next";
import "./globals.css";
import PublicWrapper from "@/components/layout/PublicWrapper";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://camarch.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "CamArch – Cambodian Archaeological Discovery Platform",
    template: "%s | CamArch",
  },
  description:
    "Discover archaeological sites and ancient temples across Cambodia. Explore Angkor Wat, Bayon, Ta Prohm, and 20+ historic Khmer temples with detailed histories, maps, and visitor guides.",
  keywords: [
    "Cambodia temples",
    "Angkor Wat",
    "Khmer Empire",
    "Cambodian archaeology",
    "Siem Reap",
    "ancient temples",
    "Bayon",
    "Ta Prohm",
    "Banteay Srei",
    "Koh Ker",
    "Preah Vihear",
    "Sambor Prei Kuk",
  ],
  authors: [{ name: "CamArch" }],
  creator: "CamArch",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "CamArch",
    title: "CamArch – Cambodian Archaeological Discovery Platform",
    description:
      "Discover and explore 20+ ancient Khmer temples and archaeological sites of Cambodia — with detailed histories, maps, and photography.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CamArch – Cambodian Archaeological Discovery Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CamArch – Cambodian Archaeological Discovery Platform",
    description:
      "Discover and explore 20+ ancient Khmer temples and archaeological sites of Cambodia.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect to Google Fonts for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;1,14..32,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-sandstone text-charcoal antialiased">
        <PublicWrapper>{children}</PublicWrapper>
      </body>
    </html>
  );
}
