import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "CamArch – Cambodian Archaeological Discovery Platform",
    template: "%s | CamArch",
  },
  description:
    "Discover archaeological sites and ancient temples across Cambodia. Explore Angkor Wat, Bayon, Ta Prohm, and hundreds of historic Khmer temples with detailed histories, maps, and visitor guides.",
  keywords: [
    "Cambodia temples",
    "Angkor Wat",
    "Khmer Empire",
    "Cambodian archaeology",
    "Siem Reap",
    "ancient temples",
    "Bayon",
    "Ta Prohm",
  ],
  authors: [{ name: "CamArch" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CamArch",
    title: "CamArch – Cambodian Archaeological Discovery Platform",
    description:
      "Discover and explore the ancient temples and archaeological sites of Cambodia.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CamArch – Cambodian Archaeological Discovery Platform",
    description:
      "Discover and explore the ancient temples and archaeological sites of Cambodia.",
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
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
