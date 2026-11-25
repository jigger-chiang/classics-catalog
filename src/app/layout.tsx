import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Noto_Serif_TC } from "next/font/google";
import "./globals.css";
import { NavBarAutocomplete } from "@/components/NavBarAutocomplete";
import { ScrollToTop } from "@/components/ScrollToTop";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Used for the Chinese story text. CJK fonts are large, so don't preload.
const notoSerifTC = Noto_Serif_TC({
  variable: "--font-noto-serif-tc",
  weight: ["400", "500"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Cocktail Classics",
  description: "A curated catalog of classic cocktails.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${inter.variable} ${notoSerifTC.variable} bg-ink font-sans text-ivory antialiased`}
      >
        <ScrollToTop />
        <NavBarAutocomplete />
        {children}
      </body>
    </html>
  );
}
