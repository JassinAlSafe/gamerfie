"use client";

import { useState, createContext, useContext } from "react";
import { Session } from "@supabase/auth-helpers-nextjs";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { User } from "@/types/types"; // Adjust the import path as needed

interface ProvidersProps {
  children: React.ReactNode;
  initialSession: Session | null;
  initialUser: User | null;
}

const UserContext = createContext<User | null>(null);

export const useUser = () => useContext(UserContext);

export default function Providers({
  children,
  initialSession,
  initialUser,
}: ProvidersProps) {
  const [supabase] = useState(() => createClientComponentClient());
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 60 * 60 * 1000, // 1 hour
          },
        },
      })
  );

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={initialSession}
    >
      <UserContext.Provider value={initialUser}>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </UserContext.Provider>
    </SessionContextProvider>
  );
}