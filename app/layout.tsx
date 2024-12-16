import { geistSans, geistMono } from "./utils/fonts";
import { siteMetadata } from "./config/metadata";
import "./globals.css";
import "../styles/game-card.css";
import FloatingHeader from "@/components/ui/FloatingHeader";
import Providers from "./providers";
import { Footer } from "@/components/Footer";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import '@/styles/carousel.css'
import { Toaster } from 'react-hot-toast';
import { headers } from 'next/headers';

export const metadata = siteMetadata;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-950`}
      >
        <Providers initialSession={session}>
          <div className="flex flex-col min-h-screen">
            <FloatingHeader />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}
