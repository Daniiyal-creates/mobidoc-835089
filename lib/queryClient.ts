import { QueryClient } from '@tanstack/react-query';

/**
 * Diagnoses and shop searches both cost money per call, so cached results are
 * held long enough that going back and forth between screens does not refetch.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
