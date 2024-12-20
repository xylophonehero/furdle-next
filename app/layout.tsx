import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Furdle",
  description: "It’s not fun - It’s Furdle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-dvh flex flex-col px-4 py-4 md:py-8`}
      >
        <header className="flex flex-col items-center justify-center gap-2 px-4">
          <h1 className="text-lg md:text-3xl font-bold uppercase">Furdle</h1>
        </header>
        <main className="flex-1 flex flex-col py-2">{children}</main>
        <footer>

        </footer>
      </body>
    </html>
  );
}
