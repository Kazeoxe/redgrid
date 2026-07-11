"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { registerSW } from "./lib/registerSW";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
  }));
  useEffect(() => { registerSW(); }, []);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
