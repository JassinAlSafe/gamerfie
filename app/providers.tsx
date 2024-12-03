"use client";

import { useState, createContext, useContext, memo } from "react";
import { Session } from "@supabase/auth-helpers-nextjs";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { User } from "@/types/types";
import { ThemeProvider } from "next-themes";

// Types and Context
interface ProvidersProps {
  children: React.ReactNode;
  initialSession: Session | null;
  initialUser: User | null;
}

const UserContext = createContext<User | null>(null);

// Hooks
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Error fallback component for ErrorBoundary
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
      <p className="text-red-500">{error.message}</p>
    </div>
  </div>
);

// Providers Component
const Providers = memo(
  ({ children, initialSession, initialUser }: ProvidersProps) => {
    const [supabase] = useState(() => createClientComponentClient());
    const [queryClient] = useState(() => new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    }));

    return (
      <ReactErrorBoundary FallbackComponent={ErrorFallback}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SessionContextProvider
              supabaseClient={supabase}
              initialSession={initialSession}
            >
              <UserContext.Provider value={initialUser}>
                {children}
                {process.env.NODE_ENV === "development" && (
                  <ReactQueryDevtools initialIsOpen={false} />
                )}
              </UserContext.Provider>
            </SessionContextProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ReactErrorBoundary>
    );
  }
);

Providers.displayName = "Providers";
export default Providers;
