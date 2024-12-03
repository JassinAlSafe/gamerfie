import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import FloatingHeader from "@/components/ui/FloatingHeader";
import Providers from "./provider";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "next-themes";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { User } from "@/types/types"; // Adjust the import path as needed

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Track your gaming habits",
  description: "Earn rewards for playing games",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createServerComponentClient({ cookies });
<<<<<<< HEAD

  let extendedUser: User | null = null;

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;

    extendedUser = user
      ? { ...user, name: user.user_metadata?.name || "Unknown" }
      : null;
  } catch (error) {
    console.error("Error fetching user:", error);
  }
=======
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Extend the Supabase user with the required properties
  const extendedUser: User | null = user
    ? { ...user, name: user.user_metadata?.name || 'Unknown' }
    : null;
>>>>>>> parent of b1374a3 (Merge pull request #14 from JassinAlSafe/profile-bug-fix)

  return (
    <html lang="en" suppressHydrationWarning>
      <body
<<<<<<< HEAD
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <Providers
          initialSession={null} // Pass session data here if available
          initialUser={extendedUser}
        >
          <div className="flex flex-col min-h-screen">
            <FloatingHeader user={extendedUser} />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
=======
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers initialSession={null} initialUser={extendedUser}>
            <FloatingHeader user={extendedUser} />
            {children}
            <Footer />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
>>>>>>> parent of b1374a3 (Merge pull request #14 from JassinAlSafe/profile-bug-fix)
