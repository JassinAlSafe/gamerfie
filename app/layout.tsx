"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import FloatingHeader from "@/components/ui/FloatingHeader";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import SupabaseProvider from "@/components/providers/supabase-provider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <SupabaseProvider initialSession={null}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              <div className="min-h-screen flex flex-col">
                <FloatingHeader />
                <Button
                  onClick={() => toast.success("Test toast!")}
                  className="fixed bottom-4 right-4 z-50"
                >
                  Test Toast
                </Button>
                <main className="flex-1 pt-16">{children}</main>
              </div>
              <Toaster richColors position="top-center" />
            </ThemeProvider>
          </SupabaseProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
