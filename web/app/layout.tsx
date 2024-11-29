// @ts-ignore
import { Metadata } from "next";
import { Inter } from "next/font/google";
import clsx from "clsx";

import "@/styles/globals.css";
import { Navbar } from "@/components/navbar.js";
import { Providers } from "./providers.js";
import { Footer } from "@/components/footer.js";

export const metadata: Metadata = {
  title: "Pod Pay",
  description: "",
  icons: {
    icon: "/favicon.ico",
  },
};

const _FONT = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          _FONT.variable
        )}
      >
        <Providers>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container mx-auto max-w-7xl px-6 flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
