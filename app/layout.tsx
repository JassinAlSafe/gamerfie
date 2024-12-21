import { geistSans, geistMono } from "./utils/fonts";
import { siteMetadata } from "./config/metadata";
import "./globals.css";
import "../styles/game-card.css";
import FloatingHeader from "@/components/ui/FloatingHeader";
import Providers from "./providers";
import { Footer } from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import "@/styles/carousel.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AuthProvider from "@/components/auth/AuthProvider";

export const metadata = siteMetadata;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-950`}
      >
        <AuthProvider session={session}>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <FloatingHeader />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </Providers>
        </AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#333",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
}
