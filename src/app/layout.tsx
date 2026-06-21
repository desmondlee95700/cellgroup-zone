import type { Metadata } from "next";
import { Inter, Alfa_Slab_One } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const alfaSlabOne = Alfa_Slab_One({
  variable: "--font-alfa-slab-one",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zone Games Gathering",
  description: "A chaotic games gathering web app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${alfaSlabOne.variable} antialiased selection:bg-black selection:text-[#FACC15]`}
    >
      <body className="min-h-screen font-inter">{children}</body>
    </html>
  );
}
