import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/organisms/header"
import { AuthProvider } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MovieFlix - Stream Movies Online",
  description: "Discover and stream your favorite movies with MovieFlix",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Hide v0 widget
              const hideV0Widget = () => {
                const widgets = document.querySelectorAll('[data-v0-widget], iframe[src*="v0"], [class*="v0"]');
                widgets.forEach(widget => {
                  widget.style.display = 'none';
                });
              };
              
              // Run on load and periodically
              document.addEventListener('DOMContentLoaded', hideV0Widget);
              setInterval(hideV0Widget, 1000);
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <AuthProvider>
          <Header />
          <main className="pt-16">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
