import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

const inter = Inter({ subsets: ["latin"] })


export const metadata = {
  title: "Premium Chauffeur Services",
  description: "Experience luxury transportation with our professional chauffeur services",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <meta charSet="UTF-8" />
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}



