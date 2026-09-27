import type { Metadata } from "next";
import { Playfair_Display, Geist } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secure Quiz Wrapper | Controlled Assessment Environment",
  description: "Secure Google & MS Forms wrapper with live focus tracking and QR code distribution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${geist.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans max-w-[100vw] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
