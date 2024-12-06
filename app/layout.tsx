import { geistSans, geistMono } from "./utils/fonts";
import { siteMetadata } from "./config/metadata";
import "./globals.css";
import FloatingHeader from "@/components/ui/FloatingHeader";
import Providers from "./providers";
import { Footer } from "@/components/Footer";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <Providers initialSession={session}>
          <div className="flex flex-col min-h-screen">
            <FloatingHeader />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
