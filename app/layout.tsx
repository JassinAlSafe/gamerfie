import { geistSans, geistMono } from "./utils/fonts";
import { siteMetadata } from "./config/metadata";
import "./globals.css";
import FloatingHeader from "@/components/ui/FloatingHeader";
import Providers from "./providers";
import { Footer } from "@/components/Footer";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { User } from "@/types/types";

export const metadata = siteMetadata;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;

    const extendedUser: User | null = user
      ? { ...user, name: user.user_metadata?.name || 'Unknown' }
      : null;

    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
          <Providers initialSession={null} initialUser={extendedUser}>
            <div className="flex flex-col min-h-screen">
              <FloatingHeader user={extendedUser} />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </Providers>
        </body>
      </html>
    );
  } catch (error) {
    // Fallback layout in case of auth error
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
          <Providers initialSession={null} initialUser={null}>
            <div className="flex flex-col min-h-screen">
              <FloatingHeader user={null} />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </Providers>
        </body>
      </html>
    );
  }
}