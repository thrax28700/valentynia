import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './http';

/** Client TanStack Query partagé (cache des données serveur). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        // Pas de retry sur les erreurs client (4xx).
        if (error instanceof ApiError && error.status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: false,
    },
  },
});
