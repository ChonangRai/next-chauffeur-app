import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import LayoutWithConditionalHeaderFooter from "@/components/ui/LayoutWithConditionalHeaderFooter";
import { ReactNode } from "react";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Premium Chauffeur Services",
  description: "Experience luxury transportation with our professional chauffeur services",
  metadataBase: new URL('https://londonchauffeurhire.com'),
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <meta charSet="UTF-8" />
      <body className={inter.className}>
        <LayoutWithConditionalHeaderFooter>
          {children}
        </LayoutWithConditionalHeaderFooter>
      </body>
    </html>
  )
}
