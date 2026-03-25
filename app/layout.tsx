import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "./providers"
import "./globals.css"
import { cn } from "@/lib/utils"
import Script from "next/script"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
   title: "Golf Fair - Charity Golf Platform",
   description: "Premium golf scoring platform with charity integration and monthly draws",
   generator: "v0.app",
   icons: {
      icon: [
         {
            url: "/icon-light-32x32.png",
            media: "(prefers-color-scheme: light)",
         },
         {
            url: "/icon-dark-32x32.png",
            media: "(prefers-color-scheme: dark)",
         },
         {
            url: "/icon.svg",
            type: "image/svg+xml",
         },
      ],
      apple: "/apple-icon.png",
   },
}

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode
}>) {
   return (
      <html lang="en" className="dark" suppressHydrationWarning>
         <body className={cn(_geist.className, _geistMono.className)} suppressHydrationWarning>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
            <Providers>{children}</Providers>
            <Analytics />
         </body>
      </html>
   )
}
