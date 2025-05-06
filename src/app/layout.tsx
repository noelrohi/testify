import "@/styles/globals.css";

import type { Metadata } from "next";
import { Funnel_Display, Lexend_Deca, Outfit } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { TrpcReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: {
    default: "Trustify",
    template: "%s | Trustify",
  },
  description: "Get testimonials from your customers for free",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const funnel_display = Funnel_Display({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--display-family",
});

const lexend_deca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--text-family",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${funnel_display.variable} ${lexend_deca.variable}`}
    >
      <body>
        <TrpcReactProvider>{children}</TrpcReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
