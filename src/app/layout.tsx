import type { Metadata } from "next";
import { Playfair_Display, Lora, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "The Crisis Index — Why Everything Feels Like It's Shifting",
  description:
    "Six structural forces. One composite score. An interactive framework for understanding why the world feels like it's breaking — and what to do about it.",
  openGraph: {
    title: "The Crisis Index",
    description:
      "Six structural forces. One composite score. A framework for why everything feels like it's shifting.",
    url: "https://thecrisisindex.com",
    siteName: "The Crisis Index",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Crisis Index",
    description:
      "Six structural forces. One composite score. A framework for why everything feels like it's shifting.",
  },
  metadataBase: new URL("https://thecrisisindex.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${lora.variable} ${jetbrains.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
